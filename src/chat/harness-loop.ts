/**
 * harness-loop.ts — A2 prototype: the AUTOMATIC side of "paste it here".
 *
 * The workbench cannot push into a harness conversation (that coupling is
 * T3's). So automation = the harness pulls: this loop watches conversations/
 * and, for any thread whose LAST turn is an unanswered user turn, invokes a
 * configured harness command; the command's stdout is appended back as the
 * harness agent's turn. Files stay the bus; the loop is the seam.
 *
 * Usage:
 *   HARNESS_CMD="claude -p %THREAD%" npx tsx src/chat/harness-loop.ts
 *   (default: DRY-RUN log — set HARNESS_CMD to your real harness command.
 *    Inline placeholders: %THREAD% → thread id, %DIR% → project dir.
 *    Env var for the thread's turns: $THREAD_TEXT (shell-safe, use it inside
 *    quotes, e.g. ollama run qwen3.5:397b-cloud "reply to: $THREAD_TEXT")
 * Env: HARNESS_AGENT (default "harness"), LOOP_INTERVAL_MS (default 5000),
 *      POLL_DIR (default cwd), HARNESS_CMD.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";
import { listThreads, readThread, appendTurn, threadsDir } from "./thread.js";
import { listPending, freshPending } from "../feedback/inbox.js";

export interface ReplyCandidate {
  id: string;
  file: string;
}

/** Pure detection: threads whose last turn is an unanswered user turn. */
export function needsReply(turns: { role: string; agent: string }[], harnessAgent: string): boolean {
  const last = turns[turns.length - 1];
  if (!last) return false;
  return last.role === "user" && last.agent !== harnessAgent;
}

export function findThreadsNeedingReply(projectDir: string, harnessAgent: string): ReplyCandidate[] {
  return listThreads(projectDir).filter((t) => {
    const turns = readThread(projectDir, t.id);
    return needsReply(turns, harnessAgent);
  });
}

export function runLoop(projectDir: string, harnessAgent: string, cmdTemplate: string, intervalMs: number): void {
  const inFlight = new Set<string>();
  const reminded = new Set<string>(); // feedback ids already reminded once (never spam)
  console.log(
    `harness-loop: watching ${threadsDir(projectDir)} · agent "${harnessAgent}" · ` +
      `${cmdTemplate ? "harness: " + cmdTemplate : "DRY-RUN (set HARNESS_CMD)"}`
  );
  setInterval(() => {
    // the automatic feedback remind: pending items reach the harness without being asked.
    // Dry-run logs once per item; with HARNESS_CMD the harness is invoked with the
    // FEEDBACK_REMINDER env (the item list) and may process them (read → revise → the
    // owner or the loop marks them addressed).
    const fresh = freshPending(listPending(projectDir), reminded);
    if (fresh.length > 0) {
      const reminder = fresh
        .map((i) => `  ${i.id} — handoffs/${i.file} (${i.kind}, ${i.author}, ${i.date})`)
        .join("\n");
      if (cmdTemplate) {
        try {
          const cmd = cmdTemplate.replaceAll("%THREAD%", "feedback").replaceAll("%DIR%", projectDir);
          execSync(cmd, {
            encoding: "utf8",
            timeout: 120_000,
            env: { ...process.env, DIR: projectDir, FEEDBACK_REMINDER: reminder },
          });
          console.log(`  → feedback reminded (${fresh.length} pending)`);
        } catch (err) {
          console.error(`  ✗ feedback reminder: ${(err as Error).message}`);
        }
      } else {
        console.log(`\n⚠ Feedback engine: ${fresh.length} pending item(s)\n${reminder}\n   (DRY-RUN — set HARNESS_CMD to have the harness process feedback automatically)\n`);
      }
      fresh.forEach((i) => reminded.add(i.id));
    }
    for (const cand of findThreadsNeedingReply(projectDir, harnessAgent)) {
      if (inFlight.has(cand.id)) continue;
      inFlight.add(cand.id);
      try {
        const turns = readThread(projectDir, cand.id);
        const threadText = turns.map((t) => `${t.agent} (${t.role}): ${t.text}`).join("\n");
        const cmd = cmdTemplate.replaceAll("%THREAD%", cand.id).replaceAll("%DIR%", projectDir);
        const out = cmdTemplate
          ? execSync(cmd, {
              encoding: "utf8",
              timeout: 120_000,
              env: { ...process.env, THREAD: cand.id, DIR: projectDir, THREAD_TEXT: threadText },
            }).trim()
          : "";
        const text = out || `(harness loop: no output for thread ${cand.id})`;
        const r = appendTurn(projectDir, cand.id, {
          agent: harnessAgent,
          role: "assistant",
          text,
        });
        console.log(`  → replied in "${cand.id}" (${r.ok ? "appended" : "FAILED: " + r.error})`);
      } catch (err) {
        console.error(`  ✗ thread "${cand.id}": ${(err as Error).message}`);
      } finally {
        inFlight.delete(cand.id);
      }
    }
  }, intervalMs);
}

// CLI entry
if (process.argv[1]?.endsWith("harness-loop.ts")) {
  const projectDir = path.resolve(process.env.POLL_DIR ?? process.cwd());
  const harnessAgent = process.env.HARNESS_AGENT ?? "harness";
  const cmdTemplate = process.env.HARNESS_CMD ?? "";
  const intervalMs = Number(process.env.LOOP_INTERVAL_MS ?? 5000);
  runLoop(projectDir, harnessAgent, cmdTemplate, intervalMs);
}
