/**
 * tests.ts (feedback) — the automatic feedback engine: `npm run test:feedback`.
 * Recipe: capture → inbox → remind → process. A recorded handoff is a pending item,
 * idempotent by file; marking addressed flips it in place; the ledger is never rewritten.
 */

import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { postFeedbackJob } from "./engine.js";
import { appendReply, hasReply } from "./inbox.js";
import { isTrustedNetwork } from "./trust.js";
import {
  ensureInbox,
  recordFeedback,
  listFeedback,
  listPending,
  markAddressed,
  pendingBriefing,
  freshPending,
} from "./inbox.js";

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
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "delib-feedback-"));
  fs.mkdirSync(path.join(dir, "handoffs"), { recursive: true });
  fs.mkdirSync(path.join(dir, "references"), { recursive: true });
  return dir;
};

const spec = (dir: string, file = "stage-4-verify-harness-feedback-efran-2026-08-08.md") => ({
  kind: "harness" as const,
  file,
  author: "efran",
  date: "2026-08-08",
});

test("capture records a pending item", () => {
  const dir = tmp();
  const r = recordFeedback(dir, spec(dir));
  assert.equal(r.ok, true);
  assert.ok(r.id?.startsWith("FB-"));
  const item = listPending(dir)[0];
  assert.equal(item.status, "pending");
  assert.equal(item.file, "stage-4-verify-harness-feedback-efran-2026-08-08.md");
  assert.equal(item.author, "efran");
  assert.ok(fs.existsSync(path.join(dir, "references", "feedback-inbox.md")));
});

test("capture is idempotent by file", () => {
  const dir = tmp();
  const a = recordFeedback(dir, spec(dir));
  const b = recordFeedback(dir, spec(dir));
  assert.equal(a.id, b.id);
  assert.equal(listFeedback(dir).length, 1);
});

test("two different handoffs are two items", () => {
  const dir = tmp();
  recordFeedback(dir, spec(dir, "a.md"));
  recordFeedback(dir, spec(dir, "b.md"));
  assert.equal(listFeedback(dir).length, 2);
  assert.equal(listPending(dir).length, 2);
});

test("address flips the item and stops the reminder", () => {
  const dir = tmp();
  recordFeedback(dir, spec(dir));
  const briefing = pendingBriefing(dir);
  assert.ok(briefing.includes("FB-001"));
  assert.ok(briefing.includes("pending item"));
  const r = markAddressed(dir, "FB-001", "efran", "2026-08-08");
  assert.equal(r.ok, true);
  const item = listFeedback(dir)[0];
  assert.equal(item.status, "addressed");
  assert.equal(item.addressedBy, "efran");
  assert.equal(listPending(dir).length, 0);
  assert.equal(pendingBriefing(dir), "");
});

test("address is idempotent and rejects unknown ids", () => {
  const dir = tmp();
  recordFeedback(dir, spec(dir));
  markAddressed(dir, "FB-001", "efran", "2026-08-08");
  const again = markAddressed(dir, "FB-001", "efran", "2026-08-08");
  assert.equal(again.ok, true);
  const unknown = markAddressed(dir, "FB-999", "efran", "2026-08-08");
  assert.equal(unknown.ok, false);
});

test("ledger is never rewritten: item text survives address", () => {
  const dir = tmp();
  recordFeedback(dir, spec(dir));
  const before = fs.readFileSync(path.join(dir, "references", "feedback-inbox.md"), "utf8");
  markAddressed(dir, "FB-001", "efran", "2026-08-08");
  const after = fs.readFileSync(path.join(dir, "references", "feedback-inbox.md"), "utf8");
  assert.ok(after.includes("- status: addressed\n- addressed-by: efran"));
  assert.ok(after.includes(before.split("## FB-001")[1].split("- status:")[0])); // item text intact
});

test("freshPending reminds each item once, never spams", () => {
  const dir = tmp();
  recordFeedback(dir, spec(dir, "a.md"));
  recordFeedback(dir, spec(dir, "b.md"));
  const pending = listPending(dir);
  const reminded = new Set<string>();
  const first = freshPending(pending, reminded);
  assert.equal(first.length, 2);
  first.forEach((i) => reminded.add(i.id));
  assert.equal(freshPending(listPending(dir), reminded).length, 0); // no re-remind
  recordFeedback(dir, spec(dir, "c.md")); // a new item lands
  assert.equal(freshPending(listPending(dir), reminded).length, 1);
});

