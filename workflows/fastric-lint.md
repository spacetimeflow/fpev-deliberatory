# FASTRIC lint

How to lint a FASTRIC (or FSM) specification file. Companion to `fastric-authoring.md`: that file describes how to *write* a FASTRIC; this file describes how to *check* one. Linting is the runtime's first line of defense against malformed specs.

## When to use this workflow

You're building a lint tool, CI check, or pre-commit hook that validates `*.fastric.md` or `*.fsm.md` files. Or you're a developer trying to understand what makes a spec correct.

## Output shape

A lint run produces one verdict per axis (T / R / I / C) plus an overall pass/fail:

```yaml
fsmId: cadence
file: src/fastric/cadence.fastric.md
spec_type: fastric  # or "fsm"
verdicts:
  T: passed | failed | judged
  R: passed | failed | judged    # omitted for spec_type: fsm
  I: passed | failed | judged    # omitted for spec_type: fsm
  C: passed | failed | judged    # omitted for spec_type: fsm
violations:
  - axis: T
    severity: error | warning
    rule: "states-reachable"
    message: "State 'archived' is not reachable from initial 'draft'"
errors_total: 0
warnings_total: 1
```

For `spec_type: fsm`, only T is checked (descriptive specs need only transition validity).

## T axis — Transitions

These rules apply to all specs (FASTRIC and FSM):

| Rule id | Severity | Check |
|---|---|---|
| `has-initial` | error | `initial:` is set and references a state in `states:` |
| `states-declared` | error | Every state referenced in `transitions[].{from,to}` appears in `states:` |
| `states-reachable` | error | Every state in `states:` is reachable from `initial:` via some path |
| `no-orphan-transitions` | error | Every transition's `from` state is reachable |
| `no-duplicate-from-on` | error | For deterministic FSMs, no two transitions share `(from, on)` |
| `transitions-have-ids` | warning | Every transition has a unique `id` (recommended; required for FASTRICs) |
| `cycles-detected` | informational | DFS finds cycles in the transition graph (informational — many FSMs are cyclic by design) |
| `no-self-loop-without-id` | warning | Self-loops should have explicit ids for handoff/constraint reference |

T-axis cycles are usually *not* errors. Cadence FSM, gap FSM, artifact FSM all have intentional back-edges. The lint reports cycles but doesn't fail on them.

## R axis — Roles (FASTRIC only)

| Rule id | Severity | Check |
|---|---|---|
| `agents-declared` | error | `roles.agents[]` is non-empty |
| `agents-have-ids` | error | Every agent has a unique `id` |
| `agents-have-type` | error | Every agent has `type: human|llm` |
| `transitions-have-owners` | error | **Every transition id in `transitions[]` appears in `roles.ownership.transitions`** (the load-bearing rule) |
| `ownership-references-agents` | error | Every `ownership.transitions[t]` value is either `any`, `non-author`, or a declared agent id |
| `non-author-only-on-artifact` | warning | `non-author` ownership only makes sense for artifact-typed FASTRICs |
| `permits-references-transitions` | error | Every transition id in `agents[].permits[]` references a real transition |
| `state-ownership-consistent` | warning | If `roles.ownership.states` is declared (derived view), it must be consistent with the union of outgoing-transition owners |

The headline rule is `transitions-have-owners`. It enforces R-1 (transition-keyed ownership is primary).

## I axis — Interactions (FASTRIC only)

| Rule id | Severity | Check |
|---|---|---|
| `handoffs-reference-transitions` | error | Every `interactions.handoffs[].on-transition` references a real transition id |
| `handoffs-reference-agents` | error | `from-agent` and `to-agent` are declared agents |
| `self-loops-reference-transitions` | error | Every `interactions.self-loops[].on-transition` references a real transition id |
| `self-loops-reference-agents` | error | The agent named in a self-loop is declared |
| `payload-schema-valid` | warning | If `payload-schema:` is set, it's syntactically valid (e.g., JSON Schema if used) |

## C axis — Constraints (FASTRIC only)

| Rule id | Severity | Check |
|---|---|---|
| `hooks-registered` | error | Every `constraints.preconditions[].named-hook` and `invariants[].named-hook` references a hook in the registry (built-in or project-registered) |
| `preconditions-reference-transitions` | error | Every `on-transition:` in preconditions references a real transition |
| `invariants-reference-states` | error | Every `at-state:` in invariants references a real state |
| `descriptions-non-empty` | warning | Every constraint has a `description:` (improves error messages at runtime) |

