# Wiki authoring

How to write a `wiki/topics/{slug}-{author}.md` entry — and, more importantly, **when**. The wiki is FPEV's mechanism for compounding knowledge across cycles; treating it casually erodes the value.

## What a wiki topic is

A wiki topic is a **durable, cross-cycle concept** — a piece of doctrine that future cycles (of this project or others) will refer to. It's not a journal entry, not a status update, not a one-time review.

A topic that only this version uses stays in the version's wiki; one that other versions or sub-projects will read goes in the project's (`project-folder-structure.md`).

The litmus test: **"Six months from now, when someone starts a new cycle on this project, will they want to read this?"**

- Yes → wiki topic
- Maybe → wiki topic, but with `status: seeded` (acknowledging it may not survive)
- No → reference, handoff, or just inline in a stage output

## When to create a topic

Create a wiki topic when:

- A concept (FASTRIC, U-shape, recovery-vs-termination) has been referenced 3+ times across artifacts and deserves canonical exposition
- A non-obvious decision rule emerges from practice (when to defer vs hotfix; when MD vs HTML; when to ask vs decide)
- A multi-cycle pattern has been spotted (e.g., "every Verify dogfood surfaces an integration gap" → topic `verify-dogfood-pattern`)
- An external concept is load-bearing enough to deserve its own internal exposition (e.g., Koopman theory, JEPA architecture)

DO NOT create a topic when:

- It's a project-specific concern (use `references/` instead)
- It's a one-time review or audit (use `references/` instead)
- It's a status update or progress report (use a handoff instead)
- It's a single insight you haven't yet seen recur (wait; promote later if it does)

## File naming

```
wiki/topics/{kebab-case-slug}-{author-id}.md
```

Examples:

- `fastric-fsm-wenlong-OpusCC47.md`
- `recovery-vs-termination-wenlong-OpusCC47.md`
- `dual-channel-interface-wenlong-OpusCC47.md`
- `workflows-vs-daemon-wenlong-OpusCC47.md`

The slug is a short, stable noun phrase. **Don't** rename it later — anchors in other docs will break. If a topic outgrows its name, write a new one and leave the old one with a `superseded-by:` field.

## Required frontmatter

```yaml
---
topic: {kebab-case-slug}              # matches the filename
project: {project-or-protocol-name}    # e.g., "PiFPEV", "fpev-protocol"
status: seeded | mature | superseded   # see below
created-at: {YYYY-MM-DD}
authors: [{author-id}]                 # C8 — never empty
type: concept | concept-mechanism | architecture-comparison | history | external-summary
related: [{other-topic-slugs}]         # graph of cross-references
sources:                               # what informed this topic
  - handoffs/...
  - references/...
  - {url-or-external}
---
```

## Status values

| Status | Meaning |
|---|---|
| `seeded` | First-pass; may not survive future cycles; minimal content |
| `mature` | Stable; cited from multiple places; well-developed |
| `superseded` | Replaced by another topic (link via `superseded-by:` field) |

Most topics start `seeded`. Promote to `mature` only after the topic has been *cited from* at least one later handoff or another wiki topic.

## Type values

| Type | What it covers | Example |
|---|---|---|
| `concept` | An idea or abstraction (FASTRIC, deliberation collapse) | `fastric-fsm-{author}.md` |
| `concept-mechanism` | A protocol mechanism with how-it-works detail | `recovery-vs-termination-{author}.md` |
| `architecture-comparison` | A side-by-side comparison of approaches | `workflows-vs-daemon-{author}.md` |
| `history` | A timeline of how something evolved | `pifpev-version-history-{author}.md` |
| `external-summary` | A digest of external readings/research | `koopman-theory-summary-{author}.md` |

## Required sections (recommended; adjust as needed)

```markdown
# {Topic name in human-readable form}

## What it is

(2–4 paragraphs answering "what is this?" — the elevator pitch)

## Why it matters

(1–2 paragraphs — what breaks without this concept; what becomes possible with it)

## How it works  /  How it shows up

(detailed exposition — the meat of the topic)

## Open questions

(things this topic doesn't yet answer; pointers to gaps)

## Worked entries  /  Examples

(specific instances — actual divergences, actual cycles, actual artifacts)

## See also

(related wiki topics, handoffs, references, external links)
```

