/**
 * reader.ts — files-as-database reader (P1). Derives project state from
 * handoffs/ at request time (A7: from files, never memory). Tolerant-first:
 * frontmatter is canonical (P2); name parsing is a fallback with warnings
 * when ambiguous (never silent guessing).
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { splitFrontmatter, normAuthors } from "./frontmatter.js";
import type {
  ArtifactEntry,
  GapEntry,
  HandoffMeta,
  ParsedHandoff,
  ProjectState,
} from "./types.js";

const REV_SUFFIX = /^(.*)-v(\d+)\.md$/;
const STAGE_NAMES: Record<number, string> = {
  1: "frame",
  2: "plan",
  3: "execute",
  4: "verify",
};

export function listHandoffs(handoffDir: string): string[] {
  if (!fs.existsSync(handoffDir)) return [];
  return fs
    .readdirSync(handoffDir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("."))
    .sort();
}

function stageFromMeta(meta: HandoffMeta): { num?: number; name?: string } {
  const s = meta.stage;
  if (typeof s === "string") {
    const m = s.match(/^(\d+)-?([a-z]*)$/i);
    if (m) return { num: Number(m[1]), name: m[2]?.toLowerCase() || undefined };
  }
  return {};
}

export function parseHandoff(filePath: string): ParsedHandoff {
  const name = path.basename(filePath);
  const raw = fs.readFileSync(filePath, "utf8");
  const fm = splitFrontmatter(raw);
  const meta = fm.meta as HandoffMeta;

  // Revision detection from the filename (-vN suffix).
  const rev = name.match(REV_SUFFIX);
  const isRevision = !!rev;
  const revisionNum = rev ? Number(rev[2]) : undefined;
  const revisionOf = rev ? rev[1] : undefined;
  const supersedes = typeof meta.supersedes === "string" ? meta.supersedes : undefined;

  // Stage/artifact/phase: frontmatter first (canonical, P2), name fallback.
  const metaStage = stageFromMeta(meta);
  let stageNum = metaStage.num;
  let stageName = metaStage.name;
  let artifactKind: string | undefined =
    typeof meta.artifact === "string" ? meta.artifact : undefined;
  let phaseId: string | undefined =
    typeof meta.phase === "string" ? meta.phase : undefined;

  if (stageNum === undefined) {
    const nameFallback = parseNameFallback(name);
    stageNum = nameFallback.stageNum;
    stageName = stageName ?? nameFallback.stageName;
    artifactKind = artifactKind ?? nameFallback.artifactKind;
    phaseId = phaseId ?? nameFallback.phaseId;
  }

  const authors = normAuthors(meta.authors);

  return {
    path: filePath,
    name,
    meta,
    body: fm.body,
    error: fm.error,
    hadFrontmatter: fm.hadFrontmatter,
    stageNum,
    stageName,
    artifactKind,
    phaseId,
    isRevision,
    revisionNum,
    revisionOf,
    supersedes,
    authors,
  };
}

/**
 * Name fallback (legacy files without frontmatter, jepa-era).
 * Handles: stage-N-{artifact}-{author}.md, stageN-{artifact}-{author}.md,
 * batched phase files (stage-3-phase-4-5-A.md), -vN preserved siblings.
 */
function parseNameFallback(
  name: string
): { stageNum?: number; stageName?: string; artifactKind?: string; phaseId?: string } {
  const base = name.replace(/\.md$/, "");
  const rev = base.match(/^(.*)-v(\d+)$/);
  const stem = rev ? rev[1] : base;
  const stageM = stem.match(/^stage(?:-|)(\d+)(?:-|)(.*)$/i);
  if (!stageM) return {};
  const stageNum = Number(stageM[1]);
  const stageName = STAGE_NAMES[stageNum];
  const rest = stageM[2] ?? "";
  const tokens = rest.split("-");
  let artifactKind: string | undefined;
  if (tokens.length >= 2) {
    const last = tokens[tokens.length - 1];
    const maybeRev = last.match(/^v(\d+)$/);
    if (maybeRev && tokens.length >= 3) {
      artifactKind = tokens.slice(0, tokens.length - 2).join("-");
    } else {
      artifactKind = tokens.slice(0, tokens.length - 1).join("-");
    }
  } else {
    artifactKind = tokens[0] || undefined;
  }
  const phaseM = artifactKind?.match(/^phase-?(\d+)/i);
  const phaseId = phaseM ? `P${phaseM[1]}` : undefined;
  return { stageNum, stageName, artifactKind, phaseId };
}

