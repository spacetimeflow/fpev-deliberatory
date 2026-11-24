---
created-at: 2026-09-22
created-by: Opus5CC
type: shape-file
project: v1-fpev-deliberatory-deployment
purpose: what a domain schema is, and how it complements the FPEV cadence
status: draft (domains: ocr-transcription, research-article-first-draft, local-model-installation, domain-development, teaching-assets-development, youtube-transcripts, article-review, evaluation-letters, student-research-advising, research-proposals, theory-model-development, exploration-pieces, web-adapter)
---

# `domains/` — domain shapes that complement the cadence

A **domain shape** specializes FPEV for one recognizable kind of work. The three older files use the earlier name, *domain schema*. To make or improve a domain, start from `domain-development/domain-development.md`.

The cadence in `workflows/` is deliberately **domain-free**: Frame → Plan → Execute → Verify,
handoff conventions, gap lifecycle, divergence classes. That is what makes it apply to anything.
It is also why the first day of every new project is spent re-deriving the same things for the
same kind of work.

A **domain schema** is the missing middle layer. It does not replace any stage. It **pre-fills**
them for one recognizable *kind* of project:

| The cadence gives you | A domain schema adds |
|---|---|
| "Frame states the problem, architecture and gaps" | the gaps this kind of work always has (G-list with defaults) |
| "Plan has a decisions table" | the decisions this kind of work always faces, each with a recommended default and an "if wrong" |
| "Plan has a Phase DAG" | a phase template that has already been run end to end |
| "Each phase has a verification recipe" | the recipes and the numbers that count as passing |
| "Tripwires stop Execute" | tripwire thresholds measured on a real corpus |
| "`wiki/topics/` holds cross-cycle knowledge" | the topics to create on day one, and which ones are shared across sibling projects |

**The contract.** A domain schema is advice with defaults, not a constraint. The Plan may depart
from it — that departure is an ordinary R4 productive divergence, written into the Plan, and it is
how the schema improves. Nothing in `domains/` may contradict `workflows/`; where a domain needs a
rule the cadence does not have, the schema says so explicitly and proposes it as a protocol change.

## Using one

In Frame, after the problem statement, name the domain:

> This project follows `domains/<name>.md` of the shape. Departures from its defaults
> are recorded in the Plan's decisions table.

Then read the schema before writing the Plan. A schema's phase template is a starting DAG, not a
mandate; cut it down for a small corpus and say so.

## Writing one

A domain schema earns its place only **after** a project of that kind has been run end to end.
Write it from that project's phase handoffs — the `Lessons learned` and `Suggestions` sections are
the raw material — and link the project as the reference implementation, so a future agent can read
a real instance rather than only the abstraction.

Required sections: *When this applies* · *The program layer* (if sibling projects share knowledge)
· *Phase template* · *Standard decisions* · *Tripwires* · *Verification recipes* · *Standard wiki
topics* · *Metrics to record* · *Reference implementation* · *What the cadence does not supply*
(the honest list of what had to be invented, and what should be pushed back into `workflows/`).

## Schemas here

