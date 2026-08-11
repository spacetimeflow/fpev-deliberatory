/**
 * tests.ts (gate) — P4 verification: `npm run test:gate`.
 * Predicates report, never throw (A1); hook install is human-chosen (A5);
 * the CLI runner exits 0/1 (G2 caveat 3 — one predicate source).
 */

import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { readProject } from "../state/reader.js";
import {
  predicateHandoffExists,
  predicateEvidencePresent,
  predicateNonAuthorActed,
  runPredicate,
} from "./predicates.js";
import { installPredicateHook } from "./hook-install.js";

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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "delib-gate-"));
  const hd = path.join(dir, "handoffs");
  fs.mkdirSync(hd, { recursive: true });
  fs.writeFileSync(
    path.join(hd, "stage-1-frame-gaps-A.md"),
    `---\nstage: 1-frame\nartifact: gaps\n---\n### G1 — One\n**Status:** Resolving\n\n### G2 — Two\n**Status:** Closed\n**Evidence:** pasted evidence here\n`
  );
  fs.writeFileSync(
    path.join(hd, "stage-1-frame-problem-A.md"),
    `---\nstage: 1-frame\nartifact: problem-statement\nauthors: [OpusCC5]\n---\n# P\n`
  );
  return dir;
}

test("handoff-exists: pass on present pattern, fail on absent", () => {
  const st = readProject(fixture());
  assert.equal(predicateHandoffExists(st, { pattern: "stage-1-frame-problem" }).ok, true);
  assert.equal(predicateHandoffExists(st, { pattern: "stage-9-nope" }).ok, false);
});

test("evidence-present: Closed-with-evidence passes; Open fails", () => {
  const st = readProject(fixture());
  assert.equal(predicateEvidencePresent(st, { gapId: "G2" }).ok, true);
  assert.equal(predicateEvidencePresent(st, { gapId: "G1" }).ok, false);
});

test("non-author-acted: different actor passes; author as actor fails", () => {
  const st = readProject(fixture());
  assert.equal(
    predicateNonAuthorActed(st, { artifact: "stage-1-frame-problem-A", actor: "DSv4flash" }).ok,
    true
  );
  assert.equal(
    predicateNonAuthorActed(st, { artifact: "stage-1-frame-problem-A", actor: "OpusCC5" }).ok,
    false
  );
});

test("runPredicate: unknown predicate reports, does not throw (A1)", () => {
  const st = readProject(fixture());
  const r = runPredicate(st, { name: "no-such", params: {} });
  assert.equal(r.ok, false);
  assert.match(r.message, /unknown predicate/);
});

test("hook-install: requires a git repo (G2 caveat), installs when present", () => {
  const dir = fixture();
  const r1 = installPredicateHook(dir, { name: "handoff-exists", params: { pattern: "x" } }, "/tmp/tool");
  assert.equal(r1.ok, false); // no .git
  assert.match(r1.error ?? "", /not a git repository/);
  fs.mkdirSync(path.join(dir, ".git", "hooks"), { recursive: true });
  const r2 = installPredicateHook(dir, { name: "handoff-exists", params: { pattern: "x" } }, "/tmp/tool");
  assert.equal(r2.ok, true);
  const hook = fs.readFileSync(r2.path!, "utf8");
  assert.match(hook, /handoff-exists/);
  const mode = fs.statSync(r2.path!).mode & 0o111;
  assert.ok(mode, "hook should be executable");
  fs.rmSync(dir, { recursive: true, force: true });
});

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
