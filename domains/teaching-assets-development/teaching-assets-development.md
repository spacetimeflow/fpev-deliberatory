---
name: teaching-assets-development
type: domain-shape
status: draft
owner: the instructor who runs this FPEV installation
reference-runs:
  - a graduate course taught from notebook slides with live handwriting, one term, through Verify
  - a conversion of another instructor's undergraduate course into the same form, through Verify
  - two earlier accessibility and seminar efforts, read as histories
---

# Teaching assets development

A domain shape for making, teaching from and releasing the materials of a course. Read this first. The `conventions/` say how, and are read when needed.

## Purpose

In its owner's words, the aim is to "develop teaching assets as in the example(s)". The example's form is "my own format: Jupyter Notebook with RISE presentation, as well as html handouts", with "my handwritten notes" kept in what students receive.

## Scope

The assets a course gives its students. Lecture decks and their releases are the core. Syllabi, handouts, homework and exam documents get lighter defaults.

A cycle may port the instructor's earlier offering, convert another instructor's course, or write new material. Each starts differently (`conventions/course-cycle.md`).

Grading, student records, deciding course content, and posting to the course site are outside what agents do here.

## The situation

A course is taught live, on a calendar that does not wait. The instructor changes the deck in class, writes on it, runs late, and continues next week. Students need a faithful, accessible record soon after.

The dangerous failures look like success. A release can pass every checker with a misread equation, a missing page, or last term's answer key beside it. A rebuild can silently erase what the instructor wrote by hand. An agent can also improve what nobody asked it to improve, and the students then receive words their instructor never chose.

## Deliverable

A **course cycle** ends in a set of assets the instructor can teach from and post, with a routine that reproduces them. A **release** is one deck or document, in a named state (before, interim or after the lecture), ready for the instructor to post, with its doubtful readings listed.

## Stages and roles

The four FPEV stages apply unchanged, at two scales: once for the course, and again as a small nested cycle for each release.

- **The instructor** decides content and format, teaches, proofreads what is flagged, and alone posts to students.
- **Agents** port, build, transcribe, render, check, count and report.
- **The institution's checker** is the outside judge of accessibility.


| Stage | Criterion | The domain supplies | Stays with the person |
|---|---|---|---|
| Frame | understandability | the starting point (port, convert, new); the current model course; the audience; the first lecture date | content and format |
| Plan | conformance | standard decisions; release states; the routine file | approving the asset list |
| Execute | quality | render, transcribe, check, and the release count | nothing routine |
| Verify | insight | a short proofreading table; superseded copies to remove | proofreading, posting, what students see |
## Cadence

The course cycle is front-loaded before the term. During the term the lecture sets the beat: the instructor's word that a lecture is finished opens a release, and the agent runs it without further questions. The instructor's attention goes to the short list of flagged readings and to posting. At the end of the term, what was learned returns to the routine and to this domain.

## Record

Each course keeps its handoffs, the instructor's prompts unchanged, a routine file that is kept current, the transcript of each deck's handwriting, and a list of errors found in source material.

## Kernel

These hold in every cycle:

- **The instructor's deck is the source.** Once edited by hand, it is never regenerated.
- **Handwriting stays,** and what is posted is accessible.
- **Transcribe as written.** A doubtful reading is flagged, never silently corrected.
- **Faithful work and content revision are separate.** Conversion and formatting leave content alone. A port changes only what must change, and logs it.
- **Reuse the instructor's format and add nothing unasked.**
- **Each deck is released on its own.**
- **Count; do not trust a tool's success.** Compare what was released against its source.
- **The institution's checker outranks a local pass.**
- **Fix at the source,** never only in an export or on the course site.
- **Only the instructor posts.** Answer keys and instructor files never travel with a release.
- **A lesson enters the routine when it is learned.**

## Envelopes

Agents may act alone inside these bounds. Outside them, the instructor decides.

- Run a release from start to finish once the instructor has opened it.
- Fix mechanical defects in rendering and accessibility that leave the content unchanged.
- Correct an unambiguous code or label error during a port, and log it.
- Update the routine file with a lesson from a run.

Agents may never post to students, edit a hand-edited deck to change content, overwrite an approved transcript or description, or publish instructor material.

## What to internalize, and what stays on file

**Internalize:** which file is the source; the difference between faithful and improved; and the question "what would this look like if it had silently failed?"

**Keep on file:** render recipes, checker rules, page mappings, toolchain quirks and past errors.

## Untested

- Whether the domain helps on a real course. No course has yet followed it.
- Whether the lecture loop holds as a nested cycle in a second course. If it needs a different owner for Verify, this should graduate to its own shape.
- Whether syllabus and assessment work belongs here, or in a neighbouring domain. Their defaults rest on few runs.
- How far the accessibility notes hold outside the one campus and checker they came from.
- What transcript accuracy is good enough. The only bar so far is the instructor's own acceptance.
