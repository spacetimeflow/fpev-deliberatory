---
name: theory-model-development
type: domain-shape
status: draft
owner: the researcher who runs this FPEV installation
reference-runs:
  - seventy-four cycles over seven months in five research lines, each developing a theory or model and its article across versions
---

# Theory and model development

A domain shape for developing a mathematical theory or model, and the article that carries it, across versions. Read this first. The `conventions/` say how.

## Purpose

To develop theory faster with agents while keeping it correct, honestly placed in the literature, and the researcher's own. In the owner's words, "framing/verification are the human's and the most critical contributions". Results "need to be rigorously verified, theoretically, numerically, and empirically", and for each result, "remember to relate to literature results".

## Scope

Theory and model research from a first framing to a submission-ready article, across many versions, including companion pieces that grow from it. It complements the research-article-first-draft domain, which covers a single first draft. Reviewing others' theory papers is the article-review domain.

## The situation

Agents now derive, simulate and write at a pace no researcher can read. A version can arrive with new theorems, figures and a confident introduction overnight. Some of it will be right and new. Some will be a sketch posing as a proof, a number nobody recomputed, a term no one in the field uses, or a claim of novelty that a known paper already settles. An agent reviewing another agent's work can report fixes that were never made.

What stays scarce is the researcher's taste: which question matters, which result deserves to be a theorem, what the story is. A step back can redirect a whole line of work.

## Deliverable

A version of the theory and its article in which every result is proved or marked as conjecture and every number is recomputed from code. The version places each result against the literature, uses fixed terminology and notation, and records what changed and why. Major changes start a new version, with the old one kept.

## Stages and roles

Each version is an FPEV cycle. Verify phases are where the researcher's directives reshape it, often over many phases.

- **The researcher** frames the version, decides the results and the story, steps back, and verifies.
- **Agents** derive, prove, simulate, search the literature, check consistency, and draft.
- **Independent agents** may develop alternatives or check each other, but neither certifies the other.


| Stage | Criterion | The domain supplies | Stays with the person |
|---|---|---|---|
| Frame | understandability | the version's question; what is established, preliminary or only an idea; related articles | the question; stepping back |
| Plan | conformance | deliverables; kinds of verification; version boundaries | approving the plan |
| Execute | quality | completed proofs; recomputed numbers; results placed in the literature; consistency checks | nothing routine |
| Verify | insight | what changed; each result's status; novelty status; contradictions | the main results, the story, each directive |
## Cadence

Frame and Verify carry the researcher's attention. Verify often runs as a long series of phases, each opened by one directive. Agents work alone in Execute.

## Record

Each version keeps the researcher's directives verbatim, the derivations and proofs, the code and results, the literature notes, a glossary, and a change record that propagates to related versions.

## Kernel

These hold in every version:

- **Framing, verification and authorship are the researcher's.**
- **A sketch is not a proof.** Complete it, or mark the result as conjecture.
- **Every number is recomputed from code and results,** never taken from a report.
- **Every result is related to the literature;** novelty is checked against prior work, and borrowed pieces are credited.
- **Verify in more than one way:** theory, numerics, and data where possible.
- **One name per concept, one symbol per quantity,** consistent between article and code.
- **Simplify by moving, not deleting.**
- **A major change is a new version.**
- **Changes propagate** to the framing and to related versions.

## Envelopes

Agents may act alone inside these bounds. Outside them, the researcher decides.

- Derive, prove, simulate and compute inside the version's folder.
- Search and read published literature; draft literature notes and novelty assessments.
- Revise presentation, terminology and notation per the researcher's directives.

Agents may never list themselves as authors, change the main results or the story without a directive, or submit.

## What to internalize, and what stays on file

**Internalize:** the question this version answers; what is proved versus believed; and where the result sits among known work.

**Keep on file:** glossaries, notation schemes, verification scripts, literature notes, and the record of versions.

## Untested

- Whether the domain speeds theory development without loss of rigor. No comparison exists.
- Whether it fits theory outside the owner's fields.
