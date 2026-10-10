# Wiki HTML delivery

How to generate browsable HTML pages from a project's `wiki/topics/*.md` for cockpit consumption. Adjacent to `surface-generation.md` (which targets handoff → cards/slides); this generator targets cross-cycle knowledge → grouped HTML pages.

## When to use this workflow

You're building (or invoking) a generator that takes `wiki/topics/*.md` and produces HTML pages a browser can render with anchors. Or you're answering "why does the cockpit's Wiki panel link to raw .md files that render as plain text?"

## Why this workflow exists

A wiki/topic markdown file is canonical (per C4). But a browser opens `.md` as plain text. The cockpit's Wiki panel currently links to the raw MD; readers want rendered HTML with formatted headings, code blocks, mermaid diagrams, and cross-anchored navigation.

The generator produces the HTML *delivery layer* parallel to how `surface-generation.md` produces decision surfaces. Same canonical/delivery split.

## Input — wiki topics with optional family frontmatter

```markdown
---
topic: fastric-fsm
project: PiFPEV
status: mature
type: concept-mechanism
family: fastric           # optional — groups related topics into one HTML page
authors: [OpusCC47]
related: [recovery-vs-termination, flexible-stochastic-fsm]
---

# FASTRIC — Finite Automata with State-Transition, Roles, Interactions, Constraints

...content...
```

The optional `family:` field is what enables grouping. Without it, the topic renders as a standalone HTML page.

## Output — grouped HTML pages + an index

```
references/wiki/
├── index.html                          ← entry point; links to all families and standalone topics
├── fastric.html                        ← all topics with family: fastric, anchored per topic
├── fpev-lifecycle.html                 ← family: fpev-lifecycle
├── decision-surfaces.html              ← family: decision-surfaces
├── ...
└── standalone/
    ├── workflows-vs-daemon.html        ← topics without family
    └── ...
```

Each family page has anchors per topic:

```html
<section id="fastric-fsm">
  <h2>FASTRIC — Finite Automata...</h2>
  ...rendered topic content...
</section>
<section id="flexible-stochastic-fsm">
  <h2>Flexible Stochastic FSM</h2>
  ...
</section>
```

So `references/wiki/fastric.html#fastric-fsm` jumps directly to the topic. The cockpit's Wiki panel links here.

## Grouping conventions

Suggested initial families (project-specific; adjust):

| Family | Member topics |
|---|---|
| `fastric` | `fastric-fsm`, `flexible-stochastic-fsm`, `multi-dimensional-formality`, `knowledge-gap-fsm` |
| `fpev-lifecycle` | `fpev-protocol`, `u-shape-attention`, `handoff-and-three-file-pattern`, `recovery-vs-termination` |
| `decision-surfaces` | `decision-surface`, `slides-as-decision-surface`, `dual-channel-interface` |
| `mode` | `forum-mode`, `chat-log-as-artifact`, `github-as-channel` |
| `engine` | `pi-state-manager`, `pifpev-vs-openclaw-hermes`, `engine-evaluation` |
| `meta` | `layer-1-as-template`, `autonomy-level-alpha`, `deliberation-collapse`, `workflows-vs-daemon` |

Topics without `family:` go to `standalone/`. Family assignment is per-project and evolves.

## Cross-references — link resolution

Topics often cross-link with `[[topic-name]]` or `wiki/topics/topic-name-{author}.md`. The generator resolves these:

```
[[fastric-fsm]]              → <a href="fastric.html#fastric-fsm">FASTRIC...</a>
wiki/topics/fastric-fsm-*.md → same resolution
```

Resolution rules:
- Same family → anchor link (`#topic-id`)
- Different family → cross-family link (`family.html#topic-id`)
- Standalone → `standalone/topic.html`
- Unknown → render the link as-is, mark with a warning in generator output (orphan reference)

## Index page

`index.html` is the entry point:

```html
<h1>Wiki — Project X</h1>

<h2>Families</h2>
<ul>
  <li><a href="fastric.html">FASTRIC family</a> — 4 topics</li>
  <li><a href="fpev-lifecycle.html">FPEV lifecycle family</a> — 4 topics</li>
  ...
</ul>

<h2>Standalone topics</h2>
<ul>
  <li><a href="standalone/workflows-vs-daemon.html">workflows-vs-daemon</a></li>
  ...
</ul>

<h2>All topics</h2>
<details>
  <summary>Alphabetical list</summary>
  ...
</details>
```

Cockpit's Wiki panel links to `index.html` as the "browse all" entry point, and to specific family pages for category-scoped browsing.

## Rendering features

- **Markdown → HTML**: standard via `marked`, `commonmark`, or `markdown-it`
- **Mermaid diagrams**: render via Mermaid CDN
- **Code highlighting**: optional; `highlight.js` or `prism` via CDN
- **Math**: KaTeX if topics use `$inline$` or `$$display$$`
- **Status pills**: render `status:` field as a colored badge per topic
- **Frontmatter table at top**: status, authors, related, sources — at-a-glance metadata

## CLI invocation

```bash
wiki-gen \
  --wiki-dir wiki/topics \
  --output references/wiki \
  --family-config wiki/families.yaml
```

Or use defaults (read `family:` field from each topic's frontmatter; no external config).

```bash
# Bulk regenerate
wiki-gen --wiki-dir wiki/topics --output references/wiki

# Watch mode (regenerate on .md changes during authoring)
wiki-gen --wiki-dir wiki/topics --output references/wiki --watch
```

## State integration

When the wiki HTML is regenerated, the daemon's state can be updated to point at the new index:

```bash
curl -X POST localhost:7327/action -d '{
  "type":"modify",
  "payload":{"field":"wiki","value":[{
    "id":"wiki-index",
    "path":"/abs/path/to/references/wiki/index.html",
    "title":"Wiki index",
    "tag":"index"
  }]}
}'
```

Cockpit's Wiki panel then opens the HTML, not the raw MD.

## Cross-family vs per-family decisions

| Question | Answer |
|---|---|
| One HTML file per topic | Too many files; navigation friction |
| One HTML file per family | **Default** — readable, cross-anchored, grouped |
| One HTML file for all topics | Too long; loses family structure |
| Generate live (cockpit fetches on each refresh) | No — too slow; static is fine |

## Anti-patterns

- **Force-grouping unrelated topics into one family.** Don't pad families to balance member count; standalone is fine.
- **Cross-family links without resolution.** Generator should warn on dangling links, not silently emit broken anchors.
- **Embedded JS for content rendering.** Use static HTML; readers should not need a dev server to read.
- **Per-cycle regeneration of unchanged topics.** Use file-modified-time to skip unchanged content (build cache).
- **Hand-editing generated HTML.** Edits get overwritten; modify the .md source.

## Implementation hints (non-binding)

Not yet implemented in v0-PiFPEV. v1 ships this as G21. Estimated ~120 LoC:

- 80 LoC: `wiki-gen.ts` (scan, parse frontmatter, group by family, render via marked)
- 40 LoC: `templates/wiki-family.html`, `templates/wiki-standalone.html`, `templates/wiki-index.html`

A non-TypeScript implementation could use:
- Python with `markdown` or `mistune`
- Pandoc for the markdown→HTML conversion + custom grouping logic
- A Hugo or Eleventy site generator (heavier; only if the wiki grows beyond ~50 topics)

## See also

- `workflows/surface-generation.md` — adjacent generator for decision surfaces
- `workflows/wiki-authoring.md` — what wiki topics look like as authored
- `workflows/cockpit-design.md` — Wiki panel display
