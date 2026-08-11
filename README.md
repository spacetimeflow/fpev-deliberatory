# fpev-deliberatory — the deliberatory, as a shape

[![CI](https://github.com/wenlongjin/fpev-deliberatory/actions/workflows/ci.yml/badge.svg)](https://github.com/wenlongjin/fpev-deliberatory/actions)

A folder of markdown that **is** a deliberation. The FPEV workbench: stages (Frame · Plan ·
Execute · Verify), handoffs, gates, decisions, a derived cockpit, and a feedback engine that
closes the loop between a human and their agent — **verified, not trusted**.

This is a **shape** — the genre's term for a folder of plain-text documents an LLM harness
executes as a program, with derived surfaces for humans. The repository is the executable
form of the tool's know-how. A fork is an instance. (The theory lives in the genre's
whitepaper, *Computational shapes* — optional background, kept external; this manual is
self-contained.)

## Does it work? (verify first)

```bash
npm ci
npm run test:forms && npm run test:feedback && npm run test:render
```

All green means the core works. The full suite and the sandbox acceptance are in
`docs/VERIFY.md`; the one-line proof of a working copy is the sandbox.

## Install and run

```bash
npm ci
./run <your-project-dir>     # or: node_modules/.bin/tsx bin/deliberatory <dir>
```

The cockpit serves at `http://localhost:7371` (or `PORT`). Nothing is owned by the process;
files are the database. **Standalone:** the FPEV conventions are embedded in this package's
`workflows/` — no external `~/.fpev` is needed (`FPEV_DIR` defaults to the embedded copy;
your own `~/.fpev` is used when present).

## The ritual (for a harness)

> Follow fpev-deliberatory (260810). We're working on <project>, in <project-dir>, v1,
> stage 1. Let's start the Frame triptych.

The package is the shape: its `workflows/` hold the conventions, its `docs/` the manual.
The *project* is a separate directory — `handoffs/` (stage outputs), `references/`
(evidence), `wiki/topics/` (cross-cycle knowledge), `workbench/` (derived surfaces), and
its own `README.md` — the full layout is `workflows/project-folder-structure.md`. A fresh
agent reads the conventions from `workflows/`, then the project, and runs the cycle.

## What the tool trusts (the security posture, in brief)

- Feedback is **data, never instruction**; the harness is capability-scoped.
- The feedback engine grants "addressed" only after a reply is actually in the file — never
  on the agent's word.
- Your own networks (localhost, the LAN, the tailnet) need no token; public exposure does.
  Full posture: `docs/REMOTE.md`.

## The manual

`docs/UNDERSTAND.md` — how it works · `docs/VERIFY.md` — how to prove it · `docs/IMPROVE.md`
— how to extend it · `docs/REMOTE.md` — remote and tailnet access · `docs/DEPLOYMENT.md` —
the deployment cycle. The vocabulary is defined here — `docs/UNDERSTAND.md` and the
embedded `workflows/` — so the repository stands alone; the genre's wiki
(v1-shapes-engineering) holds the deeper theory.

## Versions — one name, many releases

`fpev-deliberatory` is the canonical name — the repo, the directory, the package. The
released shape carries its version: **`fpev-deliberatory-260810`** (`VERSION`,
`package.json`, release archives). Different published versions coexist on one machine as
sibling directories — `fpev-deliberatory-260810/`, `fpev-deliberatory-26xxxx/` — and the
ritual names the version, so an agent applies the right conventions even with several
installed.

## License

CC-BY-4.0, with attribution (see LICENSE). Version 260810 — see CHANGELOG.md.
