/**
 * inbox.ts — the automatic feedback engine: capture → inbox → remind → process.
 *
 * Every feedback handoff (harness-feedback and human-feedback-replies) is recorded as a
 * PENDING item in <project>/references/feedback-inbox.md; the run ritual prints pending
 * items at startup (the automatic reminder); marking addressed flips the status in place.
 * Files are the bus: the ledger is the canonical record, append-only per item, idempotent
 * by file, never rewritten (P2: markdown canonical, derived distinct).
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { atomicWrite } from "../state/atomic-write.js";

export type FeedbackKind = "harness" | "replies";
export type FeedbackStatus = "pending" | "addressed";

export interface FeedbackItem {
  id: string;
  kind: FeedbackKind;
  file: string;
  author: string;
  date: string;
  status: FeedbackStatus;
  addressedBy?: string;
  addressedAt?: string;
  reply?: string;
}

export const INBOX_HEADER = `# Feedback inbox — the automatic feedback engine

Every feedback handoff (harness-feedback and human-feedback-replies) is recorded here as a
pending item; the run ritual reminds the harness at startup; addressing marks it done. The
ledger is append-only per item; a status change is a line under the item, never a rewrite.

`;

export function inboxPath(projectDir: string): string {
  return path.join(projectDir, "references", "feedback-inbox.md");
}

/** Ensure the inbox ledger exists; returns its path. */
export function ensureInbox(projectDir: string): string {
  const p = inboxPath(projectDir);
  if (!fs.existsSync(p)) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    atomicWrite(p, INBOX_HEADER);
  }
  return p;
}

