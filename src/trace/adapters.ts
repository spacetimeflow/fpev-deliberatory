/**
 * adapters.ts — trace source adapters (P5, C3). One adapter per harness;
 * the generic fallback degrades honestly (P6 falsifier: if no harness-side
 * trace exists, say so plainly, never pretend).
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { TraceResult } from "./parse.js";
import { parseClaudeCodeSession } from "./parse.js";

/**
 * Claude Code adapter: scan ~/.claude/projects for sessions under the project
 * slug. Returns the newest session's events (or an honest empty result).
 */
export function claudeCodeTrace(projectDir: string): TraceResult {
  const home = process.env.HOME ?? "";
  const projectsDir = path.join(home, ".claude", "projects");
  if (!fs.existsSync(projectsDir)) {
    return { source: "claude-code", events: [], note: "no ~/.claude/projects — no trace available" };
  }
  const slug = path.basename(projectDir).replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase();
  const dir = path.join(projectsDir, slug);
  if (!fs.existsSync(dir)) {
    return { source: "claude-code", events: [], note: `no session dir for ${slug} in ~/.claude/projects` };
  }
  const sessions = fs.readdirSync(dir).filter((f) => f.endsWith(".jsonl")).sort();
  if (sessions.length === 0) {
    return { source: "claude-code", events: [], note: "no session jsonl found" };
  }
  return parseClaudeCodeSession(path.join(dir, sessions[sessions.length - 1]));
}

/** Pi agent adapter — honest placeholder until the Pi session-log format is confirmed. */
export function piAgentTrace(): TraceResult {
  return {
    source: "pi-agent",
    events: [],
    note: "pi-agent session log format not yet confirmed — no trace parsed (honest degrade, P6 falsifier)",
  };
}

/** Generic fallback: file history only. */
export function genericTrace(): TraceResult {
  return { source: "generic", events: [], note: "file history only — no harness session log provided" };
}
