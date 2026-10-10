/**
 * conventions.ts — where the shape's conventions are.
 *
 * The package holds its conventions in its own `workflows/` and stands alone. The launcher
 * sets FPEV_DIR to that folder; the ritual prompts resolve through this helper, so
 * "Follow <conventions>" always points where the harness can read them.
 */
import * as path from "node:path";
import { fileURLToPath } from "node:url";

/** The conventions reference for the harness-facing prompts. */
export function conventionsRef(): string {
  return process.env.FPEV_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "workflows");
}
