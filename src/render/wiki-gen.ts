/**
 * wiki-gen.ts — wiki/references HTML delivery (P7). Reads wiki/topics/*.md,
 * groups by optional `family:` frontmatter (per ~/.fpev/wiki-html-delivery.md),
 * renders one grouped index at workbench/wiki/index.html. Derived, regenerable.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { splitFrontmatter } from "../state/frontmatter.js";

export interface WikiTopic {
  name: string;
  title: string;
  family: string;
  snippet: string;
  shared: boolean;
}

/** Collect wiki topics from the project's wiki AND the shared (cross-project) wiki. */
export function collectWiki(primaryDir: string, sharedDir?: string): WikiTopic[] {
  const dirs = [primaryDir, ...(sharedDir ? [sharedDir] : [])];
  const out: WikiTopic[] = [];
  const seen = new Set<string>();
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    const shared = dir !== primaryDir;
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".md") && !x.startsWith(".")).sort()) {
      if (seen.has(f)) continue;
      seen.add(f);
      const raw = fs.readFileSync(path.join(dir, f), "utf8");
      const { meta } = splitFrontmatter(raw);
      const title = (typeof meta.title === "string" && meta.title) || f.replace(/\.md$/, "");
      const family = typeof meta.family === "string" ? meta.family : "ungrouped";
      const snippet = raw.replace(/^---[\s\S]*?---/, "").slice(0, 140).replace(/\s+/g, " ").trim();
      out.push({ name: f, title, family, snippet, shared });
    }
  }
  return out;
}

/** The /view relative path for a topic (project wiki vs shared ../wiki). */
export function wikiViewRel(t: { name: string; shared: boolean }): string {
  return (t.shared ? "../wiki/topics/" : "wiki/topics/") + t.name;
}

export function renderWikiIndex(primaryDir: string, sharedDir?: string): { html: string; topics: number } {
  const topics = collectWiki(primaryDir, sharedDir);
  const byFamily = new Map<string, typeof topics>();
  for (const t of topics) {
    const list = byFamily.get(t.family) ?? [];
    list.push(t);
    byFamily.set(t.family, list);
  }
  const sections = [...byFamily.entries()]
    .map(
      ([family, list]) => `<h2 id="${family}">${family}</h2><ul>${list
        .map((t) => `<li><a href="/view?path=${encodeURIComponent(wikiViewRel(t))}">${t.title}</a>${t.shared ? " <span class=\"mut\">(shared)</span>" : ""}</li>`)
        .join("")}</ul>`
    )
    .join("");
  const topicSections = topics
    .map(
      (t) => `<section id="${t.name}"><h3>${t.title}${t.shared ? " <span class=\"mut\">(shared)</span>" : ""}</h3><p class="mut">${t.snippet}…</p></section>`
    )
    .join("");
  return {
    html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>wiki — deliberatory</title>
<style>:root{color-scheme:dark}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:#0f1115;color:#d7dae0;margin:0;padding:24px;max-width:820px}h1{font-size:18px}.mut{color:#8b93a3}section{margin:18px 0;border-top:1px solid #23272f;padding-top:10px}</style></head>
<body><h1>Wiki (shared knowledge)</h1>${sections}${topicSections}</body></html>`,
    topics: topics.length,
  };
}
