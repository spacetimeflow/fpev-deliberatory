# Changelog

## 0.1.5 — 2026-11-23

From the owner's follow-up in Stage 4 Phase 11: each domain can give guidelines for each of the four stages.

- The idea file's *Stages and roles* carries a stage map: criterion, what the domain supplies, and what stays with the person. The template asks for it.
- `conventions/develop.md` asks for guidance in every stage, with the essentials of each, and only from a case. The case: an audit of the nine installed domains found guidance concentrated in Execute, and five with almost none for Verify.

Reviewed against fpev 261010; compatible with fpev 261123.

## 0.1.4 — 2026-11-23

From the owner's Stage 4 Phase 11 framing: a domain's task is to automate within F-P-E-V so as to reduce human attention while improving understandability, conformance, quality and insight.

- The idea file states the task in the owner's words, and gives a domain's value as the gain in the four criteria per unit of attention.
- `conventions/develop.md`, *Design against the four criteria*: for each stage, what is automated, what is pre-filled, what stays with the person; free attention moves to Verify.
- `conventions/improve.md`, *Measure value, not only conformance*: a per-use record of attention, quality, understandability and insight.

Reviewed against fpev 261010; compatible with fpev 261123.

## 0.1.3 — 2026-11-23

From the owner's Stage 4 Phase 10 observation, and the first three domains made with this one.

- The idea file states the path in the owner's words: steered use, summary and generalization after several rounds, improvement with more uses.
- `conventions/develop.md` lists the traces that let a later domain be extracted. The case: teaching prompts survived only in session logs; transcript commands were never recorded outside sessions; article review was built from process files alone because confidential artifacts were known.

Reviewed against fpev 261010.

## 0.1.2 — 2026-11-23

The boundary with an independent shape is now a process, per the owner's Stage 4 Phase 4 strategy, adopted in Phase 5.

- The idea file says to start as a domain and graduate on recorded departures.
- `conventions/warrant.md` question 3 and its graduation signs now say the same. Without this the file contradicted the strategy. The case: teaching work, with a release after each lecture, was sent out of the domain by the old question 3.

Reviewed against fpev 261010.

## 0.1.1 — 2026-11-23

The privacy check is now part of the schema, per the owner's Stage 4 Phase 2 word.

- The domain ships `checks/privacy_scan.py`, which runs the privacy check on any folder
  (the installed shape, a release, a repository before a push), with the owner's private
  terms passed by flag and kept outside the domain.
- The checker's F10 now also recognizes credentials and private networks, matching the scan.
- Readiness and deployment require the privacy check to pass before a share.
- One planted fault added to the checker's self-test.

Reviewed against fpev 261010.

## 0.1.0 — candidate, 2026-11-23

First version, developed in its own FPEV project. Reviewed against fpev 261010.

The idea file's *Untested* section now states the forward test's result: no measured benefit.
