---
created-at: 2026-09-22
created-by: Opus5CC
type: shape-file
project: v1-fpev-deliberatory-deployment
purpose: what a domain schema is, and how it complements the FPEV cadence
status: draft (domains: ocr-transcription, research-article-first-draft)
---

# `domains/` — domain schemas that complement the cadence

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
| `ocr-transcription.md` | transcribing a handwritten or scanned corpus faithfully, page by page, with a human author as the oracle | `diaries-OCR/my-dad-1994-OCR` (85 pages, 2026-09-21/22) |
| `research-article-first-draft.md` | the first draft of a research article built from explorations: claims with proofs or evidence, sources read, a checked contribution statement (draft v0) | `PiFPEV/v1-fpev-optimal-control-model` (27-page draft, 17 checks, 2026-09-23) |

## Where this lives

In this shape's `domains/` folder. It is the canonical copy.