const GAP_HEADING = /^###\s+([ERTLG]\d+)\s*[—\-–:]\s*(.+)$/;
const GAP_STATUS = /\*\*Status:\*\*\s*(Open|Resolving|Closed|Reopened)/;
const GAP_TABLE = /^\|\s*\*{0,2}([ERTLG]\d+)\*{0,2}\s*\|\s*(.+?)\s*\|/;

/** Extract gaps from a gaps handoff body: heading style + table-row style (deduped). */
export function extractGaps(body: string, sourcePath: string): GapEntry[] {
  const gaps: GapEntry[] = [];
  const seen = new Set<string>();
  let current: GapEntry | null = null;
  for (const line of body.split(/\r?\n/)) {
    const h = line.match(GAP_HEADING);
    if (h) {
      current = { id: h[1], title: h[2].trim(), status: "Open", path: sourcePath };
      if (!seen.has(current.id)) {
        seen.add(current.id);
        gaps.push(current);
      }
      continue;
    }
    if (current) {
      const s = line.match(GAP_STATUS);
      if (s) current.status = s[1];
    }
    const t = line.match(GAP_TABLE);
    if (t && !seen.has(t[1])) {
      seen.add(t[1]);
      gaps.push({ id: t[1], title: t[2].trim(), status: "Open", path: sourcePath });
    }
  }
  return gaps;
}

function phaseRank(phaseId: string | undefined): number {
  if (!phaseId) return 0;
  const m = phaseId.match(/(?:P|V)(\d+)/i) ?? phaseId.match(/phase-(\d+)/i);
  return m ? Number(m[1]) : 0;
}

/** Read a project root (expects a handoffs/ subdir) into a derived state view. */
export function readProject(
  root: string,
  opts: { handoffSubdir?: string } = {}
): ProjectState {
  const handoffDir = path.join(root, opts.handoffSubdir ?? "handoffs");
  const files = listHandoffs(handoffDir);
  const handoffs = files.map((f) => parseHandoff(path.join(handoffDir, f)));

  const artifacts: ArtifactEntry[] = handoffs.map((h) => ({
    id: h.name.replace(/\.md$/, ""),
    path: h.path,
    name: h.name,
    stageNum: h.stageNum,
    stageName: h.stageName,
    phaseId: h.phaseId,
    status: typeof h.meta.status === "string" ? h.meta.status : undefined,
    authors: h.authors,
    isRevision: h.isRevision,
    error: h.error,
  }));

  const gaps: GapEntry[] = [];
  for (const h of handoffs) {
    if (h.isRevision) continue;
    const kind = h.artifactKind ?? "";
    if (kind === "gaps" || kind.includes("gap") || /frame-gaps/.test(h.name)) {
      gaps.push(...extractGaps(h.body, h.path));
    }
  }

  const parseErrors = handoffs
    .filter((h) => h.error)
    .map((h) => `${h.name}: ${h.error}`);
  const warnings: string[] = [];
  for (const h of handoffs) {
    if (!h.isRevision && h.stageNum === undefined) {
      warnings.push(`${h.name}: no stage derivable (frontmatter or name)`);
    }
  }

  const current = artifacts
    .filter((a) => !a.isRevision && a.stageNum !== undefined)
    .sort((a, b) => (b.stageNum ?? 0) - (a.stageNum ?? 0))[0];
  const currentStageNum = current?.stageNum;
  const currentStage = current ? `${current.stageNum}-${current.stageName ?? ""}` : "";
  const currentPhase = current
    ? artifacts
        .filter((a) => a.stageNum === current.stageNum && !a.isRevision)
        .sort((a, b) => phaseRank(b.phaseId) - phaseRank(a.phaseId))[0]?.phaseId ?? ""
    : "";

  // awaitingHarness: the newest handoff (by mtime) is a human feedback reply.
  const newest = handoffs
    .filter((h) => !h.isRevision)
    .map((h) => ({ h, m: fs.statSync(h.path).mtimeMs }))
    .sort((a, b) => b.m - a.m)[0];
  const awaitingHarness =
    ((newest?.h.artifactKind ?? "").includes("human-feedback") ||
      newest?.h.name.includes("human-feedback-replies")) === true;

  return {
    root,
    handoffDir,
    handoffs,
    artifacts,
    gaps,
    currentStage,
    currentStageNum,
    currentPhase,
    parseErrors,
    warnings,
    awaitingHarness,
  };
}
