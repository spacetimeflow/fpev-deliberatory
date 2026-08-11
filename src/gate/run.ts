/**
 * run.ts — C2 predicate runner (P4). Two entry modes:
 *  1. The "Run verification" button backend (server route → this module).
 *  2. The git-hook entry point (CLI args), used by installed pre-commit hooks.
 * Exit code: 0 = pass, 1 = fail — the same predicate, one source (G2 caveat 3).
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { readProject } from "../state/reader.js";
import { runPredicate, type PredicateSpec } from "./predicates.js";

export function runVerification(projectDir: string, spec: PredicateSpec): { ok: boolean; message: string; exit: number } {
  const st = readProject(projectDir);
  const result = runPredicate(st, spec);
  return { ...result, exit: result.ok ? 0 : 1 };
}

// CLI mode for hooks: node run.ts --predicate <name> [--param k=v]...
if (process.argv[1]?.endsWith("run.ts")) {
  const args = process.argv.slice(2);
  const name = args[args.indexOf("--predicate") + 1];
  const params: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--param") {
      const [k, ...v] = (args[i + 1] ?? "").split("=");
      params[k] = v.join("=");
    }
  }
  const cwd = process.cwd();
  const st = readProject(cwd);
  const r = runPredicate(st, { name: name ?? "", params });
  process.stdout.write(`${r.ok ? "GATE OK" : "GATE FAIL"} — ${r.message}\n`);
  process.exit(r.ok ? 0 : 1);
}

export function projectDirOrExit(argvDir?: string): string {
  const dir = argvDir ?? process.cwd();
  if (!fs.existsSync(path.join(dir, "handoffs"))) {
    process.stderr.write(`no handoffs/ in ${dir}\n`);
    process.exit(1);
  }
  return dir;
}
