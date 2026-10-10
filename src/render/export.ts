/**
 * export.ts — P7 exports into workbench/ (project template per workflows/:
 * workbench/surfaces, workbench/wiki). Derived, regenerable, gitignore-able.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { parseHandoff, listHandoffs } from "../state/reader.js";
import { renderCards } from "./surfaces.js";
import { renderWikiIndex, wikiViewRel, collectWiki } from "./wiki-gen.js";

export function exportSurfaces(projectDir: string, handoffName: string): { ok: boolean; path?: string; error?: string } {
  try {
    const h = parseHandoff(path.join(projectDir, "handoffs", handoffName));
    const outDir = path.join(projectDir, "workbench", "surfaces");
    fs.mkdirSync(outDir, { recursive: true });
    const out = path.join(outDir, handoffName.replace(/\.md$/, "") + "-cards.html");
    fs.writeFileSync(out, renderCards(h));
    return { ok: true, path: out };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export function exportAllSurfaces(projectDir: string): { ok: boolean; count: number; errors: string[] } {
  const files = listHandoffs(path.join(projectDir, "handoffs"));
  const errors: string[] = [];
  let count = 0;
  for (const f of files) {
    const r = exportSurfaces(projectDir, f);
    if (r.ok) count++;
    else errors.push(`${f}: ${r.error}`);
  }
  return { ok: errors.length === 0, count, errors };
}

export function sharedWikiTopicsDir(projectDir: string): string | undefined {
  const d = path.join(path.dirname(projectDir), "wiki", "topics");
  if (fs.existsSync(d)) return d;
  // fallback (2026-09-25): a flat shared wiki (../wiki/*.md with no topics/ subfolder)
  const flat = path.join(path.dirname(projectDir), "wiki");
  return fs.existsSync(flat) && fs.readdirSync(flat).some((f) => f.endsWith(".md")) ? flat : undefined;
}

export function exportWiki(projectDir: string): { ok: boolean; path?: string; error?: string } {
  try {
    const { html } = renderWikiIndex(path.join(projectDir, "wiki", "topics"), sharedWikiTopicsDir(projectDir));
    const outDir = path.join(projectDir, "workbench", "wiki");
    fs.mkdirSync(outDir, { recursive: true });
    const out = path.join(outDir, "index.html");
    fs.writeFileSync(out, html);
    return { ok: true, path: out };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export { wikiViewRel, collectWiki };
