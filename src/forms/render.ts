/**
 * render.ts — capture form renderers (P3).
 * Each form posts to the server's write routes; the export is a canonical
 * handoff (writers.ts). Capture surfaces: decisions are made where they are
 * read; the export is first-class (Frame v3, capture-surface decision).
 */

import type { ProjectState } from "../state/types.js";
import { conventionsRef } from "../state/conventions.js";
import { extractDecisions } from "../render/cockpit.js";

/** The feedback-to-harness panel (V1/V4): freeform textbox that writes a
 * canonical handoff and yields a ready-to-paste prompt. Placed in the cockpit. */
export function renderHarnessFeedbackPanel(st: ProjectState, defaultAuthor: string): string {
  return `<details class="panel" id="feedback"><summary>Send feedback to the harness <span class="badge">prompt</span></summary><div class="body">
<p class="mut">Write feedback here — on the cockpit, the workbench, or this cycle's artifacts (stage ${esc(st.currentStage || "—")}). Submitting writes a canonical handoff and hands you a ready-to-paste prompt: your feedback becomes your message to the harness, no retyping.</p>
<label>Your author ID (C8)</label>
<input id="fb-author" value="${esc(defaultAuthor)}">
<label>Feedback</label>
<textarea id="fb-text" rows="2" placeholder="e.g. The cockpit's stage-work panel should…"></textarea>
<button onclick="sendFeedback()">Write handoff + make my prompt</button>
<div id="fb-result"></div>
</div></details>`;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function page(title: string, body: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title} — deliberatory</title>
<style>:root{color-scheme:dark}body{font-family:ui-monospace,Menlo,monospace;background:#0f1115;color:#d7dae0;margin:0;padding:24px;max-width:760px}h1{font-size:18px}h2{font-size:13px;text-transform:uppercase;color:#8b93a3}.item{border:1px solid #23272f;border-radius:6px;padding:12px;margin:10px 0}label{display:block;font-size:11px;color:#8b93a3;margin:8px 0 3px}input,textarea,select{width:100%;background:#171a21;color:#d7dae0;border:1px solid #2c313c;border-radius:4px;padding:6px;font:inherit}textarea{min-height:60px}button{margin-top:14px;padding:8px 18px;background:#1c5c33;color:#fff;border:0;border-radius:5px;cursor:pointer}.mut{color:#8b93a3;font-size:12px}</style></head><body>${body}</body></html>`;
}

export function renderFeedbackForm(st: ProjectState, target: string, defaultAuthor: string): string {
  const items = extractDecisions(st);
  const itemHtml = items
    .map(
      (d) => `<div class="item">
  <h2>${d.id} <span class="mut">— ${d.text} <small>(${d.source})</small></span></h2>
  <label>Decision</label>
  <select name="${d.id}.decision"><option>approve</option><option>reject</option><option>modify</option><option>defer</option></select>
  <label>Reasoning</label>
  <textarea name="${d.id}.reasoning"></textarea>
  <label>Edited wording (optional)</label>
  <textarea name="${d.id}.wording"></textarea>
</div>`
    )
    .join("");
  const formHtml = `<form id="cap-form" method="post" action="/api/forms/feedback">
  <input type="hidden" name="target" value="${target}">
  <label>Your author ID (C8)</label>
  <input name="author" value="${defaultAuthor}">
  ${itemHtml}
  <button type="submit">Export feedback handoff</button>
</form>
<div id="cap-result"></div>
<script>
// capture → export → ready-made harness reminder (no copy/paste round-trips)
document.getElementById("cap-form").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const f = ev.target;
  const r = await fetch(f.action, { method: "POST", body: new URLSearchParams(new FormData(f)) });
  const d = await r.json();
  const el = document.getElementById("cap-result");
  if (d.ok && d.path) {
    const name = d.path.split("/").pop();
    const sentence = "Follow the FPEV conventions at " + conventionsRef() + ". I answered the decisions — read handoffs/" + name + " and revise accordingly.";
    el.innerHTML = '<p class="ok">✔ exported to <b>handoffs/' + name + '</b></p>' +
      '<label>Remind the harness (auto-copied):</label>' +
      '<textarea id="cap-sentence" readonly rows="3">' + sentence.replace(/&/g, "&amp;").replace(/</g, "&lt;") + '</textarea>' +
      '<button onclick="capCopy()">Copy reminder</button>';
    try { await navigator.clipboard.writeText(sentence); } catch {}
  } else {
    el.innerHTML = '<p class="err">✗ ' + (d.error || "export failed") + '</p>';
  }
});
function capCopy(){const t=document.getElementById("cap-sentence");if(t){t.select();try{document.execCommand("copy");}catch{}}}
</script>`;
  return page(
    "Capture — feedback",
    `<h1>Capture surface — ${target}</h1>
<p class="mut">${items.length} items extracted from this project. Your answers export as a canonical handoff;
then tell the harness to read it — it does the work. Files are the bus.</p>
${formHtml}`
  );
}

export function renderFrameForm(project: string, defaultAuthor: string): string {
  const field = (label: string, name: string, rows = 5) =>
    `<label>${label}</label><textarea name="${name}" rows="${rows}"></textarea>`;
  return page(
    "Capture — framing",
    `<h1>Capture surface — Frame</h1>
<p class="mut">Exports as stage-1-frame-problem-{author}.md. The harness then revises/extends it (hop 2).</p>
<form method="post" action="/api/forms/framing">
  <input type="hidden" name="project" value="${project}">
  <label>Your author ID (C8)</label>
  <input name="author" value="${defaultAuthor}">
  ${field("TL;DR (one paragraph)", "tldr", 3)}
  ${field("Problem (in plain English)", "problem")}
  ${field("Principles", "principles")}
  ${field("Hard constraints", "constraints")}
  ${field("Knowledge gaps", "gaps", 4)}
  ${field("Audience", "audience", 3)}
  <button type="submit">Export Frame handoff</button>
</form>`
  );
}

export function renderVerifyForm(project: string, defaultAuthor: string): string {
  return page(
    "Capture — verify",
    `<h1>Capture surface — Verify</h1>
<p class="mut">One block per phase: verdict + teach-back ("can you explain it in your own words?") + optional gap evidence.
Exports as stage-4-verify-{author}-{date}.md.</p>
<form method="post" action="/api/forms/verify">
  <input type="hidden" name="project" value="${project}">
  <label>Your author ID (C8)</label>
  <input name="author" value="${defaultAuthor}">
  <div class="item" id="verify-items">
    <label>Phase / artifact id</label>
    <input name="id" value="P0">
    <label>Verdict</label>
    <select name="verdict"><option>pass</option><option>fail</option><option>judged</option></select>
    <label>Teach-back</label>
    <textarea name="teachback"></textarea>
    <label>Gap evidence (optional)</label>
    <textarea name="gapevidence"></textarea>
  </div>
  <button type="submit">Export Verify handoff</button>
</form>`
  );
}
