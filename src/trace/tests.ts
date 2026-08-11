/**
 * tests.ts (trace) — P5 verification: `npm run test:trace`.
 * Parses a sample Claude Code session; adapters degrade honestly (P6 falsifier).
 */

import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { parseClaudeCodeSession } from "./parse.js";
import { genericTrace, piAgentTrace } from "./adapters.js";

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

const SAMPLE = [
  JSON.stringify({
    type: "assistant",
    timestamp: "2026-08-05T12:00:01Z",
    message: { content: [{ type: "tool_use", id: "tu1", name: "Bash", input: { command: "grep -c ref" } }] },
  }),
  JSON.stringify({
    type: "user",
    message: { content: [{ type: "tool_result", tool_use_id: "tu1", content: "6\nexit code: 0" }] },
  }),
  JSON.stringify({
    type: "assistant",
    message: { content: [{ type: "tool_use", id: "tu2", name: "Edit", input: { file_path: "a.md" } }] },
  }),
].join("\n");

test("parseClaudeCodeSession: extracts tool_use events with args", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "delib-trace-"));
  const f = path.join(dir, "session.jsonl");
  fs.writeFileSync(f, SAMPLE);
  const r = parseClaudeCodeSession(f);
  assert.equal(r.events.length, 2);
  assert.equal(r.events[0].tool, "Bash");
  assert.match(r.events[0].args, /grep -c ref/);
  assert.equal(r.events[0].exit, "0"); // matched from the following tool_result
  assert.equal(r.events[1].tool, "Edit");
  assert.equal(r.events[1].exit, "n/a");
  fs.rmSync(dir, { recursive: true, force: true });
});

test("parseClaudeCodeSession: tolerates partial lines (live logs)", () => {
  const r = parseClaudeCodeSession("/tmp/none.jsonl", "not-json\n" + SAMPLE + "\n{partial");
  assert.ok(r.events.length >= 2);
});

test("adapters: generic + pi degrade honestly (P6 falsifier)", () => {
  const g = genericTrace();
  assert.equal(g.events.length, 0);
  assert.match(g.note ?? "", /file history only/);
  const p = piAgentTrace();
  assert.match(p.note ?? "", /not yet confirmed/);
});

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
