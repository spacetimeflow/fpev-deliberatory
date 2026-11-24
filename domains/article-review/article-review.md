---
name: article-review
type: domain-shape
status: draft
owner: the reviewer who runs this FPEV installation
reference-runs:
  - about a dozen referee cycles for journals and conferences over seven months (first rounds, revision rounds, short formats), several on local models
  - an earlier independent review shape, and an editorial-handling prior, read as histories
---

# Article review

A domain shape for refereeing someone else's manuscript with AI help, from first round to revision. Read this first. The `conventions/` say how, and are read when needed.

## Purpose

In its owner's words, the goal is "to understand and critique the work, and provide constructive helpful comments to the authors". That includes the gaps "required to be filled to understand the work", and a few comments "where the authors can meaningfully improve the mansucript".

## Scope

Referee reports for journals and conferences: first rounds, revision rounds, short formats, and recording the reviewer's own comments. Proposal review may borrow this domain and record what it strikes. Editorial handling and evaluation letters are separate kinds of work.

## The situation

A review is a judgment the reviewer signs, under confidentiality, on work that is not theirs. The manuscript often rests on a method the reviewer rarely uses, so understanding comes before critique.

An agent changes the risks. It can produce a long, fluent list of problems faster than the reviewer can check one. Some will be its own constructs, some will be wrong about what the paper says, and some will cite literature from memory. A report padded this way wastes the authors' time and spends the reviewer's name. Venues also restrict which tools may see a manuscript.

## Deliverable

A report the reviewer can submit: a recommendation, a short summary, a few major comments with evidence and a request, minor comments only if the reviewer wants them, and a note to the editor when needed. Each comment is the reviewer's own and in the reviewer's line. The record behind it is kept: a ledger of what was verified, the reviewer's gap notes, and the text actually submitted.

## Stages and roles

The four FPEV stages apply, once per round.

- **The reviewer** reads the manuscript, states their questions, decides every comment and its weight, makes the recommendation, and submits.
- **Agents** build understanding (a gap wiki, key references), verify claims against the paper, search the literature, and draft from the reviewer's findings.
- **The venue** sets the rules on tools, confidentiality and format.


| Stage | Criterion | The domain supplies | Stays with the person |
|---|---|---|---|
| Frame | understandability | the policy gate; the request type; the reviewer's questions and gaps | their reading and their questions |
| Plan | conformance | the gap-wiki plan; the checks; the ledger | approving the plan |
| Execute | quality | the claim ledger; checks against the paper; drafts from findings | nothing routine |
| Verify | insight | the draft in the reviewer's line; the recalled-reference spot-check list; spots to double-check | each comment and its weight; the recommendation; submitting |
## Cadence

Attention is heaviest at the ends, and heavier at Verify. At Frame, the reviewer gives their first reading and questions in one exchange. At Verify, the reviewer reshapes the report, often several times. Between them, agents work alone. The reviewer's verdict comes last, so the agents' work stays independent of it.

## Record

Each round keeps the reviewer's prompts and margin notes, the gap wiki, the claim ledger, each report version, and the submitted text verbatim.

## Kernel

These hold in every cycle:

- **Check the venue's policy first.** The manuscript and the report go only to tools the venue and the reviewer allow. The default is a model on the reviewer's machine.
- **The reviewer's judgment is the review.** Agents never compose the recommendation or set a comment's weight.
- **Understanding before critique.** The reviewer's gaps are named and filled first.
- **Every claim about the paper is checked against the paper,** and every literature claim is marked as verified or recalled.
- **Few comments that matter,** organized around the reviewer's questions and kept within the reviewer's competence.
- **Nothing that is not the reviewer's.** An agent's construct stays in private notes unless the reviewer adopts it.
- **In a revision round, judge the earlier comments.** Check the revised text, not the response letter alone, and add nothing new unless asked.
- **The manuscript is never modified, and nothing about it leaves the review.**
- **Nothing the reviewer said is dropped.**

## Envelopes

Agents may act alone inside these bounds. Outside them, the reviewer decides.

- Read the manuscript with an allowed tool; extract its text into the review's own notes.
- Draft wiki entries, evidence notes, a ledger, and report drafts marked as drafts.
- Search published literature by the paper's topic and citations, without sending manuscript text.

Agents may never contact authors, editors or candidates, submit anything, share the manuscript, or present a recalled reference as verified.

## What to internalize, and what stays on file

**Internalize:** whose comment each line is; the difference between what the paper says and what the agent inferred; and that a few verified comments beat many plausible ones.

**Keep on file:** the policy checks, the ledger, citation and format checklists, and the record of past reviewer corrections.

## Untested

- Whether the domain shortens reviews or improves them. The only evidence is the reviewer's own report after one cycle of more confidence in less time.
- Whether local models are enough for the checking a review needs. Several cycles ran on them; none was compared with another setup.
- How well it fits venues outside the owner's field, and proposal review.