test("address records the harness's reply path", () => {
  const dir = tmp();
  recordFeedback(dir, spec(dir));
  const r = markAddressed(dir, "FB-001", "pi (the feedback engine)", "2026-08-08", "references/feedback-replies/FB-001.md");
  assert.equal(r.ok, true);
  const item = listFeedback(dir)[0];
  assert.equal(item.status, "addressed");
  assert.equal(item.reply, "references/feedback-replies/FB-001.md");
  const txt = fs.readFileSync(path.join(dir, "references", "feedback-inbox.md"), "utf8");
  assert.ok(txt.includes("- reply: references/feedback-replies/FB-001.md"));
});

test("the reply is appended to the feedback file itself, idempotent", () => {
  const dir = tmp();
  const file = "stage-1-frame-harness-feedback-efran-2026-08-08.md";
  fs.writeFileSync(path.join(dir, "handoffs", file), "---\nartifact: harness-feedback\n---\n\n# Harness feedback\n\nFix the frame.\n");
  const r = appendReply(dir, { id: "FB-001", file }, "Addressed: the frame now carries the change-record.", "pi", "2026-08-08");
  assert.equal(r.ok, true);
  assert.equal(r.path, "handoffs/" + file);
  const txt = fs.readFileSync(path.join(dir, "handoffs", file), "utf8");
  assert.ok(txt.includes("## Reply from the harness — pi, 2026-08-08"));
  assert.ok(txt.includes("the frame now carries the change-record"));
  const again = appendReply(dir, { id: "FB-001", file }, "second try", "pi", "2026-08-08");
  assert.equal(again.ok, true); // idempotent
  assert.ok(!fs.readFileSync(path.join(dir, "handoffs", file), "utf8").includes("second try"));
});

test("hasReply verifies the deliverable in the file, not the agent's word", () => {
  const dir = tmp();
  const file = "stage-1-frame-harness-feedback-efran-2026-08-08.md";
  fs.writeFileSync(path.join(dir, "handoffs", file), "# Harness feedback\n\nG0: test.\n");
  assert.equal(hasReply(dir, { file }), false); // no reply yet
  appendReply(dir, { id: "FB-001", file }, "Addressed.", "pi", "2026-08-08");
  assert.equal(hasReply(dir, { file }), true); // the reply section is the deliverable
  assert.equal(hasReply(dir, { file: "missing.md" }), false);
});

test("the push posts a job file, idempotent per item", () => {
  const dir = tmp();
  recordFeedback(dir, spec(dir));
  const item = listPending(dir)[0];
  const p1 = postFeedbackJob(dir, item);
  assert.ok(fs.existsSync(p1));
  assert.ok(p1.includes("feedback-" + item.id));
  const p2 = postFeedbackJob(dir, item);
  assert.equal(p1, p2); // idempotent
  const txt = fs.readFileSync(p1, "utf8");
  assert.ok(txt.includes(item.file)); // the prompt points at the pending handoff
  assert.ok(txt.includes("Do NOT mark the item addressed")); // the engine owns addressed
});

test("the trusted-network exception: your networks need no token", () => {
  assert.equal(isTrustedNetwork("127.0.0.1"), true); // localhost
  assert.equal(isTrustedNetwork("::1"), true);
  assert.equal(isTrustedNetwork("::ffff:192.168.1.116"), true); // LAN, IPv4-mapped
  assert.equal(isTrustedNetwork("100.70.94.59"), true); // the tailnet (CGNAT)
  assert.equal(isTrustedNetwork("10.0.0.3"), true);
  assert.equal(isTrustedNetwork("172.16.5.5"), true);
  assert.equal(isTrustedNetwork("8.8.8.8"), false); // public — token required
  assert.equal(isTrustedNetwork(undefined), false);
});

test("replies kind records as its own kind", () => {
  const dir = tmp();
  const r = recordFeedback(dir, {
    kind: "replies",
    file: "stage-2-plan-human-feedback-replies-efran-20260805.md",
    author: "efran",
    date: "2026-08-05",
  });
  assert.equal(r.ok, true);
  assert.equal(listFeedback(dir)[0].kind, "replies");
});

console.log(`\nfeedback tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
