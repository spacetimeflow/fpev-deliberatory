/**
 * tests.ts (forms) — P3 verification: `npm run test:forms`.
 * Writer output matches handoff-conventions; the exported file round-trips
 * the parser unchanged (P3 recipe).
 */

import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { writeFeedbackHandoff, renderFeedbackHandoff, writeFrameHandoff, writeHarnessFeedback } from "./writers.js";
import { readProject, parseHandoff } from "../state/reader.js";
import { renderFeedbackForm } from "./render.js";

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

const tmp = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "delib-forms-"));
  fs.mkdirSync(path.join(dir, "handoffs"), { recursive: true });
  return dir;
};

test("feedback writer: filename + frontmatter + sections conform (C8)", () => {
  const dir = tmp();
  const r = writeFeedbackHandoff(dir, {
    project: "demo",
    stage: "2-plan",
    target: "stage-2-plan-X.md",
    author: "efran",
    answers: [
      { id: "S1", decision: "approve", reasoning: "looks right" },
      { id: "D1", decision: "modify", reasoning: "see wording", wording: "use TS" },
    ],
  }, "2026-08-05");
  assert.equal(r.ok, true);
  const name = path.basename(r.path ?? "");
  assert.match(name, /^stage-2-plan-human-feedback-replies-efran-2026-08-05\.md$/);
  const raw = fs.readFileSync(r.path!, "utf8");
  assert.match(raw, /artifact: human-feedback-replies/);
  assert.match(raw, /authors: \[efran\]/);
  assert.match(raw, /answers-to: stage-2-plan-X\.md/);
  assert.match(raw, /## S1\n\n\*\*Decision:\*\* approve/);
  assert.match(raw, /## D1\n\n\*\*Decision:\*\* modify/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test("feedback writer: export round-trips the parser unchanged", () => {
  const dir = tmp();
  const r = writeFeedbackHandoff(dir, {
    project: "demo",
    stage: "2-plan",
    target: "stage-2-plan-X.md",
    author: "efran",
    answers: [
      { id: "S1", decision: "approve", reasoning: "approved" },
      { id: "Q6", decision: "defer", reasoning: "later" },
    ],
  }, "2026-08-05");
  const h = parseHandoff(r.path!);
  assert.equal(h.error, undefined, `parse error: ${h.error}`);
  assert.equal(h.stageNum, 2);
  assert.equal(h.stageName, "plan");
  assert.equal(h.artifactKind, "human-feedback-replies");
  assert.deepEqual(h.authors, ["efran"]);
  assert.match(h.body, /## S1/);
  assert.match(h.body, /\*\*Decision:\*\* approve/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test("framing writer: frame handoff parses and appears in project state", () => {
  const dir = tmp();
  const r = writeFrameHandoff(dir, {
    project: "demo",
    author: "efran",
    tldr: "one para",
    problem: "the problem",
    principles: "- P1 x",
    constraints: "- C1 y",
    gaps: "- G1 z",
    audience: "me",
  });
  assert.equal(r.ok, true);
  const st = readProject(dir);
  assert.equal(st.currentStageNum, 1);
  assert.equal(st.parseErrors.length, 0);
  assert.equal(st.artifacts.length, 1);
  fs.rmSync(dir, { recursive: true, force: true });
});

test("renderFeedbackForm: prefills extracted decisions", () => {
  const dir = tmp();
  fs.writeFileSync(
    path.join(dir, "handoffs", "stage-2-plan-A.md"),
    `---\nstage: 2-plan\nartifact: plan\nphase: P0\n---\n\n| ID | Decision |\n|---|---|\n| D1 | Language |\n`
  );
  const { readProject: readAgain } = { readProject };
  const html = renderFeedbackForm(readAgain(dir), "demo", "efran");
  assert.match(html, /D1/);
  assert.match(html, /Language/);
  assert.match(html, /action="\/api\/forms\/feedback"/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test("harness feedback: writes canonical handoff + ready-to-paste prompt", () => {
  const dir = tmp();
  const r = writeHarnessFeedback(dir, {
    project: "demo",
    stage: "4-verify",
    author: "efran",
    feedback: "The cockpit stage-work panel should show phase progress.",
  });
  assert.equal(r.ok, true);
  const name = path.basename(r.path ?? "");
  assert.match(name, /^stage-4-verify-harness-feedback-efran-\d{4}-\d{2}-\d{2}\.md$/);
  const h = parseHandoff(r.path!);
  assert.equal(h.error, undefined);
  assert.equal(h.artifactKind, "harness-feedback");
  assert.deepEqual(h.authors, ["efran"]);
  assert.match(h.body, /phase progress/);
  assert.ok((r.prompt ?? "").includes("Follow "));
  assert.match(r.prompt ?? "", /stage-4-verify/);
  assert.match(r.prompt ?? "", new RegExp(name));
  fs.rmSync(dir, { recursive: true, force: true });
});

test("harness feedback: same-day repeats get -2/-3 suffixes, never overwrite", () => {
  const dir = tmp();
  const a = writeHarnessFeedback(dir, { project: "demo", stage: "4-verify", author: "efran", feedback: "one" });
  const b = writeHarnessFeedback(dir, { project: "demo", stage: "4-verify", author: "efran", feedback: "two" });
  const c = writeHarnessFeedback(dir, { project: "demo", stage: "4-verify", author: "efran", feedback: "three" });
  const names = [a.path, b.path, c.path].map((p) => p?.split("/").pop());
  assert.equal(new Set(names).size, 3, "all three files must be distinct");
  assert.match(names[1] ?? "", /-2\.md$/);
  assert.match(names[2] ?? "", /-3\.md$/);
  assert.match(fs.readFileSync(b.path!, "utf8"), /two/);
  assert.match(fs.readFileSync(c.path!, "utf8"), /three/);
  fs.rmSync(dir, { recursive: true, force: true });
});

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
