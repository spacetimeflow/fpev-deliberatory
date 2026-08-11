/**
 * tests.ts (chat) — `npm run test:chat`.
 * Multi-chat: threads are isolated files; appends are append-only; concurrent
 * appends from multiple agents don't lose turns.
 */

import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { createThread, appendTurn, readThread, listThreads } from "./thread.js";
import { needsReply, findThreadsNeedingReply } from "./harness-loop.js";

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

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), "delib-chat-"));

test("multiple chats are isolated files (multi-chat works)", () => {
  const dir = tmp();
  createThread(dir, "cockpit-feedback");
  createThread(dir, "architecture-talk");
  appendTurn(dir, "cockpit-feedback", { agent: "efran", role: "user", text: "the box is small" });
  appendTurn(dir, "cockpit-feedback", { agent: "chatbox", role: "assistant", text: "fixed" });
  appendTurn(dir, "architecture-talk", { agent: "efran", role: "user", text: "tiers?" });
  const a = readThread(dir, "cockpit-feedback");
  const b = readThread(dir, "architecture-talk");
  assert.equal(a.length, 2);
  assert.equal(b.length, 1);
  assert.match(a[0].text, /small/);
  assert.match(b[0].text, /tiers/);
  assert.equal(listThreads(dir).length, 2);
  fs.rmSync(dir, { recursive: true, force: true });
});

test("append-only: past turns are never rewritten (W1-adjacent)", () => {
  const dir = tmp();
  createThread(dir, "t1");
  appendTurn(dir, "t1", { agent: "efran", role: "user", text: "first" });
  const before = fs.readFileSync(path.join(dir, "conversations", "t1.jsonl"), "utf8");
  appendTurn(dir, "t1", { agent: "DSv4flash", role: "assistant", text: "second" });
  const after = fs.readFileSync(path.join(dir, "conversations", "t1.jsonl"), "utf8");
  assert.ok(after.startsWith(before), "the first turn's line must be byte-identical");
  assert.match(after, /second/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test("concurrent appends from multiple agents lose no turns", async () => {
  const dir = tmp();
  createThread(dir, "t2");
  await Promise.all(
    Array.from({ length: 100 }, (_, i) =>
      Promise.resolve(appendTurn(dir, "t2", { agent: i % 2 ? "DSv4flash" : "chatbox", role: "assistant", text: `turn ${i}` }))
    )
  );
  const turns = readThread(dir, "t2");
  assert.equal(turns.length, 100, `expected 100 turns, got ${turns.length}`);
  const texts = new Set(turns.map((t) => t.text));
  assert.equal(texts.size, 100, "every turn survived (no lost updates)");
  fs.rmSync(dir, { recursive: true, force: true });
});

test("harness-loop: detects unanswered user turns only", () => {
  const dir = tmp();
  createThread(dir, "t-a");
  appendTurn(dir, "t-a", { agent: "efran", role: "user", text: "hey" }); // unanswered → needs reply
  createThread(dir, "t-b");
  appendTurn(dir, "t-b", { agent: "efran", role: "user", text: "hi" });
  appendTurn(dir, "t-b", { agent: "harness", role: "assistant", text: "hi" }); // answered → no reply needed
  createThread(dir, "t-c"); // empty → no reply needed
  const cands = findThreadsNeedingReply(dir, "harness");
  assert.equal(cands.length, 1);
  assert.equal(cands[0].id, "t-a");
  fs.rmSync(dir, { recursive: true, force: true });
});

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
if (failed > 0) process.exit(1);