The exact section names vary; the important thing is **every topic ends with an open-questions section and a see-also section.** Open questions invite future cycles to update the topic; see-also keeps the graph navigable.

## Cross-references — link liberally

The wiki's value compounds when topics link to each other. Use this convention:

- **Internal link** to another wiki topic: `[concept-name](other-topic-{author}.md)` or just by name: `see \`recovery-vs-termination-{author}.md\``
- **Link to a handoff**: `handoffs/stage-N-...-{author}.md`
- **Link to a reference**: `references/...`
- **Link to protocol**: `workflows/fpev-cadence.md`
- **External link**: full URL

Forward links (referencing topics that don't exist yet) are OK — they mark TODO topics. They become orphaned-link warnings only if they stay dangling after a few cycles.

## Authoring rhythm

The natural rhythm: **wiki topics emerge from handoffs, not the other way around.**

1. You write something in a handoff and realize "this concept is bigger than this stage."
2. You factor it out into a `wiki/topics/` entry, status `seeded`.
3. Later handoffs cite the topic.
4. As citations accumulate, the topic gets richer.
5. Eventually it stabilizes at `mature`.

Resist creating topics speculatively. A topic that's never cited rots.

## How long should a topic be?

| Status | Typical length |
|---|---|
| `seeded` | 50–150 lines |
| `mature` | 150–400 lines |
| `superseded` | unchanged (frozen) |

If a `mature` topic exceeds 500 lines, consider splitting — usually one topic has accreted two distinct concepts.

## Worked examples — what good wiki topics look like


- `anti-collapse.md` — concept with both definition and how-it-shows-up
- `taste-and-judgment.md` — concept with applied implications
- `distributed-cognition.md` — concept with external-research framing
- `wiki-philosophy.md` — meta-topic on what the wiki itself is for (recursive)

In `~/cJWL25/Research25/PiFPEV/wiki/topics/`:

- `recovery-vs-termination-wenlong-OpusCC47.md` — concept-mechanism with worked entries log
- `workflows-vs-daemon-wenlong-OpusCC47.md` — architecture-comparison
- `fpev-protocol-wenlong-OpusCC47.md` — the protocol's own topic-level summary

Read 2–3 before authoring your first topic.

## What to update later

When you cite a topic from a new handoff, update the topic's:

- `sources:` (if the citing handoff added new evidence)
- `related:` (if it introduced a new related topic)
- `Worked entries` section (if the citation provides a concrete example)

Don't update the core sections (`What it is`, `Why it matters`) casually — they should stay stable. If you find yourself wanting to rewrite the core, the topic has actually shifted meaning, which means you might want a new topic and `superseded-by:` the old one.

## Anti-patterns

- **Topic-as-journal.** "What I did this week" — not a topic, that's a handoff.
- **Topic-as-spec.** A FASTRIC envelope spec — that's a handoff or a reference; the wiki topic is the *concept* (what FASTRIC is, why R/I/C matter).
- **Two topics on the same concept.** Merge them; `superseded-by:` one.
- **Orphan topics.** No `related:`, no incoming citations, never cited. Either flesh out or delete.
- **Forward-references that never resolve.** If `topic-X.md` references `[[topic-Y]]` for three cycles and `topic-Y.md` never gets written, either write it or remove the reference.

## How wiki authoring interacts with FPEV stages

- **Frame** identifies *what concepts the cycle needs* — produces TODO wiki topics in the gaps doc
- **Plan** doesn't usually write wiki topics; it cites them
- **Execute** may produce new topics as productive divergence (R4) reveals new concepts
- **Verify** updates topics with worked entries from the cycle, and promotes seeded → mature

## See also

- `workflows/project-folder-structure.md` — where the wiki lives in the skeleton
- `workflows/handoff-conventions.md` — handoffs cite wiki topics
