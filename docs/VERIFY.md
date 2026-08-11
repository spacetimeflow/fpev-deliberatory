# VERIFY — how to prove the tool works

*The verify bar: every claim in this manual has a runnable check. This is that bar, made
concrete.*

## The test suites

```bash
npm run test:forms       # the capture/export writers and surfaces
npm run test:feedback    # the inbox ledger, the engine, the verified-reply gate, trust
npm run test:render      # the cockpit renders a project cleanly
npm run test:integration # the watcher and atomic writes
npm run test:parse       # the handoff parser against the corpus
npm run test:gate        # the gate predicates
npm run test:chat        # the harness loop
npm run test:exports     # the surface exports
npm run test:framing     # the framing extraction
npm run test:fmview      # the frontmatter view
```

All green means the core works.

## The sandbox acceptance (the one-line proof of a working copy)

The sandbox is the author's deployment test, run outside this repository: it takes a clean
bundle of the tool and a scratch project and asserts, line by line: cockpit serves · reader
serves · the token gate (trusted networks need no token; strict mode gates strangers with a
401) · the remote page · feedback POST · surfaces and wiki generate · the inbox ledger
records · the reply gate (a silent agent keeps the item pending) · the pending API · the
address API · pending clears after · the drift-lint. It is not shipped here — like the
drift-lint, it is author-side.

A user's copy is proven when the suites above pass and `./run <project>` serves the
cockpit: open `http://localhost:7371/` and see the project rendered.

## The drift-lint (author-side)

`bin/fpev-drift-lint.sh` compares the embedded `workflows/` against the author's canonical
`~/.fpev` (with `FPEV_DIR`). Its domain is the **publishable conventions** — `~/.fpev`'s
top-level files; the author's private dev records under `~/.fpev/workflows/` (and `.DS_Store`
noise) are excluded, since they are deliberately not shipped (the two-session discipline).
For users, the embedded copy *is* canonical; the lint is the author's pre-publish check that
the published conventions match the canonical protocol.

## How to verify a claim in this manual

Take any claim, find its check, run it. If the check is missing, the claim is a promise —
file it. That is the manual's own test.

**Verify it:** run `npm run test:feedback` and watch the verified-reply gate test pass —
the engine's refusal to trust the agent's word, proven.
