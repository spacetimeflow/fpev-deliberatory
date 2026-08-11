/**
 * frontmatter-view.ts — the reader's frontmatter handling (simplified 2026-08-08).
 *
 * The handoff mds must load with the plain renderer. The original marked.parse rendered
 * the YAML as stray text and horizontal rules; the fm-box experiment was rolled back
 * (the researcher's call: "roll back to the working md renderer but remove yaml"). The
 * one change kept: the YAML is removed from what is rendered — the canonical files keep
 * their frontmatter (the parser needs it); the reader sees only the body.
 */

import { splitFrontmatter } from "../state/frontmatter.js";

/** The markdown body only (frontmatter stripped, the canonical parser's result). */
export function mdBody(raw: string): string {
  return splitFrontmatter(raw).body;
}
