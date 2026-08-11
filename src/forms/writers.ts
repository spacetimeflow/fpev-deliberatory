/**
 * writers.ts — canonical handoff writers (P3, the human's writes).
 * Every export is a first-class handoff: handoff-conventions frontmatter, C8
 * author tags, atomic write (A3). The workbench's capture forms are the only
 * authors of these; the harness reads the files (files-as-bus, P10).
 */

import * as path from "node:path";
import * as fs from "node:fs";
import { atomicWrite } from "../state/atomic-write.js";
import { conventionsRef } from "../state/conventions.js";

export interface FeedbackAnswer {
  id: string;
  decision: string; // approve | reject | modify | defer
  reasoning: string;
  wording?: string;
}

export interface FeedbackSpec {
  project: string;
  stage: string; // e.g. "2-plan"
  target: string; // answered handoff filename (answers-to)
  author: string;
  answers: FeedbackAnswer[];
}

export function feedbackFilename(spec: FeedbackSpec, date: string): string {
  return `stage-${spec.stage}-human-feedback-replies-${spec.author}-${date}.md`;
}

export function renderFeedbackHandoff(spec: FeedbackSpec, date: string): string {
  const frontmatter = `---
stage: ${spec.stage}
artifact: human-feedback-replies
project: ${spec.project}
status: complete
created-at: ${date}
authors: [${spec.author}]
answers-to: ${spec.target}
---

# Human feedback — ${date}

Captured via the deliberatory workbench capture surface.
`;
  const body = spec.answers
    .map(
      (a) => `## ${a.id}

**Decision:** ${a.decision}

**Reasoning:** ${a.reasoning || "(none given)"}${a.wording ? `\n\n**Edited wording:** ${a.wording}` : ""}`
    )
    .join("\n\n");
  return frontmatter + "\n" + body + "\n";
}

/** Same-day feedback collides on the date-based name — append -N instead of overwriting. */
function uniqueHandoffPath(projectDir: string, name: string): string {
  const base = name.replace(/\.md$/, "");
  let candidate = name;
  let i = 2;
  while (fs.existsSync(path.join(projectDir, "handoffs", candidate))) {
    candidate = `${base}-${i}.md`;
    i++;
  }
  return path.join(projectDir, "handoffs", candidate);
}

export function writeFeedbackHandoff(
  projectDir: string,
  spec: FeedbackSpec,
  date: string = new Date().toISOString().slice(0, 10)
): { ok: boolean; path?: string; error?: string } {
  const name = feedbackFilename(spec, date);
  const full = uniqueHandoffPath(projectDir, name);
  const res = atomicWrite(full, renderFeedbackHandoff(spec, date));
  return res.success ? { ok: true, path: full } : { ok: false, error: res.error };
}

export interface FrameSpec {
  project: string;
  author: string;
  tldr: string;
  problem: string;
  principles: string;
  constraints: string;
  gaps: string;
  audience: string;
}

export function writeFrameHandoff(projectDir: string, spec: FrameSpec): { ok: boolean; path?: string; error?: string } {
  const date = new Date().toISOString().slice(0, 10);
  const name = `stage-1-frame-problem-${spec.author}.md`;
  const content = `---
stage: 1-frame
artifact: problem-statement
project: ${spec.project}
status: draft
created-at: ${date}
authors: [${spec.author}]
---

# ${spec.project} — Problem statement (drafted in the workbench)

## TL;DR
${spec.tldr}

## Problem
${spec.problem}

## Principles
${spec.principles}

## Hard constraints
${spec.constraints}

## Knowledge gaps
${spec.gaps}

## Audience
${spec.audience}
`;
  const full = path.join(projectDir, "handoffs", name);
  const res = atomicWrite(full, content);
  return res.success ? { ok: true, path: full } : { ok: false, error: res.error };
}

export interface VerdictItem {
  id: string;
  verdict: string; // pass | fail | judged
  teachback: string;
  gapEvidence?: string;
}

export function writeVerifyHandoff(projectDir: string, project: string, author: string, items: VerdictItem[]): { ok: boolean; path?: string; error?: string } {
  const date = new Date().toISOString().slice(0, 10);
  const name = `stage-4-verify-${author}-${date}.md`;
  const body = items
    .map(
      (v) => `## ${v.id}

**Verdict:** ${v.verdict}

**Teach-back (in my own words):** ${v.teachback}${v.gapEvidence ? `\n\n**Gap evidence:** ${v.gapEvidence}` : ""}`
    )
    .join("\n\n");
  const content = `---
stage: 4-verify
artifact: verify
project: ${project}
status: complete
created-at: ${date}
authors: [${author}]
---

# Verify — ${date}

Captured via the deliberatory workbench capture surface.

${body}
`;
  const full = path.join(projectDir, "handoffs", name);
  const res = atomicWrite(full, content);
  return res.success ? { ok: true, path: full } : { ok: false, error: res.error };
}

/**
 * writeHarnessFeedback — the "feedback → harness prompt" channel (V1 finding).
 * Writes a canonical handoff AND returns a ready-to-paste prompt: the human's
 * feedback becomes their message to the harness with zero retyping. The harness
 * reads the file (files-as-bus); the workbench never posts into the harness
 * session (that coupling is T3's).
 */
export function writeHarnessFeedback(
  projectDir: string,
  spec: { project: string; stage: string; author: string; feedback: string; topic?: string }
): { ok: boolean; path?: string; prompt?: string; error?: string } {
  const date = new Date().toISOString().slice(0, 10);
  const name = `stage-${spec.stage}-harness-feedback-${spec.author}-${date}.md`;
  const full = uniqueHandoffPath(projectDir, name);
  const content = `---\nstage: ${spec.stage}\nartifact: harness-feedback\nproject: ${spec.project}\nstatus: complete\ncreated-at: ${date}\nauthors: [${spec.author}]\n---\n\n# Harness feedback — ${date}\n\n${spec.feedback}\n`;
  const res = atomicWrite(full, content);
  if (!res.success) return { ok: false, error: res.error };
  const topic = spec.topic ?? "the workbench (fpev-deliberatory)";
  const prompt = `Follow the FPEV conventions at ${conventionsRef()}. Here is my feedback on ${topic}: ${spec.feedback} (also saved in handoffs/${name}). Read it and revise accordingly.`;
  return { ok: true, path: full, prompt };
}
