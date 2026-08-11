/**
 * frontmatter.ts — the single YAML frontmatter parser (P13: one canonical parser).
 *
 * Tolerant-first (A7): absence of frontmatter is fine (legacy files, jepa-era);
 * malformed frontmatter is REPORTED via `error`, never silently guessed.
 */

import { parse as parseYaml } from "yaml";

export interface FrontmatterResult {
  meta: Record<string, unknown>;
  body: string;
  hadFrontmatter: boolean;
  error?: string;
}

export function splitFrontmatter(raw: string): FrontmatterResult {
  const text = raw.replace(/^\uFEFF/, ""); // strip BOM
  if (!text.startsWith("---")) {
    return { meta: {}, body: text, hadFrontmatter: false };
  }
  const lines = text.split(/\r?\n/);
  if (lines.length < 3) {
    return { meta: {}, body: text, hadFrontmatter: false };
  }
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      end = i;
      break;
    }
  }
  if (end === -1) {
    return {
      meta: {},
      body: text,
      hadFrontmatter: true,
      error: "opening '---' without closing '---'",
    };
  }
  const frontmatter = lines.slice(1, end).join("\n");
  const body = lines.slice(end + 1).join("\n");
  try {
    const parsed = parseYaml(frontmatter);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {
        meta: {},
        body,
        hadFrontmatter: true,
        error: "frontmatter is not a YAML mapping",
      };
    }
    return { meta: parsed as Record<string, unknown>, body, hadFrontmatter: true };
  } catch (err) {
    return {
      meta: {},
      body,
      hadFrontmatter: true,
      error: `YAML parse error: ${String(err)}`,
    };
  }
}

/** Normalize the authors field (string or array) to a string array. */
export function normAuthors(authors: unknown): string[] {
  if (Array.isArray(authors)) {
    return authors.map((a) => String(a));
  }
  if (typeof authors === "string") {
    return authors
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
  }
  return [];
}
