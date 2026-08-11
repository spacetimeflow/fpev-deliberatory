/**
 * tests.ts (exports) — P7 verification: `npm run test:exports`.
 * Exports land in workbench/surfaces + workbench/wiki; regeneration is clean.
 */

import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { parseHandoff } from "../state/reader.js";
import { extractCards, renderCards } from "../render/surfaces.js";
import { renderWikiIndex } from "../render/wiki-gen.js";

let passed = 0;
let failed = 0;
function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.error(`  ✗ ${name}: ${(err as Error).message}`);
  }
}

function fixture(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "delib-exp-"));
  fs.mkdirSync(path.join(dir, "handoffs"), { recursive: true });
  fs.mkdirSync(path.join(dir, "wiki", "topics"), { recursive: true });
  fs.writeFileSync(
    path.join(dir, "handoffs", "stage-2-plan-A.md"),
    `---\nstage: 2-plan\nartifact: plan\n---\n\n## Decisions\n### D1 — Language\n**Choice:** TS\n**Why:** reuse\n**If wrong:** port\n\n## Gaps\n### G7 — Coverage\n**Status:** Open\n\n## Phases\nP0 — Baseline\n`
  );
  fs.writeFileSync(
    path.join(dir, "wiki", "topics", "alpha-A.md"),
    `---\ntitle: Alpha\nfamily: fastric\n---\n# Alpha\nSomething about alpha.\n`
  );
  return dir;
}

test("extractCards: decisions, gaps, phases, principles from a handoff", () => {
  const dir = fixture();
  const h = parseHandoff(path.join(dir, "handoffs", "stage-2-plan-A.md"));
  const c = extractCards(h);
  assert.equal(c.decisions.length, 1);
  assert.equal(c.decisions[0].id, "D1");
  assert.equal(c.decisions[0].choice, "TS");
  assert.equal(c.gaps.length, 1);
  assert.equal(c.phases.length, 1);
  fs.rmSync(dir, { recursive: true, force: true });
});

test("renderCards: links back to canonical markdown", () => {
  const dir = fixture();
  const h = parseHandoff(path.join(dir, "handoffs", "stage-2-plan-A.md"));
  const html = renderCards(h);
  assert.match(html, /View canonical markdown/);
  assert.match(html, /stage-2-plan-A\.md/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test("wiki-gen: groups by family, regenerates identically (clean regen)", () => {
  const dir = fixture();
  const topicsDir = path.join(dir, "wiki", "topics");
  const r1 = renderWikiIndex(topicsDir);
  assert.equal(r1.topics, 1);
  assert.match(r1.html, /fastric/);
  const r2 = renderWikiIndex(topicsDir);
  assert.equal(r1.html, r2.html, "regeneration must be deterministic");
  fs.rmSync(dir, { recursive: true, force: true });
});

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
