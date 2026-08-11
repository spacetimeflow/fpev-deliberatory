/**
 * tests.ts (framing) — extraction of framing-critical content for the Framing panel.
 */

import assert from "node:assert/strict";
import { extractFraming } from "./framing.js";
import type { ParsedHandoff } from "../state/types.js";

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

function handoff(name: string, body: string, meta: Record<string, unknown> = {}): ParsedHandoff {
  return { path: name, name, meta, body, hadFrontmatter: true, isRevision: false, authors: [] };
}

const PROBLEM = `## Principles
- **P1 — Protocol simple; platform absorbs complexity.**
- **P2 — The protocol is the schema.**

## Hard constraints
- **C1 — No enforcement by default.**

## What this is NOT
- **Not a rewrite.** of the tool.

## Uncertainty markers
- **Confident:** the layering holds.
- **Uncertain:** the minimal bundle size.
`;

const PLAN = `## 4. Deliverable enumeration
### P0 — Path audit
- audit file
- config spec
### P1 — Path-free fixes
- launcher changes
`;

test("extractFraming: principles, constraints, boundaries, uncertainties", () => {
  const f = extractFraming([handoff("stage-1-frame-problem-A.md", PROBLEM)]);
  assert.equal(f.principles.length, 2);
  assert.equal(f.principles[0].id, "P1");
  assert.match(f.principles[0].text, /Protocol simple/);
  assert.equal(f.constraints.length, 1);
  assert.equal(f.constraints[0].id, "C1");
  assert.equal(f.boundaries.length, 1);
  assert.match(f.boundaries[0].id, /Not a rewrite/);
  assert.equal(f.uncertainties.length, 2);
  assert.equal(f.uncertainties[0].id, "Confident");
});

test("extractFraming: deliverables from plan phase headings + counts", () => {
  const f = extractFraming([handoff("stage-2-plan-A.md", PLAN)]);
  assert.equal(f.deliverables.length, 2);
  assert.equal(f.deliverables[0].id, "P0");
  assert.match(f.deliverables[0].text, /Path audit/);
  assert.match(f.deliverables[0].text, /2 deliverables/);
});

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
