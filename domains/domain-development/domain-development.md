---
name: domain-development
type: domain-shape
status: draft
owner: the person who runs this FPEV installation
reference-runs:
  - the FPEV project that developed this domain
  - four earlier domains, read as histories
---

# Domain development

A domain shape for making and improving domain shapes. Read this first. It says what the work is. The `conventions/` say how, and are read when needed.

## Purpose

In its owner's words, the aim is "a proper domain for domain-development", covering "how to develop and improve a domain". The premise is the owner's too: "FPEV is not just one shape, but a framework of many shapes".

A **domain shape** specializes FPEV for one recognizable kind of work. It changes neither FPEV's stages nor who holds them. Its task, in the owner's words, is to "further/better automate tasks in F-P-E-V so as to reduce human attention but still improve" four things: understandability at Frame, conformance at Plan, quality at Execute, and insight at Verify. Its value is that gain per unit of the owner's attention.

## Scope

Making a new domain shape, and improving an existing one. Reviewing an older single-file domain uses this as a lens only. Designing an independent shape, or changing FPEV itself, is out of scope.

## The situation

Recurring work teaches the same lessons repeatedly, and most are lost between projects. Agents can now write a plausible method in minutes, which is the danger. A fluent method drawn from an agent's own account carries the agent's blind spots, reads as authority, and can pass every check its author thought of while failing the person it serves.

A domain therefore earns each line. Its evidence is real work, the owner's own words and corrections, and tests that were able to fail.

A one-off belongs in a prompt; exact, judgment-free steps belong in a program. Start from a simple domain shape; when recorded departures warrant it — a significant cadence, or a stage the framework does not have — it graduates to a shape of its own. A skill is only a harness's way of reaching one of these.

## How a domain comes to be

The owner describes the path: first use FPEV, with a domain or without, "on a project with human steering". "After several rounds, we can then summarize it and generalize it into a domain type. With more uses, we'll be able to further improve the domains." A domain is a summary of steered practice, and the record of that practice makes the summary possible.

## Deliverable

A cycle of this domain ends in a **versioned domain folder**, developed in its own project and deployed as a copy on the owner's order, with the evidence for its status. An improvement cycle ends in a **ruled change** to such a folder.

```
<name>/
  <name>.md      the idea file: what the work is
  conventions/   phases, recipes, decisions
  templates/     optional
  tools/         optional: exact, recurring steps only
  skills/        optional: harness bindings, derived
  checks/        required if there are tools
  VERSION        its version and the FPEV version it requires
  CHANGELOG.md
```

## Stages and roles

The four FPEV stages apply unchanged. The owner rules; agents mine, draft, check and propose; a fresh reader tests the files alone.

| Stage | Criterion | The domain supplies | Stays with the owner |
|---|---|---|---|
| Frame | understandability | the warrant questions; the owner's words, mined | the purpose; whether to make it |
| Plan | conformance | frozen defects; test bars set first | approving the plan |
| Execute | quality | sorting, marking, cutting; checks shown to fail | nothing routine |
| Verify | insight | a short list of rulings, each with its case | the rulings; explaining the core |

## Cadence

The owner's attention is the scarce resource. It is spent at four moments: whether to make the domain, what its purpose is, each ruling on evidence, and the first real use. Between them the agents work alone. An improvement is batched and triaged, so the owner rules on few changes, each with its case.

## Record

Each domain keeps its development project, the owner's prompts unchanged, a defect list, test results, a ruling for each change, and a changelog.

## Kernel

These hold in every cycle:

- **Practice first.** A domain comes from work that has been run.
- **The owner's words outrank the agent's account** of what the work needs.
- **The idea file holds no procedure.** Detail lives in conventions, and only what is exact and recurring hardens into tools.
- **Every normative line shows where it came from.**
- **A check must be shown to fail** before its pass is believed.
- **Agents propose. Only the owner certifies**, sets status or deploys.
- **No private material** in a deployed domain, and no weights or generated media.
- **A domain never overrides FPEV.** A need it cannot meet is reported as a protocol gap.

## Envelopes

Agents may act alone inside these bounds. Outside them, the owner decides.

- Draft, test, revise and run the checker inside the development project.
- Propose a change that names a real case where its absence went wrong.

Agents may never write to an installed shape, change a domain's status, or discard a recorded departure.

## What to internalize, and what stays on file

**Internalize:** the warrant question, the difference between idea and procedure, which criterion each line serves, and the habit of asking what would show a check is wrong.

**Keep on file:** checklists, templates, thresholds and the record of past defects.

## Where to read next

`conventions/warrant.md` · `develop.md` · `evidence.md` · `readiness.md` · `improve.md` · `maintain.md`

## Untested

- Whether domains made this way beat domains made without it. One small forward test found no difference, with a ceiling; the four criteria and attention per use are not yet measured.
- Whether every kind of work fits an idea file plus conventions.
- Whether the thresholds for readiness hold beyond the four histories they came from.
