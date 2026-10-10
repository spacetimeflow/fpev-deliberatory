/**
 * feedback-engine.ts — the automatic push from the cockpit inbox to the harness.
 *
 * Not T3: no platform integration (the cockpit and the harness stay separate surfaces;
 * T3 would fuse them). This is the game's engine pattern (v1-worlds-of-attention
 * engine.js), applied to feedback: a background engine watches the feedback inbox and,
 * on fresh pending items, PUSHES them to the harness automatically — posts a job
 * (meta/jobs/feedback-{id}.md, any harness or human may take it) and spawns the
 * configured agent (AGENT_BIN, the harness in use; AGENT_ARGS) with the job prompt. The spawned
 * harness reads the pending handoff, addresses it in the project, and marks the item
 * addressed; the reminder stops. One push per item (never spams); a failed spawn leaves
 * the job in meta/jobs/ for takeover.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { spawn } from "node:child_process";
import { listPending, freshPending, hasReply, markAddressed, type FeedbackItem } from "./inbox.js";
import { conventionsRef } from "../state/conventions.js";

export interface FeedbackEngineOpts {
  projectDir: string;
  agentBin: string; // AGENT_BIN — the harness in use; no default
  agentArgs: string[]; // default []
  jobsOnly: boolean; // FEEDBACK_JOBS_ONLY=1 → jobs only, no spawn
  intervalMs: number; // default 15000
  maxMs: number; // default 10 minutes
}

export function jobsDir(projectDir: string): string {
  return path.join(projectDir, "meta", "jobs");
}

/** The prompt handed to the spawned harness: read, address, mark addressed. */
export function feedbackJobPrompt(projectDir: string, item: FeedbackItem): string {
  return `You are the feedback agent of the deliberatory workbench rooted at ${projectDir}.
Feedback item ${item.id} is pending in references/feedback-inbox.md (handoffs/${item.file}, ${item.kind}, by ${item.author}, ${item.date}).

Your job: address it, automatically, and REPLY to the human who sent it.
- Read the pending handoff: handoffs/${item.file}.
- Follow the project's shape (the project README, the handoff conventions at ${conventionsRef()}): revise the project in response to the feedback, recording your changes as handoffs per the project's conventions.
- Write your reply INTO the feedback handoff itself (the design: the harness appends its resolution to the same file): append a "## Reply from the harness — <you>, <date>" section to the end of handoffs/${item.file}, stating what you changed and why, in the human's language.
- Do NOT mark the item addressed yourself: the engine verifies that your reply section is in the file and marks it addressed on your behalf. Your reply is the deliverable; the addressed state is the engine's to grant.

The human-principal holds: never ratify a gate you are not asked to; this job is the harness's own bookkeeping, not a gate.
After addressing, reply concisely: what you changed and that ${item.id} is addressed, with the reply file path.`;
}

/** Post the job file; idempotent per item. Returns the job path. */
export function postFeedbackJob(projectDir: string, item: FeedbackItem): string {
  const dir = jobsDir(projectDir);
  fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, `feedback-${item.id}-${item.date}.md`);
  if (fs.existsSync(p)) return p;
  const content = `---\nid: ${item.id}\nstatus: posted\nposted: ${new Date().toISOString()}\n---\n\n# Feedback job — ${item.id}\n\n${feedbackJobPrompt(projectDir, item)}\n`;
  fs.writeFileSync(p, content);
  return p;
}

/** The automatic push loop. Launched with the workbench; one push per fresh item. */
export function runFeedbackEngine(opts: FeedbackEngineOpts): void {
  const { projectDir, agentBin, agentArgs, jobsOnly, intervalMs, maxMs } = opts;
  const reminded = new Set<string>();
  const inFlight = new Set<string>();
  console.log(
    `feedback-engine: watching ${path.join(projectDir, "references", "feedback-inbox.md")} · ` +
      (jobsOnly
        ? "JOBS-ONLY (meta/jobs/ — any harness or human may take them)"
        : `agent: ${agentBin}${agentArgs.length ? " " + agentArgs.join(" ") : ""}`)
  );
  setInterval(() => {
    for (const item of freshPending(listPending(projectDir), reminded)) {
      if (inFlight.has(item.id)) continue;
      inFlight.add(item.id);
      const job = postFeedbackJob(projectDir, item);
      if (jobsOnly) {
        console.log(`  → feedback job posted: ${path.basename(job)} (jobs-only)`);
        reminded.add(item.id);
        inFlight.delete(item.id);
        continue;
      }
      const prompt = feedbackJobPrompt(projectDir, item);
      const child = spawn(agentBin, [...agentArgs, prompt], {
        cwd: projectDir,
        stdio: ["ignore", "pipe", "pipe"],
      });
      const timer = setTimeout(() => {
        console.error(`  ✗ feedback ${item.id} timed out — killing the agent`);
        child.kill("SIGKILL");
      }, maxMs);
      let out = "";
      child.stdout.on("data", (d) => {
        out += d;
      });
      child.on("error", (e) => {
        clearTimeout(timer);
        console.error(`  ✗ feedback ${item.id} spawn error: ${e.message} — the job remains in meta/jobs/`);
        inFlight.delete(item.id);
      });
      child.on("exit", (code) => {
        clearTimeout(timer);
        const tail = out.trim().split("\n").filter(Boolean).slice(-3).join(" · ");
        const replied = hasReply(projectDir, item);
        if (replied) {
          // the engine owns "addressed": granted only on a verified reply (the game's
          // incorporation check, applied to feedback). Prose does not enforce; the file does.
          const r = markAddressed(
            projectDir,
            item.id,
            agentBin,
            new Date().toISOString().slice(0, 10),
            `handoffs/${item.file}`
          );
          console.log(
            `  → feedback ${item.id} verified: reply present, addressed ${r.ok ? "✓" : "FAILED " + r.error}`
          );
        } else {
          // the reply step was skipped: leave pending (visible in the cockpit), one push
          // per item, the job in meta/jobs/ for takeover — the seam is visible, not silent.
          console.log(
            `  ✗ feedback ${item.id}: agent exited ${code} but NO reply in handoffs/${item.file} — leaving pending; job in meta/jobs/`
          );
        }
        reminded.add(item.id); // one push per item
        inFlight.delete(item.id);
      });
    }
  }, intervalMs);
}
