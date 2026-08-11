/**
 * conventions.ts — the standalone conventions reference (2026-08-10).
 *
 * The package embeds the ~/.fpev conventions as its own `workflows/` (the gate #5
 * refinement): a fresh clone needs no external ~/.fpev. The launcher sets FPEV_DIR to the
 * embedded copy when ~/.fpev is absent; the ritual prompts resolve through this helper, so
 * "Follow <conventions>" always points where the harness can read them.
 */

/** The conventions reference for the harness-facing prompts. */
export function conventionsRef(): string {
  return process.env.FPEV_DIR || "~/.fpev";
}
