/**
 * parse.ts — trace events (P5, C3). The harness holds the tool-call trace; the
 * workbench reads it via adapters (P6: executor writings are never evidence).
 */

export interface TraceEvent {
  ts: string;
  tool: string;
  args: string;
  exit?: string;
}

export interface TraceResult {
  source: string;
  events: TraceEvent[];
  note?: string;
}

/**
 * Parse a Claude Code session log (~/.claude/projects/{slug}/{session}.jsonl).
 * Tool-call events are `message.content[].tool_use` blocks; exit status is
 * best-effort from a following user tool_result (absent → "n/a", honestly).
 */
export function parseClaudeCodeSession(filePath: string, raw?: string): TraceResult {
  const text = raw ?? requireFs(filePath);
  const events: (TraceEvent & { id: string })[] = [];
  const lines = text.split(/\r?\n/);
  const pendingExit = new Map<string, string>();
  for (const line of lines) {
    if (!line.trim()) continue;
    let entry: any;
    try {
      entry = JSON.parse(line);
    } catch {
      continue; // partial lines are normal in live session logs
    }
    const content = entry?.message?.content;
    if (Array.isArray(content)) {
      for (const block of content) {
        if (block?.type === "tool_use") {
          const id = block.id ?? "";
          events.push({
            id,
            ts: entry.timestamp ?? entry.message?.timestamp ?? "",
            tool: block.name ?? "?",
            args: JSON.stringify(block.input ?? {}).slice(0, 200),
            exit: "n/a",
          });
        } else if (block?.type === "tool_result") {
          const id = block.tool_use_id ?? "";
          if (typeof block.content === "string") {
            const m = block.content.match(/exit code:\s*(\S+)/i);
            if (m) pendingExit.set(id, m[1]);
          }
        }
      }
    }
  }
  // Exit statuses arrive after their tool_use — apply in a post-pass.
  for (const e of events) {
    const ex = pendingExit.get(e.id);
    if (ex) e.exit = ex;
  }
  const { id: _id, ...rest } = events as (TraceEvent & { id: string })[];
  return { source: filePath, events: events.map(({ id, ...e }) => e) };
}

function requireFs(filePath: string): string {
  // ESM-safe read (kept separate so the function is importable without fs side effects)
  const fs = /* @ts-ignore */ globalThis.process?.getBuiltinModule?.("node:fs");
  return fs.readFileSync(filePath, "utf8");
}
