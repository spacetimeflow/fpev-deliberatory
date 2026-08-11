/**
 * hook-install.ts — C2 hook installation (P4). Human-chosen (A1/A5): the gate
 * exists only because the human installed it. Per-repo caveat from G2: hooks
 * are not versioned, so installation writes into .git/hooks/ (or a
 * core.hooksPath-managed dir) and the workbench offers re-install.
 */

import * as fs from "node:fs";
import * as path from "node:path";

export interface HookInstallResult {
  ok: boolean;
  path?: string;
  error?: string;
}

/**
 * Install a pre-commit hook that runs `run.ts` with a predicate spec.
 * The generated hook is a tiny POSIX script; it must exit 0/1 only.
 */
export function installPredicateHook(
  projectDir: string,
  spec: { name: string; params: Record<string, string> },
  toolRoot: string
): HookInstallResult {
  const gitDir = path.join(projectDir, ".git");
  if (!fs.existsSync(gitDir)) {
    return { ok: false, error: "project is not a git repository — git init first (G2 caveat)" };
  }
  const hooksDir = path.join(gitDir, "hooks");
  fs.mkdirSync(hooksDir, { recursive: true });
  const paramArgs = Object.entries(spec.params)
    .map(([k, v]) => `--param "${k}=${v}"`)
    .join(" ");
  const script = `#!/bin/sh
# Installed by the deliberatory workbench (P4, human-chosen gate). A1: nothing
# blocks except hooks the human installed; --no-verify remains a human override.
cd "$(git rev-parse --show-toplevel)" || exit 1
npx tsx "${toolRoot}/src/gate/run.ts" --predicate ${spec.name} ${paramArgs} >/dev/null 2>&1
exit $?
`;
  const hookPath = path.join(hooksDir, "pre-commit");
  try {
    fs.writeFileSync(hookPath, script, { mode: 0o755 });
    return { ok: true, path: hookPath };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
