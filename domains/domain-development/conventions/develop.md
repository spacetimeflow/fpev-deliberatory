# Developing a domain

Evidence marks are defined in `warrant.md`.

Make a domain as an FPEV project, usually `v1-<name>-domain-dev`. Its deliverable is the folder. [run]

## Frame

- Quote the owner's purpose. Never let an agent's inferred motive stand in for it. [run]
- Name the reference runs, and read them as evidence. Say whether a future reader can reach each one, and summarize any that cannot be reached. [run]
- Check the domain's name and key terms against FPEV and existing domains. If one concept has two names, the owner chooses one before drafting. [run]
- State the scope: which neighbouring variants are excluded, and what changes when prior artifacts already exist. [run]
- List private material that must stay out of the deployed files. [run]
- Name any domain this one depends on. [run]

## Plan

- **Freeze a list of the recorded defects and traps before drafting**, so the domain cannot be fitted to a list written afterward. [inferred] Falsified if frozen and unfrozen lists yield the same domains.
- State the test measures and their bars before any test runs. [run]
- Decide what, if anything, hardens into a tool. The default is nothing. [run]

## Execute

1. **Mine the owner's words first.** Prompts and corrections are the requirements corpus; the agent's artifacts are evidence about the agent. [external]
2. **Collect the recurring decisions, traps and recipes** from the handoffs, with citations. [run]
3. **Sort every candidate line** into what the work is, what it produces, what may not be done, how judgment is exercised, or how to do it. [external]
4. **Put the first four in the idea file**, and "how to do it" in conventions. [owner]
5. **Mark each normative line** with its evidence (`evidence.md`). [external]
6. **Cut.** Keep the idea file to about 1,000 words and all conventions to about 4,000. [inferred] Falsified if a cold reader fails because something was cut.
7. **Run the checker**, and show it failing on a planted fault. [run]
8. **Check consistency** with FPEV and with the domain's own doctrine: templates and tools must not contradict the idea file. [run]
9. **Test with a fresh reader** from the files alone (`readiness.md`), on a task that reaches an edge of the scope. [run]

## Design against the four criteria

Each stage has a criterion: understandability at Frame, conformance at Plan, quality at Execute, insight at Verify. [owner]

- For each stage, decide what the domain automates, what it pre-fills for the person, and what stays with the person. [owner]
- Automate mainly in Plan and Execute. Frame and Verify are pre-filled and focused, not automated. [run]
- Free attention should move to Verify, where insight is formed. A domain must not save attention by lowering understandability or insight. [inferred] Falsified if domains that cut Verify attention show no later loss of quality or insight.
- Name what the person should internalize, so that some of the saving comes from learning, not only from agents. [run]
- Put a stage map in the idea file's *Stages and roles*: for each stage, its criterion, what the domain supplies, and what stays with the person. [owner]
- Give every stage its guidance, not only Execute. An audit of nine domains found most guidance in Execute, and five domains with almost none on what the person reads at Verify. [run]
  - **Frame:** the questions to settle in one exchange, the usual gaps with defaults, and the owner's words to capture. [run]
  - **Plan:** standard decisions with a default and an "if wrong", phase defaults, and tripwires. [run]
  - **Execute:** recipes, counts against the source, and checks shown to fail. Mechanical checks belong here, not in Verify. [run]
  - **Verify:** what the person reads (a short flagged list), the test of understanding, and what the record keeps, such as the version actually used. [run]
- Add a stage's guidance only from a case. More guidance costs every reader's attention. [run]

## Keeping traces a later domain can use

Any project might later become a domain's reference run. These traces made extraction possible, and their absence made it harder. [run]

- **The owner's prompts, unchanged, in `references/`.** Where they were missing, only harness session logs held them, and some were lost. [run]
- **Verify handoffs that record each correction and its reason.** They were the richest single source. [run]
- **The version actually used or submitted,** beside the agent's last draft. [run]
- **The commands of exact, recurring steps,** in a routine file rather than only in a session log. [run]
- **Which artifacts are confidential,** so that a domain can be built from process files alone. [run]
- Work done outside FPEV leaves only session logs and file headers, so its procedure must be reconstructed. [run]

## What each file holds

- **Idea file:** purpose, situation, deliverable, how the domain fills stages and roles, cadence, record, kernel and envelopes; what to internalize; what remains untested. [run]
- **Conventions:** phase defaults, standard decisions with an "if wrong", tripwires and verification recipes. [run]
- **Templates:** only what is copied repeatedly. [inferred] Falsified if projects keep re-creating an omitted form.
- **Tools:** exact, recurring steps. A tool that disagrees with the schema has a bug. [run]
- **Skills:** generated bindings for a harness, without machine-specific paths. [run]

## Phase defaults

A domain may supply default phases inside a stage. It may not add a stage or move a stage's owner. [owner] A Plan may depart from any default, recording an R4. [run]

## Verify

The owner reads the domain, tries it, and explains its core without the file. Agents do not call a domain finished. [owner]
