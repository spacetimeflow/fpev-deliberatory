/**
 * server.ts — serve-on-demand (P2, D3). Transient: lives while the workbench
 * is in use, owns no state (A6/A3), renders from files at request time (A7).
 * Routes: GET / → cockpit HTML; GET /api/state → derived ProjectState JSON.
 */

import * as http from "node:http";
import * as path from "node:path";
import * as fs from "node:fs";
import * as os from "node:os";
import { marked } from "marked";
import { readProject } from "../state/reader.js";
import { renderCockpit, type CrossCycleRow } from "../render/cockpit.js";
import {
  renderFeedbackForm,
  renderFrameForm,
  renderVerifyForm,
} from "../forms/render.js";
import { writeFeedbackHandoff, writeFrameHandoff, writeVerifyHandoff, writeHarnessFeedback } from "../forms/writers.js";
import { listPending, listFeedback, recordFeedback, markAddressed, readReply } from "../feedback/inbox.js";
import { isTrustedNetwork } from "../feedback/trust.js";
import { runPredicate } from "../gate/predicates.js";
import { installPredicateHook } from "../gate/hook-install.js";
import { exportAllSurfaces, exportWiki, exportSurfaces, sharedWikiTopicsDir, collectWiki, wikiViewRel } from "../render/export.js";
import { extractFraming } from "../render/framing.js";
import { SseHub } from "./sse.js";
import { watchProject } from "./watch.js";
import { createThread, appendTurn, readThread, listThreads } from "../chat/thread.js";
import { mdBody } from "../render/frontmatter-view.js";

/** The person whose handle goes on what the cockpit writes (FPEV_PERSON; else the login name). */
const PERSON = process.env.FPEV_PERSON || os.userInfo().username;

/** Remote feedback (2026-08-09): FEEDBACK_TOKEN set → the feedback APIs require it.
 * Header X-Feedback-Token or ?token=. Unset → LAN trust unchanged (backward compatible). */
const feedbackToken = process.env.FEEDBACK_TOKEN ?? "";
const feedbackStrict = process.env.FEEDBACK_STRICT === "1"; // tests only: no trusted-network exception
function feedbackAuthed(req: http.IncomingMessage): boolean {
  if (!feedbackToken) return true;
  const h = req.headers["x-feedback-token"];
  const q = new URL(req.url ?? "/", "http://localhost").searchParams.get("token");
  if (h === feedbackToken || q === feedbackToken) return true;
  if (feedbackStrict) return false; // strict mode: the token is required from everyone
  return isTrustedNetwork(req.socket.remoteAddress); // your networks need no token
}
function feedbackDenied(res: http.ServerResponse): void {
  res.statusCode = 401;
  res.end(JSON.stringify({ ok: false, error: "feedback token required (FEEDBACK_TOKEN)" }));
}

const MD_STYLE = `<style>:root{color-scheme:dark}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:#0f1115;color:#d7dae0;margin:0;padding:24px;max-width:820px;line-height:1.6;font-size:14px}
h1,h2,h3{color:#e6e9ef;border-bottom:1px solid #23272f;padding-bottom:4px}code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:#171a21;border:1px solid #23272f;border-radius:4px;padding:1px 5px;font-size:12px}pre{background:#171a21;border:1px solid #23272f;border-radius:6px;padding:10px;overflow-x:auto}pre code{border:0}table{border-collapse:collapse}td,th{border:1px solid #23272f;padding:5px 9px}blockquote{border-left:3px solid #2c313c;margin:0;padding-left:12px;color:#8b93a3}a{color:#6db3f2}.mut{color:#8b93a3;font-size:12px}</style>`;

/** Escape for embedding raw text into HTML (code view). */
function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const CODE_EXTS = new Set([".tex", ".bib", ".py", ".ts", ".js", ".json", ".sh", ".yaml", ".yml", ".csv", ".txt", ".dat", ".log", ".out"]);
const IMG_EXTS = new Set([".png", ".jpg", ".jpeg", ".svg", ".gif"]);

/** Relative links inside a rendered .md resolve against the file's own folder, not /view
 *  (fix 2026-09-25): href → /view?path=<dir>/<target>, src → /files/<dir>/<target>. */
