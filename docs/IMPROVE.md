# IMPROVE — how to extend the deliberatory

*The improve layer of the sharing contract. A contribution is a small, documented,
document-native change that keeps the verify bar.*

## The shape's rules (read first)

- **The two-session discipline:** development and use never share folders. This repository
  is the tool; projects it serves keep their handoffs elsewhere.
- **Markdown canonical, code derived:** the conventions and the handoffs are canonical; every
  harness-specific surface is derived and disposable.
- **The directive principle:** consent is the human's directive, not the keystroke. The
  agent proposes; the human ratifies.
- **The verify bar:** every change ships with its check green.

## The module map (where things live)

| To change… | Go to |
|---|---|
| the feedback loop | `src/feedback/` (engine · inbox · trust) |
| the capture/export surfaces | `src/forms/` |
| the cockpit | `src/render/cockpit.ts` |
| the server and its routes | `src/server/server.ts` |
| the gate predicates | `src/gate/` |
| the harness loop | `src/chat/` |
| the conventions | `workflows/` (the embedded protocol) |

## The component contracts (the maintainer map)

| Module | Contract |
|---|---|
| `src/state/frontmatter.ts` | `splitFrontmatter(raw) → {meta, body, hadFrontmatter, error}` — tolerant on absence, reports malformed; one parser for everything |
| `src/state/reader.ts` | `readProject(root) → ProjectState` — derives stage/phase/artifacts/gaps from files; frontmatter-first, name fallback, warnings on ambiguity |
| `src/state/atomic-write.ts` | `atomicWrite(file, content, {backup})` — temp → fsync → rename; concurrent-write safe (stress-tested) |
| `src/render/cockpit.ts` | `renderCockpit(st, {crossCycle}) → HTML` — pure; panels: wiki, references, explorations, stage work, decisions, gaps, cross-cycle; the in-cockpit markdown reader; the sidebar feedback box; the SSE live-reload client |
| `src/render/surfaces.ts` / `wiki-gen.ts` / `export.ts` | card extraction + rendering; wiki family grouping; exports into `workbench/{surfaces,wiki}`; deterministic regeneration |
| `src/forms/writers.ts` / `render.ts` | canonical handoff writers (feedback/framing/verify; author frontmatter) + the capture-form HTML |
| `src/gate/predicates.ts` / `hook-install.ts` / `run.ts` | pure predicates (handoff-exists, evidence-present, non-author-acted) — report, never throw; hook install (human-chosen, requires git); one shared runner (API + hook CLI, exit 0/1) |
| `src/trace/parse.ts` / `adapters.ts` | session jsonl → trace events (post-pass exit status); adapters degrade honestly (generic = file-history-only) |
| `src/server/{server,watch,sse}.ts` | serve-on-demand HTTP (cockpit/state/events + form/gate/export routes); fs.watch + SSE push; surfaces/wiki auto-regenerate on file change; `/view` serves md as HTML (shared wiki/references allowed, traversal-guarded) |
| `bin/deliberatory` | the launcher: `[project-dir] [--port N]`, opens the browser, foreground |

## Adding a surface

A surface is a derived render of the folder. The recipe:

1. Read the state: `readProject(dir)` → `ProjectState` (or a sub-extraction).
2. Render: a pure function `state → HTML` in `src/render/`.
3. Wire: a route in `src/server/server.ts` (GET for views, POST for writes).
4. Test: add a case to the matching `tests.ts` (render must stay under 200 ms).
5. The honesty rule: the surface renders the folder and nothing else — it is derived,
   disposable, and re-generated on file change. Document it in the manual with its check
   (the verify bar).

## Extending the engine

The engine's contract: capture → inbox → push → verify → address. A new channel (e.g., an
email or webhook bridge) is a new capture path writing the same handoff format — the
machinery downstream is untouched. The verified-reply gate must never be bypassed: addressed
is the engine's to grant, on a verified reply.

## The contribution workflow

1. Read `docs/UNDERSTAND.md` and this file.
2. Make the change, small and documented; run the suites (`docs/VERIFY.md`).
3. Open a pull request with a handoff-style summary: what changed, why, the verification.

## Licensing

CC-BY-4.0 with attribution (see LICENSE and CONTRIBUTING.md). By contributing, your
contribution is licensed under the same terms.

**Verify it:** add a trivial route (or change one), run the render suite, and see the check
catch or pass — the improvement loop, proven.
