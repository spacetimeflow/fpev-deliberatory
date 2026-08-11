/**
 * predicates.ts — C2 gate predicates (P4). Absorbed hook logic
 * (handoff-exists, evidence-present, non-author-acted) as PURE PREDICATES:
 * they report {ok, message}, they never throw guards (A1). A gate exists only
 * because the human installed it (hook-install.ts); nothing blocks by default.
 */

import type { ProjectState } from "../state/types.js";

export interface PredicateResult {
  ok: boolean;
  message: string;
}

export interface PredicateSpec {
  name: string;
  params: Record<string, string>;
}

/** handoff-exists: does the project contain a handoff matching the pattern? */
export function predicateHandoffExists(st: ProjectState, params: Record<string, string>): PredicateResult {
  const pattern = params.pattern ?? "";
  const hit = st.artifacts.find((a) => a.name.includes(pattern) || (params.stage && String(a.stageNum) === params.stage));
  return hit
    ? { ok: true, message: `handoff exists: ${hit.name}` }
    : { ok: false, message: `handoff matching "${pattern}" not present for transition` };
}

/** evidence-present: does the named gap carry evidence in its section? */
export function predicateEvidencePresent(st: ProjectState, params: Record<string, string>): PredicateResult {
  const gapId = params.gapId ?? "";
  const gap = st.gaps.find((g) => g.id === gapId);
  if (!gap) return { ok: false, message: `gap ${gapId} not found in gap register` };
  // evidence = a non-empty "Evidence:" line after the gap heading, or Closed status
  const body = gap.title; // title only — evidence lives in the source doc; use heuristic below
  const raw = readGapSection(st, gapId);
  const hasEvidence = /\*\*Evidence:\*\*\s*\S/.test(raw) || gap.status === "Closed";
  return hasEvidence
    ? { ok: true, message: `gap ${gapId} has evidence (status ${gap.status})` }
    : { ok: false, message: `gap ${gapId} has no evidence (status ${gap.status})` };
}

/** non-author-acted: the acting agent differs from the artifact's author (W2). */
export function predicateNonAuthorActed(st: ProjectState, params: Record<string, string>): PredicateResult {
  const artifact = params.artifact ?? "";
  const actor = params.actor ?? "";
  const hit = st.artifacts.find((a) => a.name === artifact || a.name.includes(artifact));
  if (!hit) return { ok: false, message: `artifact "${artifact}" not found` };
  const authors = hit.authors;
  const acted = !authors.includes(actor);
  return acted
    ? { ok: true, message: `actor ${actor} ≠ authors [${authors.join(", ")}] — witnessed by a different identity` }
    : { ok: false, message: `actor ${actor} IS an author of ${hit.name} — non-author-acted violated` };
}

export function runPredicate(st: ProjectState, spec: PredicateSpec): PredicateResult {
  switch (spec.name) {
    case "handoff-exists":
      return predicateHandoffExists(st, spec.params);
    case "evidence-present":
      return predicateEvidencePresent(st, spec.params);
    case "non-author-acted":
      return predicateNonAuthorActed(st, spec.params);
    default:
      return { ok: false, message: `unknown predicate: ${spec.name}` };
  }
}

/** Re-read the source gaps artifact to check a gap's evidence section (files-as-database). */
function readGapSection(st: ProjectState, gapId: string): string {
  const gapDoc = st.handoffs.find((h) => !h.isRevision && (h.artifactKind ?? "").includes("gap"));
  if (!gapDoc) return "";
  const lines = gapDoc.body.split(/\r?\n/);
  let inGap = false;
  const buf: string[] = [];
  for (const line of lines) {
    if (new RegExp(`^#{2,3}\\s+${gapId}\\s*[—\\-–:]`).test(line)) {
      inGap = true;
      continue;
    }
    if (inGap && /^#{2,}\s+/.test(line) && !new RegExp(`^#{2,3}\\s+${gapId}`).test(line)) break;
    if (inGap) buf.push(line);
  }
  return buf.join("\n");
}
