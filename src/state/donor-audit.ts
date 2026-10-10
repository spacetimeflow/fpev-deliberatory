/**
 * donor-audit.ts — G16 first pass.
 *
 * Runs the corpus through OUR parser and through a simulation of the v0-PiFPEV
 * donor extraction patterns (the regex families documented in
 * workflows/surface-generation.md). Records where the donor would have produced
 * sparse/empty surfaces vs. what our parser finds — the port-vs-re-spec
 * evidence (G16).
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { splitFrontmatter } from "./frontmatter.js";
import { extractGaps, listHandoffs } from "./reader.js";

// v0 donor patterns (documented in workflows/surface-generation.md):
const V0_GAP_HEADING = /^###\s*([ERTLG]\d+)\s*[—\-–:]\s*(.+)$/gm;
const V0_GAP_TABLE = /(?:^|\|)\s*([ERTLG]\d+)\s*[:\|]/gm;
const V0_DECISION = /^###\s*(D\d+)\s*[—\-–:]\s*(.+)$/gm;
const V0_PHASE = /\bP(\d+)\s*[—\-–:]\s*([^(]+)/gm;

function donorExtract(body: string) {
  const uniq = (arr: string[]) => [...new Set(arr)];
  return {
    gapsHeading: uniq([...body.matchAll(V0_GAP_HEADING)].map((m) => m[1])),
    gapsTable: uniq([...body.matchAll(V0_GAP_TABLE)].map((m) => m[1])),
    decisions: uniq([...body.matchAll(V0_DECISION)].map((m) => m[1])),
    phases: uniq([...body.matchAll(V0_PHASE)].map((m) => m[1])),
  };
}

const HERE = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");

function siblingProjects(root) {
  const parent = path.dirname(root);
  try {
    return fs.readdirSync(parent)
      .filter((n) => !n.startsWith(".") && n !== path.basename(root) && fs.existsSync(path.join(parent, n, "handoffs")))
      .map((n) => path.join(parent, n));
  } catch { return []; }
}
const DEFAULT_CORPUS = [HERE, ...siblingProjects(HERE)];
const CORPUS = (process.env.CORPUS_ROOT ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean).length
  ? (process.env.CORPUS_ROOT ?? "").split(",").map((s) => s.trim())
  : DEFAULT_CORPUS;

let files = 0;
let donorMissedGapFiles = 0;
let donorCrashed = 0;
const examples: string[] = [];

for (const root of CORPUS) {
  const handoffDir = path.join(root, "handoffs");
  if (!fs.existsSync(handoffDir)) continue;
  for (const f of listHandoffs(handoffDir)) {
    files++;
    const full = path.join(handoffDir, f);
    const raw = fs.readFileSync(full, "utf8");
    const { body } = splitFrontmatter(raw);

    // Our parser's gap extraction (only meaningful on gaps-like artifacts).
    const ours = extractGaps(body, full);
    // Donor simulation on the same body.
    let donor: ReturnType<typeof donorExtract>;
    try {
      donor = donorExtract(body);
    } catch {
      donorCrashed++;
      continue;
    }
    // Donor "miss": our parser sees gaps the donor patterns would have missed.
    const donorGapIds = new Set([...donor.gapsHeading, ...donor.gapsTable]);
    const missed = ours.filter((g) => !donorGapIds.has(g.id));
    if (missed.length > 0) {
      donorMissedGapFiles++;
      if (examples.length < 8) {
        examples.push(
          `${path.basename(root)}/${f}: donor misses ${missed.map((g) => g.id).join(",")} ` +
            `(donor patterns: heading=${donor.gapsHeading.length}, table=${donor.gapsTable.length})`
        );
      }
    }
  }
}

console.log("=== G16 donor audit (first pass) ===");
console.log(`files scanned:            ${files}`);
console.log(`donor pattern crashes:    ${donorCrashed}`);
console.log(`files where donor missed: ${donorMissedGapFiles}`);
if (examples.length) {
  console.log("\nexamples (donor would render sparse/empty where we find gaps):");
  for (const e of examples) console.log(`  - ${e}`);
}
console.log("\nnote: simulation uses the documented v0 regex families; the real v0 gen.ts");
console.log("invocation is the P2 port decision (G16 continues).");

process.exit(0);
