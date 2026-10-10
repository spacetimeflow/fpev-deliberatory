# Surface generation

How to generate decision surfaces (HTML cards and slides) from handoff markdown. Companion to `decision-surfaces.md`: that file describes *what* a surface is and *when* to make one; this file describes the *generator* — input → output mechanics.

## When to use this workflow

You're building a tool that turns `handoffs/stage-N-*.md` into `references/surfaces/*.html`. Or you're debugging why your handoff produced an empty/wrong surface.

## Input — handoff markdown

The generator parses a handoff with this shape:

```markdown
---
stage: 1-frame
artifact: problem-statement
project: PiFPEV-v1
status: draft
created-at: 2026-05-18
authors: [OpusCC47]
...
---

# Problem statement — sibling 1/3

## TL;DR
... one paragraph

## Decisions
### D1 — Layer-3 engine
**Choice:** Extended Pi-FASTRIC via shim
**Why:** Lightest, lowest LoC
**If wrong:** R9 tripwire at 800 LoC

## Gaps
### G7 — Hook coverage adequacy
**Status:** Open
**What we don't know:** Whether 3 hooks cover every constraint

## Phases
P0 — Engine evaluation
P1 — Shim implementation
...
```

The generator extracts four content types from this shape (see `decision-surfaces.md` §"What goes on a surface"):

1. **Decisions** — sections matching `### D\d+ — Title` or table rows `| D\d+ |`
2. **Gaps** — sections matching `### [ERTLG]\d+ — Title` or table rows
3. **Phases** — patterns matching `P\d+ — Title`
4. **Principles** — sections under `## Principles`

## Output — HTML surface

Two formats:

| Format | When |
|---|---|
| **Cards** | Frame, Plan, Verify when the reviewer needs to flip between sections |
| **Slides** | Verify dissemination, or when output will be presented |

Both are self-contained HTML files: dark theme, inlined CSS, optional CDN dependencies (KaTeX, Mermaid). No build step required to view.

## Extraction patterns — the load-bearing details

### Decisions

```regex
### (D\d+) — (.+)\n
```

Then within each decision's section body:

```regex
\*\*Choice:\*\* (.+)
\*\*Why[^*]*\*\*: (.+)
\*\*If wrong\*\*: (.+)
```

Fallback for table-row decisions:

```regex
\|\s*(D\d+)\s*\|.+?
```

For Stage 2 specifically (where decisions are canonical): if no decisions extracted, the generator may use a project-specific hardcoded decision list (v0's pattern) — but this is a fallback, not the default.

### Gaps

The gap-id prefix can be `E`, `R`, `T`, `L`, or `G` (v0 used E/R/T/L for sub-categories; v1 uses G for unified). Headings:

```regex
^### ([ERTLG]\d+)\s*[—\-:]\s*(.+?)$
```

Then within each gap's section body:

```regex
\*\*Status:\*\*\s*(Open|Resolving|Closed|Reopened)
\*\*What we don't know:\*\*\s*(.+?)\n
```

Fallback for table-row gaps:

```regex
(?:^|\|)\s*([ERTLG]\d+)\s*[:\|]
```

Gap surfaces should support both the heading-style (v1 convention) and table-row style (v0 convention). The generator extracts whichever matches first; if both forms appear, dedup by id.

### Phases

```regex
\bP(\d+)\s*—?\s*([^(]+)
```

Phases are extracted from anywhere in the body (often the Phase DAG section). Title trimmed to ~40 chars for card display.

## Templates

Two template files provide the HTML scaffolding:

```
templates/cards.html        — the cards template
templates/slides/_base.html — the slides template (reveal.js)
```

Tokens in the template are substituted by the generator:

```
{{title}}            project + stage
{{stage_label}}      human-readable stage
{{decisions}}        rendered HTML for each decision (card or slide)
{{gaps}}             rendered HTML for each gap
{{phases}}           rendered HTML for each phase
{{handoff_link}}     relative URL to the source markdown
{{author}}           from frontmatter
{{generated_at}}     ISO timestamp
```

The substitution is straightforward template engine logic — no need for a heavy framework.

## CLI invocation

```bash
surface-gen \
  --handoff handoffs/stage-1-frame-problem-wenlong-OpusCC47.md \
  --stage 1 \
  --format cards \
  --output references/surfaces/stage-1-problem-cards.html
```

| Flag | Meaning |
|---|---|
| `--handoff <path>` | Source markdown |
| `--stage <N>` | The stage number (for template defaults) |
| `--format cards\|slides` | Output type |
| `--output <path>` | Where to write the HTML |

Bulk regeneration:

```bash
# Regenerate all surfaces for a project
for f in handoffs/stage-*-*.md; do
  surface-gen --handoff "$f" --output "references/surfaces/$(basename $f .md)-cards.html" --format cards
done
```

A `regression.ts`-style harness (v0 pattern) generates a curated set and verifies HTML structure (DOCTYPE, valid HTML, no template placeholder leakage, presence of content).

## Pattern recognition vs schema

The generator uses **pattern recognition** on markdown text, not a strict schema. This is intentional — handoffs are written for humans first; the generator extracts what it can. If a handoff doesn't match patterns, the surface is sparse, but generation never *fails*.

If you want stricter extraction, parse a YAML block in the handoff that declares decisions/gaps explicitly. But this trades discoverability for rigidity. v0/v1 use pattern recognition.

## Anti-patterns

- **Hand-editing generated HTML.** The surface is derived; edits get overwritten on regenerate. Edit the handoff source instead.
- **Pattern-mismatched gaps producing silent empty surfaces.** The v0 dogfood found `gen.ts` recognized only `E|R|T|L` prefixes, missing v1's `G\d+`. Add new prefixes as new conventions emerge (R4 productive divergence).
- **Templates with executable JS.** Surfaces should be readable on `file://` without a server; avoid `fetch()` and external API calls
- **Surface for every handoff.** Execute-stage handoffs don't usually need surfaces — Execute is fast, no judgment point. Don't burn generation effort on phases that won't be reviewed visually.

## Wiki HTML delivery — adjacent but distinct

See `workflows/wiki-html-delivery.md` for generating browsable HTML from `wiki/topics/*.md` (cross-cycle knowledge, family-grouped). The patterns differ:

| Surfaces | Wiki HTML |
|---|---|
| One handoff → one HTML | Many wiki topics → grouped HTML pages |
| Cards or slides | Long-form scrollable pages with anchors |
| Frame/Plan/Verify judgment points | Reference reading any time |
| Lives in `references/surfaces/` | Lives in `references/wiki/` or similar |

Same canonical/delivery split (MD source → HTML output); different shape.

## Implementation hints (non-binding)

v0-PiFPEV: `src/surfaces/gen.ts` (541 LoC). Templates in `src/surfaces/templates/`. Pattern recognition with regex; the gap-pattern fix in v0 Stage-4 Phase-2 (added `G\d+` and heading-style) is documented as an R4 entry in the wiki R-class log.

A v1+ implementation might:
- Use a proper markdown parser (`remark`, `markdown-it`) to extract structured content
- Add JSON-Schema validation for extracted-content correctness
- Support custom user templates per project

## See also

- `workflows/decision-surfaces.md` — what surfaces are, when to generate
- `workflows/handoff-conventions.md` — the structure of the source handoffs
- `workflows/wiki-html-delivery.md` — adjacent generator for cross-cycle knowledge
- `workflows/cockpit-design.md` — where surfaces are linked from
