/**
 * surfaces.ts — decision-surface generation (P7). Absorbed gen.ts concepts,
 * re-specified: one handoff → self-contained cards HTML in workbench/surfaces/.
 * Pattern extraction per workflows/surface-generation.md; link back to canonical.
 */

import type { ParsedHandoff } from "../state/types.js";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export interface SurfaceCards {
  decisions: { id: string; title: string; choice?: string; why?: string; ifWrong?: string }[];
  gaps: { id: string; title: string; status: string }[];
  phases: { id: string; title: string }[];
  principles: string[];
}

export function extractCards(h: ParsedHandoff): SurfaceCards {
  const cards: SurfaceCards = { decisions: [], gaps: [], phases: [], principles: [] };
  const lines = h.body.split(/\r?\n/);
  let inPrinciples = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^##\s+Principles/i.test(line)) {
      inPrinciples = true;
      continue;
    }
    if (inPrinciples) {
      if (/^##\s+/.test(line)) inPrinciples = false;
      else {
        const li = line.match(/^\s*[-*]\s+(.+)$/);
        if (li) cards.principles.push(li[1].trim());
      }
    }
    const d = line.match(/^###\s+(D\d+)\s*[—\-–:]\s*(.+)$/);
    if (d) {
      const block = lines.slice(i, i + 12).join("\n");
      const choice = block.match(/\*\*Choice:\*\*\s*(.+)/)?.[1];
      const why = block.match(/\*\*Why[^*]*\*\*:\s*(.+)/)?.[1];
      const ifWrong = block.match(/\*\*If wrong\*\*:\s*(.+)/)?.[1];
      cards.decisions.push({ id: d[1], title: d[2].trim(), choice, why, ifWrong });
      continue;
    }
    const g = line.match(/^###\s+([ERTLG]\d+)\s*[—\-–:]\s*(.+)$/);
    if (g) {
      const status = lines.slice(i, i + 8).join("\n").match(/\*\*Status:\*\*\s*(Open|Resolving|Closed|Reopened)/)?.[1] ?? "Open";
      cards.gaps.push({ id: g[1], title: g[2].trim(), status });
      continue;
    }
    const p = line.match(/\bP(\d+)\s*[—\-–:]\s*([^(]+)/);
    if (p && !cards.phases.some((x) => x.id === p[1])) cards.phases.push({ id: p[1], title: p[2].trim() });
  }
  return cards;
}

export function renderCards(h: ParsedHandoff): string {
  const c = extractCards(h);
  const cards = [
    ...c.decisions.map(
      (d) =>
        `<div class="card"><h3>${esc(d.id)} — ${esc(d.title)}</h3>${
          d.choice ? `<p><b>Choice:</b> ${esc(d.choice)}</p>` : ""
        }${d.why ? `<p><b>Why:</b> ${esc(d.why)}</p>` : ""}${
          d.ifWrong ? `<p class="mut"><b>If wrong:</b> ${esc(d.ifWrong)}</p>` : ""
        }</div>`
    ),
    ...c.gaps.map(
      (g) => `<div class="card"><h3>${esc(g.id)} — ${esc(g.title)}</h3><p class="pill ${g.status === "Closed" ? "ok" : "warn"}">${esc(g.status)}</p></div>`
    ),
    ...c.phases.map((p) => `<div class="card"><h3>${esc(p.id)} — ${esc(p.title)}</h3></div>`),
    ...c.principles.map((p) => `<div class="card"><p>${esc(p)}</p></div>`),
  ].join("\n");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(h.name)} — surface</title>
<style>:root{color-scheme:dark}body{font-family:ui-monospace,Menlo,monospace;background:#0f1115;color:#d7dae0;margin:0;padding:24px}
h1{font-size:18px}.card{border:1px solid #23272f;border-radius:6px;padding:12px;margin:10px 0}
h3{margin:0 0 6px;font-size:14px}.pill{display:inline-block;padding:1px 7px;border-radius:9px;font-size:11px}
.pill.ok{background:#12311c;color:#6fdc8c}.pill.warn{background:#3a2d10;color:#f2c14e}.mut{color:#8b93a3}
a{color:#6db3f2}</style></head><body>
<h1>${esc(h.name)}</h1>
<p><a href="/files/handoffs/${esc(h.name)}">View canonical markdown</a></p>
${cards || `<p class="mut">No decisions/gaps/phases/principles extracted — check the handoff's section shapes.</p>`}
</body></html>`;
}
