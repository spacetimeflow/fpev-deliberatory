/**
 * thread.ts — conversation-as-a-file (option A, prototype).
 * Each chat thread is a `conversations/{id}.jsonl` file. Agents (the chatbox,
 * any harness agent) join a thread by APPENDING a turn — append-only, so past
 * turns are never rewritten (W1-adjacent: the thread is witnessed, not edited).
 * Multiple chats = multiple files; context inheritance = reading the file.
 */

import * as fs from "node:fs";
import * as path from "node:path";

export interface ChatTurn {
  ts: string;
  agent: string; // C8 author-id
  role: "user" | "assistant" | "system";
  text: string;
}

export interface ThreadSummary {
  id: string;
  file: string;
  turns: number;
  last?: string;
  lastAgent?: string;
}

function sanitize(id: string): string {
  return id.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 80);
}

export function threadsDir(projectDir: string): string {
  return path.join(projectDir, "conversations");
}

export function listThreads(projectDir: string): ThreadSummary[] {
  const dir = threadsDir(projectDir);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".jsonl") && !f.startsWith("."))
    .sort()
    .map((f) => {
      const turns = readThread(projectDir, f.replace(/\.jsonl$/, ""));
      const last = turns[turns.length - 1];
      return {
        id: f.replace(/\.jsonl$/, ""),
        file: path.join(dir, f),
        turns: turns.length,
        last: last?.ts,
        lastAgent: last?.agent,
      };
    });
}

export function readThread(projectDir: string, id: string): ChatTurn[] {
  const file = path.join(threadsDir(projectDir), sanitize(id) + ".jsonl");
  if (!fs.existsSync(file)) return [];
  const turns: ChatTurn[] = [];
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      turns.push(JSON.parse(line) as ChatTurn);
    } catch {
      /* partial line — tolerate (live logs) */
    }
  }
  return turns;
}

export function createThread(projectDir: string, id: string): { ok: boolean; path?: string; error?: string } {
  const safe = sanitize(id);
  const dir = threadsDir(projectDir);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, safe + ".jsonl");
  if (fs.existsSync(file)) return { ok: false, error: `thread exists: ${safe}` };
  fs.writeFileSync(file, "");
  return { ok: true, path: file };
}

/**
 * Append-only turn write. Past turns are never touched. appendFileSync with a
 * single line is atomic for practical sizes (O_APPEND single write).
 */
export function appendTurn(
  projectDir: string,
  id: string,
  turn: { agent: string; role: ChatTurn["role"]; text: string }
): { ok: boolean; path?: string; error?: string } {
  const safe = sanitize(id);
  const file = path.join(threadsDir(projectDir), safe + ".jsonl");
  if (!fs.existsSync(file)) return { ok: false, error: `thread not found: ${safe}` };
  const line =
    JSON.stringify({
      ts: new Date().toISOString(),
      agent: turn.agent,
      role: turn.role,
      text: turn.text,
    }) + "\n";
  try {
    fs.appendFileSync(file, line, "utf8");
    return { ok: true, path: file };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