function rewriteRelativeLinks(html: string, rel: string): string {
  const dir = path.posix.dirname(rel.split(path.sep).join("/"));
  const isRelative = (u: string) => !/^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(u);
  const resolve = (u: string) => path.posix.normalize(path.posix.join(dir, u));
  return html
    .replace(/href="([^"]+)"/g, (m, u: string) => {
      if (!isRelative(u)) return m;
      const [target, hash] = u.split("#");
      return `href="/view?path=${encodeURIComponent(resolve(decodeURIComponent(target)))}${hash ? "#" + hash : ""}"`;
    })
    .replace(/src="([^"]+)"/g, (m, u: string) => (isRelative(u) ? `src="/files/${encodeURIComponent(resolve(decodeURIComponent(u)))}"` : m));
}

/** Render a project file as a readable view — type-aware (md → HTML, pdf → embed, code → pre). */
function serveFileView(projectDir: string, rel: string, res: http.ServerResponse, inline = false): void {
  const root = path.resolve(projectDir);
  const parent = path.dirname(projectDir);
  const allowed = [root, path.resolve(parent, "wiki"), path.resolve(parent, "references"), path.resolve(parent, "explorations")];
  const full = path.resolve(root, rel);
  const ok = allowed.some((r) => full === r || full.startsWith(r + path.sep));
  if (!ok) {
    res.statusCode = 403;
    res.end("forbidden");
    return;
  }
  if (!fs.existsSync(full) || !fs.statSync(full).isFile()) {
    res.statusCode = 404;
    res.end("not found");
    return;
  }
  const name = path.basename(full);
  const ext = path.extname(name).toLowerCase();
  const enc = (p: string) => encodeURIComponent(p);
  const meta = `<p class="mut">${rel} · <a href="/files/${enc(rel)}">open the file</a>` +
    (ext === ".md" && fs.existsSync(path.join(root, "workbench", "surfaces", name.replace(/\.md$/, "") + "-cards.html"))
      ? ` · <a href="/files/workbench/surfaces/${enc(name.replace(/\.md$/, "") + "-cards.html")}">cards surface</a>`
      : "") +
    `</p>`;

  let content: string;
  if (ext === ".md") {
    // the working renderer, with the YAML removed: the reader sees the body only
    content = rewriteRelativeLinks(marked.parse(mdBody(fs.readFileSync(full, "utf8"))) as string, rel);
  } else if (ext === ".pdf") {
    content = `<embed src="/files/${enc(rel)}" type="application/pdf" style="width:100%;height:640px;border:1px solid #23272f;border-radius:6px">`;
  } else if (CODE_EXTS.has(ext)) {
    const raw = fs.readFileSync(full, "utf8");
    content = `<pre style="white-space:pre-wrap;font-family:ui-monospace,Menlo,monospace;font-size:12px;background:#171a21;border:1px solid #23272f;border-radius:6px;padding:12px;overflow-x:auto;line-height:1.5">${escHtml(raw)}</pre>`;
  } else if (IMG_EXTS.has(ext)) {
    content = `<img src="/files/${enc(rel)}" style="max-width:100%;border-radius:6px">`;
  } else {
    content = `<p class="mut">No preview for .${ext.slice(1)} — <a href="/files/${enc(rel)}">open the file</a>.</p>`;
  }

  const body = meta + content;
  if (inline) {
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.end(`<div class="md-inline">${body}</div>`);
    return;
  }
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(`<!doctype html><html><head><meta charset="utf-8"><title>${name} — view</title>${MD_STYLE}</head><body>${body}</body></html>`);
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => {
      data += c;
      if (data.length > 1_000_000) reject(new Error("body too large"));
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  // source/data files display in the browser instead of downloading (2026-09-25)
  ".tex": "text/plain; charset=utf-8",
  ".bib": "text/plain; charset=utf-8",
  ".py": "text/plain; charset=utf-8",
  ".ts": "text/plain; charset=utf-8",
  ".sh": "text/plain; charset=utf-8",
  ".yaml": "text/plain; charset=utf-8",
  ".yml": "text/plain; charset=utf-8",
  ".csv": "text/plain; charset=utf-8",
  ".dat": "text/plain; charset=utf-8",
  ".log": "text/plain; charset=utf-8",
  ".out": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

/** List md files in {project}/{sub} + the shared ../{sub} (for the References/Explorations panels). */
function collectDirMd(projectDir: string, sub: string): { name: string; rel: string; shared: boolean }[] {
  const out: { name: string; rel: string; shared: boolean }[] = [];
  const dirs: { d: string; shared: boolean }[] = [{ d: path.join(projectDir, sub), shared: false }];
  const shared = path.join(path.dirname(projectDir), sub);
  if (shared !== dirs[0].d && fs.existsSync(shared)) dirs.push({ d: shared, shared: true });
  for (const { d, shared: isShared } of dirs) {
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d).filter((x) => x.endsWith(".md") && !x.startsWith(".")).sort()) {
      out.push({ name: f, rel: (isShared ? `../${sub}/` : `${sub}/`) + f, shared: isShared });
    }
  }
  return out;
}