## Cross-axis rules

| Rule id | Severity | Check |
|---|---|---|
| `frontmatter-mermaid-parity` | error | The mermaid `stateDiagram-v2` block has the same set of states and the same transitions as the frontmatter |
| `c8-authors-declared` | error | The file's frontmatter has a non-empty `authors:` list |
| `spec-type-set` | warning | Frontmatter declares `spec_type: fastric` or `fsm` (avoids ambiguity) |
| `canonical-md-with-mermaid` | warning | Frontmatter declares `canonical: md-with-mermaid` |

## Lint output format

Single-file CLI output:

```
=== cadence (cadence.fastric.md) ===
  T: ✅ pass
  R: ✅ pass
  I: ⚠️ pass-with-warnings
    - payload-schema-valid: handoff t2 has no payload-schema declared (info)
  C: ✅ pass
```

Multi-file run summary:

```
==================================================
4 specs checked; 3 pass, 1 fail
- cadence:  T✅ R✅ I✅ C✅
- gap:      T✅ R✅ I✅ C✅
- artifact: T✅ R❌ I✅ C✅  (non-author owner missing on Draft→Reviewed)
- impl:     T✅          (FSM; R/I/C not applicable)

Exit code: 1 (artifact failed)
```

## Exit codes

| Code | Meaning |
|---|---|
| `0` | All specs pass (warnings OK) |
| `1` | At least one error |
| `2` | Lint tool itself errored (parser crash, missing file) |

CI invocations check `$? == 0`; a `1` blocks merge.

## Operational invocation

```bash
# Lint all specs in a directory
fastric-lint src/fastric/  src/fsms/

# Lint one specific file
fastric-lint src/fastric/cadence.fastric.md

# Lint with strict warnings (treat warnings as errors)
fastric-lint --strict src/fastric/
```

## Conformance entry — emitted to state.json

A lint pass emits one entry per spec into `state.conformance` (see `state-file-persistence.md`):

```yaml
conformance:
  cadence:
    T: passed
    R: passed
    I: passed
    C: passed
    checkedAt: ISO-8601
    violations: []
  artifact:
    T: passed
    R: failed
    I: passed
    C: passed
    checkedAt: ISO-8601
    violations:
      - "R/transitions-have-owners: non-author missing on t1 (Draft→Reviewed)"
```

Daemon and cockpit read this; the cockpit's Conformance panel reflects axis-by-axis status.

## What this workflow does NOT cover

- **Spec authoring** — see `fastric-authoring.md` (what a valid FASTRIC looks like)
- **Runtime enforcement** — see `state-machine-runtime.md` (how role/constraint checks happen at transition time, not just at lint time)
- **DAG lint** — see `dag-lint.md` (different concern: Phase DAG, not FSM)
- **Hook authoring** — see `fastric-authoring.md` §named-hooks

## Anti-patterns

- **Silent warnings.** If `transitions-have-owners` warning is silenced, the FASTRIC becomes worthless — promote that rule to error always
- **Lint without spec_type.** Specs that don't declare `spec_type:` get linted as FASTRIC, fail on R/I/C, look broken when they're actually FSM
- **Lint that fixes.** A lint tool reports; it does not modify the source. Auto-fixing FASTRIC frontmatter is dangerous (silent semantic change)
- **Coupling lint to one parser.** Use the same YAML library / mermaid parser the runtime uses, or specs that pass lint can still fail at runtime

## Implementation hints (non-binding)

v0-PiFPEV's `src/fsms/fsm-lint.ts` implements T-axis checks only (321 LoC). It has its own hand-rolled YAML parser (one of four duplicates flagged in v0 code review).

v1 unifies parsing on the `yaml` library (G4) and extends to T/R/I/C (G1, G2). Final v1 implementation: `src/state/fastric-lint.ts` (one file, all axes).

A non-TypeScript implementation could be a Python script, a shell wrapper around `yq` + custom checks, or even a markdown-aware linter plugin. The contract above is independent of language.

## See also

- `~/.fpev/fastric-authoring.md` — what FASTRICs look like as authored
- `~/.fpev/state-machine-runtime.md` — runtime enforcement of R/I/C
- `~/.fpev/dag-lint.md` — Phase DAG linting (separate concern)
- `~/.fpev/state-file-persistence.md` — where conformance entries land
