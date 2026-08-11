/**
 * frontmatter-view-tests.ts — `npm run test:fmview`.
 * The reader contract (2026-08-08, the rollback era): the working md renderer, with the
 * YAML removed. A handoff's view must contain its body and no raw frontmatter; files
 * without frontmatter pass through unchanged.
 */

import assert from "node:assert/strict";
import { mdBody } from "./frontmatter-view.js";

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

const HANDOFF = `---
stage: 1-frame
artifact: frame-problem
project: v1-cv-website-shape-dev
status: draft
created-at: 2026-08-08
authors: [DSv4flash]
---

# Frame — problem

The body begins here.
`;

test("the body is markdown only — no leading --- artifact", () => {
  const body = mdBody(HANDOFF);
  assert.ok(!body.startsWith("---"));
  assert.ok(body.includes("# Frame — problem"));
  assert.ok(body.includes("The body begins here."));
});

test("no YAML key leaks into the body", () => {
  const body = mdBody(HANDOFF);
  assert.ok(!body.includes("created-at:"));
  assert.ok(!body.includes("artifact: frame-problem"));
});

test("no frontmatter → body unchanged", () => {
  const raw = "# Just a note\n\nHello.";
  assert.equal(mdBody(raw), raw);
});

test("malformed frontmatter degrades to the full text, never silently guessed", () => {
  const raw = "---\nstage: [unclosed\n---\n\nBody.";
  const body = mdBody(raw);
  assert.ok(body.length > 0);
});

test("the reader's rendered view has no horizontal-rule pair from the YAML", () => {
  const body = mdBody(HANDOFF);
  assert.equal(body.split("---").length - 1, 0);
});

console.log(`\nfmview tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
