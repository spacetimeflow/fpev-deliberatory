/**
 * framing.ts — extract the framing-critical content from handoffs (P1..C1..D1..B..U..)
 * so the cockpit can surface principles, constraints, deliverables, boundaries, and
 * uncertainty markers for direct human feedback (Frame inputs are feedback targets).
 */

import type { ParsedHandoff } from "../state/types.js";

export interface FramingItem {
  id: string;
  text: string;
  source: string;
}

export interface FramingBundle {
  principles: FramingItem[];
  constraints: FramingItem[];
  deliverables: FramingItem[];
  boundaries: FramingItem[];
  uncertainties: FramingItem[];
}

function stripMd(s: string): string {
  return s.replace(/\*\*/g, "").replace(/`/g, "").trim();
}

/** Lines of list items under a section heading (## Principles, ## Hard constraints, ...). */
function sectionLines(body: string, sectionRe: RegExp): string[] {
  const lines: string[] = [];
  let inSection = false;
  for (const line of body.split(/\r?\n/)) {
    if (/^#{2,3}\s+/.test(line)) {
      inSection = sectionRe.test(line);
      continue;
    }
    if (inSection) {
      const m = line.match(/^\s*(?:[-*]\s*|\d+\.\s*)/);
      if (m) lines.push(line.slice(m[0].length).trim());
    }
  }
  return lines;
}

export function extractFraming(handoffs: ParsedHandoff[]): FramingBundle {
  const bundle: FramingBundle = { principles: [], constraints: [], deliverables: [], boundaries: [], uncertainties: [] };
  const seen = { P: new Set<string>(), C: new Set<string>(), D: new Set<string>(), B: new Set<string>(), U: new Set<string>() };

  for (const h of handoffs) {
    if (h.isRevision) continue;
    const body = h.body;

    for (const line of sectionLines(body, /^#{2,3}\s+Principles$/i)) {
      const bare = line.replace(/^\*+/, "");
      const m = bare.match(/^P(\d+)[.)—–:\-]?\s*(.+)/);
      if (m && !seen.P.has(`P${m[1]}`)) {
        seen.P.add(`P${m[1]}`);
        bundle.principles.push({ id: `P${m[1]}`, text: stripMd(m[2]), source: h.name });
      }
    }
    for (const line of sectionLines(body, /^#{2,3}\s+(?:Hard\s+)?Constraints?$/i)) {
      const bare = line.replace(/^\*+/, "");
      const m = bare.match(/^C(\d+)[.)—–:\-]?\s*(.+)/);
      if (m && !seen.C.has(`C${m[1]}`)) {
        seen.C.add(`C${m[1]}`);
        bundle.constraints.push({ id: `C${m[1]}`, text: stripMd(m[2]), source: h.name });
      }
    }
    for (const line of sectionLines(body, /^#{2,3}\s+(?:What this is NOT|Anti-scope)/i)) {
      const clean = stripMd(line);
      const sep = clean.search(/[.—–:]|\s+-\s+/);
      const id = sep > 0 ? clean.slice(0, sep).trim() : clean;
      const text = sep > 0 ? clean.slice(sep).replace(/^[.—–:]\s*/, "").trim() : "";
      if (id && !seen.B.has(id)) {
        seen.B.add(id);
        bundle.boundaries.push({ id, text, source: h.name });
      }
    }
    for (const line of sectionLines(body, /^#{2,3}\s+Uncertainty markers?$/i)) {
      const clean = stripMd(line);
      const m = clean.match(/^(Confident|Uncertain)[^:]*[:—–\-]?\s*(.+)/);
      if (m) {
        const key = `${m[1]}:${m[2].slice(0, 40)}`;
        if (!seen.U.has(key)) {
          seen.U.add(key);
          bundle.uncertainties.push({ id: m[1], text: m[2], source: h.name });
        }
      }
    }
    // deliverables: phase headings in plan/execute docs (### P0 — Title) + per-phase bullet count
    const lines = body.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const ph = lines[i].match(/^#{3,4}\s+P(\d+)[\s—–\-:]+(.+)$/);
      if (!ph) continue;
      const id = `P${ph[1]}`;
      if (seen.D.has(id)) continue;
      let count = 0;
      for (let j = i + 1; j < lines.length && j < i + 12; j++) {
        if (/^#{2,}/.test(lines[j])) break; // stop at the next section
        if (/^\s*[-*]\s+/.test(lines[j])) count++;
      }
      seen.D.add(id);
      bundle.deliverables.push({ id, text: `${ph[2].trim()} (${count} deliverables)`, source: h.name });
    }
  }
  return bundle;
}