/** Parse the ledger into items. Unknown blocks are skipped, never rewritten. */
export function listFeedback(projectDir: string): FeedbackItem[] {
  const p = inboxPath(projectDir);
  if (!fs.existsSync(p)) return [];
  const text = fs.readFileSync(p, "utf8");
  const items: FeedbackItem[] = [];
  for (const block of text.split(/^## /m).slice(1)) {
    const lines = block.split("\n");
    const head = lines[0]?.trim() ?? "";
    const m = head.match(/^(FB-\d+) — (\w+) \((\d{4}-\d{2}-\d{2})\)$/);
    if (!m) continue;
    const item: FeedbackItem = {
      id: m[1],
      kind: m[2] as FeedbackKind,
      date: m[3],
      file: "",
      author: "",
      status: "pending",
    };
    for (const ln of lines.slice(1)) {
      const t = ln.trim();
      const f = t.match(/^- file: (.+)$/);
      const a = t.match(/^- author: (.+)$/);
      const s = t.match(/^- status: (\w+)$/);
      const ab = t.match(/^- addressed-by: (.+)$/);
      const at = t.match(/^- addressed-at: (.+)$/);
      const rp = t.match(/^- reply: (.+)$/);
      if (f) item.file = f[1];
      else if (a) item.author = a[1];
      else if (s) item.status = s[1] as FeedbackStatus;
      else if (ab) item.addressedBy = ab[1];
      else if (at) item.addressedAt = at[1];
      else if (rp) item.reply = rp[1];
    }
    items.push(item);
  }
  return items;
}

export function listPending(projectDir: string): FeedbackItem[] {
  return listFeedback(projectDir).filter((i) => i.status === "pending");
}

/**
 * Record a captured feedback handoff as a pending item. Idempotent by file: a handoff is
 * recorded once, however many times the write path fires.
 */
export function recordFeedback(
  projectDir: string,
  spec: { kind: FeedbackKind; file: string; author: string; date: string }
): { ok: boolean; id?: string; error?: string } {
  const existing = listFeedback(projectDir).find((i) => i.file === spec.file);
  if (existing) return { ok: true, id: existing.id };
  const p = ensureInbox(projectDir);
  const n = listFeedback(projectDir).length + 1;
  const id = `FB-${String(n).padStart(3, "0")}`;
  const block = `## ${id} — ${spec.kind} (${spec.date})\n- file: ${spec.file}\n- author: ${spec.author}\n- status: pending\n`;
  const text = fs.readFileSync(p, "utf8");
  const res = atomicWrite(p, text.endsWith("\n") ? text + block : text + "\n" + block);
  return res.success ? { ok: true, id } : { ok: false, error: res.error };
}

/** Mark an item addressed; idempotent per item (already addressed → ok, no-op). The
 * optional `reply` is a path to the harness's reply file, recorded under the item so
 * the cockpit can show what the harness answered. */
export function markAddressed(
  projectDir: string,
  id: string,
  addressedBy: string,
  date: string,
  reply?: string
): { ok: boolean; id?: string; error?: string } {
  const p = inboxPath(projectDir);
  if (!fs.existsSync(p)) return { ok: false, error: `no inbox at ${p}` };
  const text = fs.readFileSync(p, "utf8");
  const re = new RegExp(`(## ${id} — [^\\n]*\\n(?:- [^\\n]*\\n)*?)- status: pending\n`);
  if (!re.test(text)) {
    // id unknown or already addressed — idempotent if addressed
    if (new RegExp(`## ${id} — `).test(text)) return { ok: true, id };
    return { ok: false, error: `unknown item ${id}` };
  }
  const replyLine = reply ? `- reply: ${reply}\n` : "";
  const next = text.replace(
    re,
    `$1- status: addressed\n- addressed-by: ${addressedBy}\n- addressed-at: ${date}\n${replyLine}`
  );
  const res = atomicWrite(p, next);
  return res.success ? { ok: true, id } : { ok: false, error: res.error };
}

/** Append the harness's reply to the feedback handoff file itself (the capture-export-remind
 * design: the harness appends its resolution to the same file, so the thread lives in one
 * canonical file — the researcher's correction, 2026-08-08). Idempotent per reply. */
export function appendReply(
  projectDir: string,
  item: { id: string; file: string },
  replyBody: string,
  agent: string,
  date: string
): { ok: boolean; path?: string; error?: string } {
  const p = path.join(projectDir, "handoffs", item.file);
  if (!fs.existsSync(p)) return { ok: false, error: `no handoff at ${p}` };
  const text = fs.readFileSync(p, "utf8");
  const marker = `## Reply from the harness — ${agent}, ${date}`;
  if (text.includes(marker)) return { ok: true, path: `handoffs/${item.file}` };
  const section = `\n---\n\n## Reply from the harness — ${agent}, ${date}\n\n${replyBody}\n`;
  const res = atomicWrite(p, text.endsWith("\n") ? text + section : text + "\n" + section);
  return res.success ? { ok: true, path: `handoffs/${item.file}` } : { ok: false, error: res.error };
}

/** The run-ritual briefing: one line per pending item. */
export function pendingBriefing(projectDir: string): string {
  const pending = listPending(projectDir);
  if (pending.length === 0) return "";
  const lines = pending.map(
    (i) => `   ${i.id} — handoffs/${i.file} (${i.kind}, ${i.author}, ${i.date})`
  );
  return `\n⚠ Feedback engine: ${pending.length} pending item(s) in references/feedback-inbox.md\n${lines.join(
    "\n"
  )}\n   Address them, then mark addressed (cockpit Feedback panel, or the /api/feedback/address endpoint).\n`;
}

/** True if the feedback handoff carries a harness reply section — the engine's verified
 * deliverable. Prose does not enforce (Section 7's honest limit), so the engine does not
 * take the agent's word for it; it checks the file. */
export function hasReply(projectDir: string, item: { file: string }): boolean {
  const p = path.join(projectDir, "handoffs", item.file);
  if (!fs.existsSync(p)) return false;
  return /## Reply from the harness/.test(fs.readFileSync(p, "utf8"));
}

/** The reply section of a feedback handoff, for the feedbacker view: everything from the
 * "## Reply from the harness" marker to the end; empty string when no reply yet. */
export function readReply(projectDir: string, file: string): string {
  const p = path.join(projectDir, "handoffs", file);
  if (!fs.existsSync(p)) return "";
  const text = fs.readFileSync(p, "utf8");
  const i = text.indexOf("## Reply from the harness");
  return i >= 0 ? text.slice(i).trim() : "";
}

/** Pending items not yet reminded — the live loop reminds once per item, never spams. */
export function freshPending(pending: FeedbackItem[], reminded: Set<string>): FeedbackItem[] {
  return pending.filter((i) => !reminded.has(i.id));
}