| Schema | For | Reference implementation |
|---|---|---|
| `ocr-transcription.md` | transcribing a handwritten or scanned corpus faithfully, page by page, with a human author as the oracle | `a private manuscript corpus` (85 pages, 2026-09-21/22) |
| `research-article-first-draft.md` | the first draft of a research article built from explorations: claims with proofs or evidence, sources read, a checked contribution statement (draft v0) | `v1-fpev-optimal-control-model` (27-page draft, 17 checks, 2026-09-23) |
| `domain-development/` | making and improving domain shapes: warrant, development, evidence, readiness, improvement, maintenance; value as the four criteria per unit of attention, with a stage map (draft 0.1.5) | developed in the `v1-fpev-domains-dev` project |
| `teaching-assets-development/` | making, teaching from and releasing course materials: decks with live handwriting, accessible releases, and other course assets; with a stage map (draft 0.1.1) | developed in the `v1-teaching-assets-domain-dev` project |
| `local-model-installation.md` | choosing, installing, measuring and keeping local AI models on a specific machine, with a short loop for each model change (draft v0.1) | `local-AI` (v1–v3 on two Macs, Apr–Nov 2026) |
| `youtube-transcripts/` | faithful, recorded transcripts of a video's speech: caption tracks or local speech recognition, with tools for cleanup and for loops and gaps; with a stage map (draft 0.1.1) | developed in the `v1-youtube-transcripts-domain-dev` project |
| `article-review/` | refereeing manuscripts with AI help, first round to revision: venue policy first, the reviewer's gaps, a claim ledger, few comments that are the reviewer's own; with a stage map (draft 0.1.1) | developed in the `v1-article-review-domain-dev` project |
| `evaluation-letters/` | evaluating a person for an institution: recommendation letters, promotion reviews, appraisal committees, nominations; the charge sets the standard, the evaluator's judgment is the evaluation; with a stage map (draft 0.1.1) | developed in the `v1-evaluation-letters-domain-dev` project |
| `student-research-advising/` | advising a student whose research is also done with agents: know what a version was for, trace conclusions to evidence, reveal contradictions, steer without taking over; with a stage map (draft 0.1.1) | developed in the `v1-student-research-advising-domain-dev` project |
| `research-proposals/` | a research grant's life with agents: the sponsor's rules first, claim status marked, one thesis, short honest reports, the submitted text recorded; with a stage map (draft 0.1.1) | developed in the `v1-research-proposals-domain-dev` project |
| `theory-model-development/` | developing a mathematical theory or model and its article across versions: proofs before claims, numbers from code, results placed in the literature, framing and authorship the researcher's; with a stage map (draft 0.1.1) | developed in the `v1-theory-model-development-domain-dev` project |
| `exploration-pieces/` | the exploration piece: the owner's ideas as the frame, prompts verbatim, what was read stated, voices marked, follow-ups appended; with a stage map (draft 0.1.1) | developed in the `v1-exploration-pieces-domain-dev` project |
| `web-adapter/` | running an FPEV cycle in a web chat with no files: one append-only document, every prompt verbatim, checks after import; bindings compiled for Gemini, Claude and ChatGPT; with a stage map (draft 0.1.0) | developed in the `v2-fpev-web-adapter` project |

## Versions and updates

This registry is the record of what is installed. A domain's source and its archived releases live in its development project, under `deploy/releases/<name>-<version>/`.

| Domain | Version | Requires | Source project | Content hash (first 12) | Installed |
|---|---|---|---|---|---|
| `domain-development/` | 0.1.5 | fpev 261010 | `v1-fpev-domains-dev` | `6a5344fab548` | 2026-11-23 |
| `teaching-assets-development/` | 0.1.1 | fpev 261010 | `v1-teaching-assets-domain-dev` | `cb6b7098095e` | 2026-11-23 |
| `youtube-transcripts/` | 0.1.1 | fpev 261010 | `v1-youtube-transcripts-domain-dev` | `111b10f1f8ec` | 2026-11-23 |
| `article-review/` | 0.1.1 | fpev 261010 | `v1-article-review-domain-dev` | `06f9c2b68236` | 2026-11-23 |
| `evaluation-letters/` | 0.1.1 | fpev 261010 | `v1-evaluation-letters-domain-dev` | `b5dc49794abc` | 2026-11-23 |
| `student-research-advising/` | 0.1.1 | fpev 261010 | `v1-student-research-advising-domain-dev` | `3f55f8e37f6a` | 2026-11-23 |
| `research-proposals/` | 0.1.1 | fpev 261010 | `v1-research-proposals-domain-dev` | `0349f132316a` | 2026-11-23 |
| `theory-model-development/` | 0.1.1 | fpev 261010 | `v1-theory-model-development-domain-dev` | `b9e2d1286711` | 2026-11-23 |
| `exploration-pieces/` | 0.1.1 | fpev 261010 | `v1-exploration-pieces-domain-dev` | `51f5e4c627cf` | 2026-11-23 |
| `web-adapter/` | 0.1.0 | fpev 261123 | `v2-fpev-web-adapter` | `0de520343c1c` | 2026-11-24 |
| `research-article-first-draft.md` | v0.4 | not declared | `v1-fpev-optimal-control-model` | `9d26242a98dd` | single file |
| `local-model-installation.md` | v0.1 | not declared | `local-AI` | `2759ed8e9446` | single file |
| `ocr-transcription.md` | v1 | not declared | a private corpus project | `f075e922c2bb` | single file |

Folder hashes are SHA-256 over relative paths and file contents, skipping caches. Single-file hashes are the file's SHA-256.

**To update a domain:** edit its source in the development project; raise `VERSION` and add a `CHANGELOG.md` entry with the case behind the change; run its checker and privacy scan; archive the release; and, on the owner's order, replace the installed copy and update this table. To roll back, install the archived release of the earlier version.

## Where this lives

This folder holds **deployed copies**. A domain's source lives in its development project: edit it there and redeploy on the owner's order.