/** The project's deliverables: files in dist/ PLUS plan-declared deliverable paths that exist
 *  (research projects: pdf/tex/code — whatever the Plan names and the project produces). */
function collectDeliverables(projectDir: string, handoffs: { body: string; isRevision: boolean }[]): { name: string; rel: string; ext: string }[] {
  const out: { name: string; rel: string; ext: string }[] = [];
  const seen = new Set<string>();
  // cycle-record handoffs are records, not output deliverables (stage-* handoffs, feedback).
  // Everything else that the Plan names and that exists is a deliverable: the shape's documents
  // (wiki topics, references, word records, surfaces, README) included.
  const INTERNAL = /^handoffs\/stage-/;
  const add = (rel: string) => {
    if (INTERNAL.test(rel)) return; // a handoff/record is not a deliverable
    const full = path.resolve(projectDir, rel);
    if (!fs.existsSync(full) || !fs.statSync(full).isFile()) return;
    if (seen.has(rel)) return;
    seen.add(rel);
    out.push({ name: path.basename(rel), rel, ext: path.extname(rel).toLowerCase() });
  };
  const dist = path.join(projectDir, "dist");
  if (fs.existsSync(dist)) {
    for (const f of fs.readdirSync(dist).filter((x) => !x.startsWith(".")).sort()) add(`dist/${f}`);
  }
  const DELIV_RE = /^\s*[-*]\s+(`?)([\w./-]+\.(?:pdf|tex|py|ts|js|json|sh|yaml|yml|md|txt|csv|png|jpg|jpeg|svg|html))\1/;
  for (const h of handoffs) {
    if (h.isRevision) continue;
    const lines = h.body.split(/\r?\n/);
    let inPhase = false;
    for (const line of lines) {
      if (/^#{2,4}\s+P\d+/.test(line)) {
        inPhase = true;
        continue;
      }
      if (/^#{2,}/.test(line)) {
        inPhase = false;
        continue;
      }
      if (inPhase) {
        const m = line.match(DELIV_RE);
        if (m) add(m[2]);
      }
    }
  }
  return out;
}

function json(res: http.ServerResponse, code: number, obj: unknown): void {
  res.statusCode = code;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.end(JSON.stringify(obj, null, 2));
}

function serveStatic(projectDir: string, rel: string, res: http.ServerResponse): void {
  const root = path.resolve(projectDir);
  const parent = path.dirname(projectDir);
  const full = path.resolve(root, rel);
  // traversal guard: the resolved path must stay inside the project root or one of the shared
  // sibling folders that serveFileView already allows (../wiki, ../references, ../explorations).
  // Without this, /view embeds /files/../references/x.pdf and the embed 403s (fix 2026-09-25).
  const allowed = [root, path.resolve(parent, "wiki"), path.resolve(parent, "references"), path.resolve(parent, "explorations")];
  if (!allowed.some((r) => full === r || full.startsWith(r + path.sep))) {
    res.statusCode = 403;
    res.end("forbidden");
    return;
  }
  if (!fs.existsSync(full) || !fs.statSync(full).isFile()) {
    res.statusCode = 404;
    res.end("not found");
    return;
  }
  const ext = path.extname(full).toLowerCase();
  res.setHeader("content-type", MIME[ext] ?? "application/octet-stream");
  res.end(fs.readFileSync(full));
}

export function createServer(
  projectDir: string,
  opts: { roots?: string[] } = {}
): http.Server {
  const roots = opts.roots && opts.roots.length ? opts.roots : [projectDir];
  const hub = new SseHub();
  // Two-hop refresh: any change under handoffs/ or conversations/ broadcasts to open tabs
  // AND regenerates the derived surfaces/wiki — directories stay current dynamically (design
  // revision: no fixed snapshot; the tool updates itself as files change).
  const watchHandle = watchProject(projectDir, () => {
    hub.broadcast({ type: "changed", at: new Date().toISOString() });
    try {
      exportAllSurfaces(projectDir);
      exportWiki(projectDir);
    } catch {
      /* derived outputs are best-effort */
    }
  });

  return http.createServer((req, res) => {
    const url = (req.url ?? "/").split("?")[0];
    if (url.startsWith("/files/")) {
      serveStatic(projectDir, decodeURIComponent(url.slice("/files/".length)), res);
      return;
    }
    if (url === "/view") {
      const q = new URL(req.url ?? "/", "http://localhost");
      const p = q.searchParams.get("path") ?? "";
      const inline = q.searchParams.get("inline") === "1";
      serveFileView(projectDir, p, res, inline);
      return;
    }
    if (url === "/api/framing") {
      json(res, 200, extractFraming(readProject(projectDir).handoffs));
      return;
    }
    if (url === "/api/deliverables") {
      json(res, 200, { items: collectDeliverables(projectDir, readProject(projectDir).handoffs) });
      return;
    }
    if (url === "/api/references") {
      json(res, 200, { items: collectDirMd(projectDir, "references") });
      return;
    }
    if (url === "/api/explorations") {
      json(res, 200, { items: collectDirMd(projectDir, "explorations") });
      return;
    }
    if (url === "/api/wiki") {
      const topics = collectWiki(path.join(projectDir, "wiki", "topics"), sharedWikiTopicsDir(projectDir));
      json(res, 200, {
        topics: topics.map((t) => ({
          name: t.name,
          title: t.title,
          family: t.family,
          rel: wikiViewRel(t),
          shared: t.shared,
        })),
      });
      return;
    }
    if (url === "/api/threads" && req.method === "GET") {
      json(res, 200, { threads: listThreads(projectDir) });
      return;
    }
    const threadMatch = url.match(/^\/api\/threads\/([^/]+)$/);
    if (threadMatch && req.method === "GET") {
      json(res, 200, { id: threadMatch[1], turns: readThread(projectDir, threadMatch[1]) });
      return;
    }
    if (url === "/api/threads" && req.method === "POST") {
      readBody(req)
        .then((raw) => {
          const b = new URLSearchParams(raw);
          const r = createThread(projectDir, b.get("id") ?? "chat");
          json(res, r.ok ? 200 : 400, r);
        })
        .catch((e) => json(res, 500, { ok: false, error: String(e) }));
      return;
    }
    const turnMatch = url.match(/^\/api\/threads\/([^/]+)\/turns$/);
    if (turnMatch && req.method === "POST") {
      readBody(req)
        .then((raw) => {
          const b = new URLSearchParams(raw);
          const r = appendTurn(projectDir, turnMatch[1], {
            agent: b.get("agent") ?? PERSON,
            role: (b.get("role") as "user" | "assistant") ?? "user",
            text: b.get("text") ?? "",
          });
          json(res, r.ok ? 200 : 400, r);
        })
        .catch((e) => json(res, 500, { ok: false, error: String(e) }));
      return;
    }
    if (url === "/api/events") {
      res.writeHead(200, {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-cache",
        connection: "keep-alive",
      });
      res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);
      hub.add(res);
      return;
    }
    if (url === "/api/state") {
      const st = readProject(projectDir);
      json(res, 200, { ...st, derivedAt: new Date().toISOString() });
      return;
    }
    if (url === "/form/feedback") {
      const st = readProject(projectDir);
      res.setHeader("content-type", "text/html; charset=utf-8");
      res.end(renderFeedbackForm(st, path.basename(projectDir), PERSON));
      return;
    }
    if (url === "/form/framing") {
      res.setHeader("content-type", "text/html; charset=utf-8");
      res.end(renderFrameForm(path.basename(projectDir), PERSON));
      return;
    }
    if (url === "/form/verify") {
      res.setHeader("content-type", "text/html; charset=utf-8");
      res.end(renderVerifyForm(path.basename(projectDir), PERSON));
      return;
    }
    if (url === "/api/export" && req.method === "POST") {
      readBody(req)
        .then((raw) => {
          const b = new URLSearchParams(raw);
          const handoff = b.get("handoff");
          const r = handoff ? exportSurfaces(projectDir, handoff) : exportAllSurfaces(projectDir);
          json(res, r.ok ? 200 : 500, r);
        })
        .catch((e) => json(res, 500, { ok: false, error: String(e) }));
      return;
    }
    if (url === "/api/export/wiki" && req.method === "POST") {
      const r = exportWiki(projectDir);
      json(res, r.ok ? 200 : 500, r);
      return;
    }
    if (url === "/api/gate/run" && req.method === "POST") {
      readBody(req)
        .then((raw) => {
          const b = new URLSearchParams(raw);
          const name = b.get("predicate") ?? "";
          const params: Record<string, string> = {};
          for (const [k, v] of b) if (k.startsWith("param.")) params[k.slice(6)] = v;
          const st = readProject(projectDir);
          const r = runPredicate(st, { name, params });
          json(res, r.ok ? 200 : 200, { ok: r.ok, message: r.message, exit: r.ok ? 0 : 1 });
        })
        .catch((e) => json(res, 500, { ok: false, error: String(e) }));
      return;
    }
    if (url === "/api/gate/install" && req.method === "POST") {
      readBody(req)
        .then((raw) => {
          const b = new URLSearchParams(raw);
          const name = b.get("predicate") ?? "";
          const params: Record<string, string> = {};
          for (const [k, v] of b) if (k.startsWith("param.")) params[k.slice(6)] = v;
          const toolRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
          const r = installPredicateHook(projectDir, { name, params }, toolRoot);
          json(res, r.ok ? 200 : 400, r);
        })
        .catch((e) => json(res, 500, { ok: false, error: String(e) }));
      return;
    }
    if (url === "/api/forms/feedback" && req.method === "POST") {
      if (!feedbackAuthed(req)) { feedbackDenied(res); return; }
      readBody(req)
        .then((raw) => {
          const body = new URLSearchParams(raw);
          const target = body.get("target") ?? "unknown";
          const author = body.get("author") ?? PERSON;
          const stageM = target.match(/^stage-(\d+)/);
          const stage = stageM
            ? `${stageM[1]}-${({ 1: "frame", 2: "plan", 3: "execute", 4: "verify" } as Record<string, string>)[stageM[1]] ?? ""}`
            : "plan";
          const answers: { id: string; decision: string; reasoning: string; wording?: string }[] = [];
          const ids = new Set(
            [...body.keys()].filter((k) => k.endsWith(".decision")).map((k) => k.split(".")[0])
          );
          for (const id of ids) {
            answers.push({
              id,
              decision: body.get(`${id}.decision`) ?? "approve",
              reasoning: body.get(`${id}.reasoning`) ?? "",
              wording: body.get(`${id}.wording`) || undefined,
            });
          }
          const resWrite = writeFeedbackHandoff(projectDir, {
            project: path.basename(projectDir),
            stage,
            target,
            author,
            answers,
          });
          if (resWrite.ok && resWrite.path) {
            recordFeedback(projectDir, {
              kind: "replies",
              file: path.basename(resWrite.path),
              author,
              date: new Date().toISOString().slice(0, 10),
            });
            hub.broadcast({ type: "feedback:new", pending: listPending(projectDir).length });
          }
          json(res, resWrite.ok ? 200 : 500, resWrite);
        })
        .catch((e) => json(res, 500, { ok: false, error: String(e) }));
      return;
    }
    if (url === "/api/forms/framing" && req.method === "POST") {
      readBody(req)
        .then((raw) => {
          const b = new URLSearchParams(raw);
          const author = b.get("author") ?? PERSON;
          const resWrite = writeFrameHandoff(projectDir, {
            project: b.get("project") ?? path.basename(projectDir),
            author,
            tldr: b.get("tldr") ?? "",
            problem: b.get("problem") ?? "",
            principles: b.get("principles") ?? "",
            constraints: b.get("constraints") ?? "",
            gaps: b.get("gaps") ?? "",
            audience: b.get("audience") ?? "",
          });
          json(res, resWrite.ok ? 200 : 500, resWrite);
        })
        .catch((e) => json(res, 500, { ok: false, error: String(e) }));
      return;
    }
    if (url === "/api/forms/harness-feedback" && req.method === "POST") {
      if (!feedbackAuthed(req)) { feedbackDenied(res); return; }
      readBody(req)
        .then((raw) => {
          const b = new URLSearchParams(raw);
          const st = readProject(projectDir);
          const r = writeHarnessFeedback(projectDir, {
            project: path.basename(projectDir),
            stage: st.currentStage || "4-verify",
            author: b.get("author") ?? PERSON,
            feedback: b.get("feedback") ?? "",
          });
          if (r.ok && r.path) {
            recordFeedback(projectDir, {
              kind: "harness",
              file: path.basename(r.path),
              author: b.get("author") ?? PERSON,
              date: new Date().toISOString().slice(0, 10),
            });
            hub.broadcast({ type: "feedback:new", pending: listPending(projectDir).length });
          }
          json(res, r.ok ? 200 : 400, r);
        })
        .catch((e) => json(res, 500, { ok: false, error: String(e) }));
      return;
    }
    if (url === "/api/feedback/pending" && req.method === "GET") {
      if (!feedbackAuthed(req)) { feedbackDenied(res); return; }
      json(res, 200, { ok: true, items: listPending(projectDir) });
      return;
    }
    if (url === "/api/feedback/list" && req.method === "GET") {
      if (!feedbackAuthed(req)) { feedbackDenied(res); return; }
      json(res, 200, { ok: true, items: listFeedback(projectDir).slice().reverse() });
      return;
    }
    if (url === "/api/feedback/reply" && req.method === "GET") {
      if (!feedbackAuthed(req)) { feedbackDenied(res); return; }
      const q = new URL(req.url ?? "/", "http://localhost");
      const file = q.searchParams.get("file") ?? "";
      if (!/^[a-zA-Z0-9._-]+\.md$/.test(file)) { json(res, 400, { ok: false, error: "bad file" }); return; }
      json(res, 200, { ok: true, file, reply: readReply(projectDir, file) });
      return;
    }
    if (url === "/api/feedback/address" && req.method === "POST") {
      if (!feedbackAuthed(req)) { feedbackDenied(res); return; }
      readBody(req)
        .then((raw) => {
          const b = new URLSearchParams(raw);
          const r = markAddressed(
            projectDir,
            b.get("id") ?? "",
            b.get("addressedBy") ?? PERSON,
            new Date().toISOString().slice(0, 10),
            b.get("reply") || undefined
          );
          json(res, r.ok ? 200 : 400, r);
        })
        .catch((e) => json(res, 500, { ok: false, error: String(e) }));
      return;
    }
    if (url === "/api/forms/verify" && req.method === "POST") {
      readBody(req)
        .then((raw) => {
          const b = new URLSearchParams(raw);
          const author = b.get("author") ?? PERSON;
          const resWrite = writeVerifyHandoff(projectDir, path.basename(projectDir), author, [
            {
              id: b.get("id") ?? "P0",
              verdict: b.get("verdict") ?? "judged",
              teachback: b.get("teachback") ?? "",
              gapEvidence: b.get("gapevidence") || undefined,
            },
          ]);
          json(res, resWrite.ok ? 200 : 500, resWrite);
        })
        .catch((e) => json(res, 500, { ok: false, error: String(e) }));
      return;
    }

/** The remote feedback page: the feedbacker's limited surface. Only the feedback channel —
 * never handoffs, wiki, or references. The token (from ?token=) gates every API call. */
function renderFeedbackPage(project: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${project} — remote feedback</title>
<style>
:root{color-scheme:dark}
body{font-family:ui-monospace,Menlo,monospace;background:#0f1115;color:#d7dae0;margin:0;padding:24px;max-width:760px}
h1{font-size:15px;color:#e6e9ef;border-bottom:1px solid #23272f;padding-bottom:8px}
.mut{color:#8b93a3;font-size:12px}
.box{background:#12151b;border:1px solid #23272f;border-radius:8px;padding:14px;margin:12px 0}
textarea{width:100%;background:#171a21;color:#d7dae0;border:1px solid #2c313c;border-radius:6px;padding:8px;font:inherit;font-size:13px;min-height:110px;box-sizing:border-box}
input{background:#171a21;color:#d7dae0;border:1px solid #2c313c;border-radius:6px;padding:6px 8px;font:inherit;font-size:12px}
button{margin-top:8px;padding:6px 14px;background:#1c5c33;color:#fff;border:0;border-radius:6px;cursor:pointer;font:inherit;font-size:12px}
.row{padding:10px 0;border-bottom:1px solid #171a21;font-size:12px}
.id{font-weight:600;color:#d7dae0}
.pill{display:inline-block;padding:1px 8px;border-radius:10px;font-size:11px}
.pill.p{background:#3a2d10;color:#f2c14e}.pill.a{background:#12311c;color:#6fdc8c}
.reply{background:#0f1a14;border-left:3px solid #2c5c3c;padding:8px 10px;margin:6px 0 2px;white-space:pre-wrap;font-size:12px;color:#b8c4bd;display:none}
.ok{color:#6fdc8c;font-size:12px}.err{color:#f77;font-size:12px}
</style></head><body>
<h1>${project} — remote feedback</h1>
<p class="mut">The feedback channel only: what you send lands in the project's inbox, the harness
replies into your feedback thread, and you see the exchange here. Nothing else in the project
is visible from this page.</p>
<div class="box">
  <label class="mut">Your name</label><br><input id="fb-author" value="remote" style="margin:6px 0 10px">
  <label class="mut">Feedback to the harness</label>
  <textarea id="fb-text" placeholder="write here…"></textarea>
  <button onclick="sendFeedback()">Send feedback</button>
  <div id="fb-status"></div>
</div>
<div class="box"><div class="mut" style="margin-bottom:8px">Your feedback thread</div><div id="fb-thread"><span class="mut">loading…</span></div></div>
<script>
const TOKEN=new URLSearchParams(location.search).get("token")||"";
const auth={headers:{"X-Feedback-Token":TOKEN}};
async function loadThread(){
  try{
    const r=await fetch("/api/feedback/list"+(TOKEN?"?token="+TOKEN:""),auth);
    const d=await r.json();
    const items=(d.ok&&d.items)||[];
    const el=document.getElementById("fb-thread");
    if(!items.length){el.innerHTML='<span class="mut">no feedback yet — the loop is quiet</span>';return;}
    el.innerHTML=items.map(function(i){return '<div class="row"><span class="id">'+i.id+'</span> '+i.kind+' · '+i.author+' · '+i.date+' <span class="pill '+(i.status==="addressed"?"a":"p")+'">'+i.status+'</span>'+(i.status==="addressed"?' <a href="#" onclick="showReply(&#39;'+i.file+'&#39;,this);return false;" style="color:#6db3f2">reply</a>':'')+'<div class="reply" data-file="'+i.file+'"></div></div>';}).join('');
  }catch(e){document.getElementById("fb-thread").innerHTML='<span class="err">'+e+'</span>';}
}
async function showReply(file,link){
  const box=link.nextElementSibling;
  if(box.style.display!=="block"){box.style.display="block";box.textContent="loading…";
    try{const r=await fetch("/api/feedback/reply?file="+encodeURIComponent(file)+(TOKEN?"&token="+TOKEN:""),auth);
      const d=await r.json();box.textContent=d.reply||"(no reply yet)";}catch(e){box.textContent="✗ "+e;}
  }else{box.style.display="none";}
}
async function sendFeedback(){
  const ta=document.getElementById("fb-text");const st=document.getElementById("fb-status");
  const text=ta.value.trim();if(!text){st.innerHTML='<span class="err">write something first</span>';return;}
  const body=new URLSearchParams({author:document.getElementById("fb-author").value||"remote",feedback:text});
  try{
    const r=await fetch("/api/forms/harness-feedback"+(TOKEN?"?token="+TOKEN:""),{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded","X-Feedback-Token":TOKEN},body:body.toString()});
    const d=await r.json();
    if(d.ok){ta.value="";st.innerHTML='<span class="ok">✔ sent — the harness will reply here</span>';setTimeout(loadThread,2000);}
    else st.innerHTML='<span class="err">✗ '+(d.error||"send failed")+'</span>';
  }catch(e){st.innerHTML='<span class="err">✗ server not reachable</span>';}
}
loadThread();setInterval(loadThread,15000);
</script></body></html>`;
}

    if (url === "/feedback") {
      res.setHeader("content-type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      res.end(renderFeedbackPage(path.basename(projectDir)));
      return;
    }
    if (url === "/" || url === "/index.html") {
      const st = readProject(projectDir);
      const cross: CrossCycleRow[] = roots.map((r) => {
        const s = readProject(r);
        return {
          name: path.basename(r),
          stage: s.currentStage || "—",
          phase: s.currentPhase || "—",
          gaps: s.gaps.length,
          errors: s.parseErrors.length,
        };
      });
      res.setHeader("content-type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-store"); // a live cockpit: never serve stale pages (the reader fix era)
      res.end(renderCockpit(st, { crossCycle: cross }));
      return;
    }
    res.statusCode = 404;
    res.end("not found");
  });
}
