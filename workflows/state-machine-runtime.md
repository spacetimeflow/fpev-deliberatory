# State machine runtime

How to *run* the FSMs and FASTRICs that `fastric-authoring.md` specifies. The authoring guide describes the spec format; this guide describes how a runtime manages N of them concurrently, transitions between states, snapshots and restores, and mutates structure mid-cycle.

This is a workflow specification, not an implementation. Any runtime (TypeScript, Python, Rust, in-agent-only) that satisfies these requirements is conformant. v0-PiFPEV's `src/state/fastric-pifpev/` is one implementation.

## When to use this workflow

You're building (or specifying) a component that:
- Holds multiple named state machines simultaneously
- Transitions them on events with role/constraint enforcement (for FASTRICs)
- Persists their state across sessions
- Allows runtime structural mutation (propagate-back support)

If you just need to *read* a FASTRIC's spec, see `fastric-authoring.md`. If you need to lint one, see `fastric-lint.md`.

## Core abstraction — the multi-FSM store

A runtime that manages N named state machines provides:

```
register(fsmId, config[, initialSnapshot])  → registers a new named FSM
get(fsmId)                                   → returns the FSM instance
transition(fsmId, event[, actorId])          → fires a transition; returns new state
getSnapshot(fsmId)                           → current state of one FSM
getAllSnapshots()                            → state of all FSMs (for state.json persist)
restoreFromSnapshots(snapshots)              → rehydrate from saved state
```

For FASTRICs (prescriptive specs), `transition` additionally:
1. Resolves the transition id from `(from, on)` against the config's transitions array
2. Looks up `roles.ownership.transitions[transitionId]`
3. If the owner is a specific agent and `actorId` doesn't match → throw `RoleViolationError`
4. If the owner is `non-author`, looks up `state.artifacts[artifactId].lastAuthor` and checks `actorId !== lastAuthor`
5. Runs each declared precondition hook; first failure → throw `ConstraintViolationError`
6. Advances state

For FSMs (descriptive specs, `spec_type: fsm`), steps 2–5 are skipped — only `T` enforcement.

## Snapshot / restore contract

A snapshot is a serializable structure containing the FSM's current state and any per-FSM metadata. The runtime must guarantee:

| Property | Constraint |
|---|---|
| Round-trip | `restoreFromSnapshots(getAllSnapshots())` returns the runtime to an equivalent state |
| Immutability | Snapshots are not modified after capture; deep-copy if the source structure is mutable |
| Compatibility | A snapshot from yesterday's runtime version should restore in today's, OR an explicit migration step must be declared |
| Atomicity | `getAllSnapshots` returns a consistent view; no partial state mid-transition |

Snapshots are *not* the same as the persisted state.json file. The store's snapshot is the in-memory truth; state.json is the durable record. See `state-file-persistence.md` for the persistence layer.

## Runtime mutation (the FSMMutator pattern)

Productive divergence (R4) often wants to add/remove transitions or rename states mid-cycle. The runtime supports this via a *delta* abstraction:

```
applyDelta(fsmId, delta[, author]) → ApplyDeltaResult
```

Delta shape:

```yaml
addTransitions:        # append to the FSM's transitions list
  - { id: t9, from: ..., on: ..., to: ... }
removeTransitions:     # match on (from, on) — exact
  - { from: ..., on: ... }
renameState:           # rename across all transitions + current state
  from: old-name
  to: new-name
addState:              # introduce a new state (no transitions yet)
  name: new-state
```

**Atomicity is required.** Either all delta operations apply or none do. The standard pattern: build a new FSM from the mutated config + current snapshot, replace the store's entry atomically. If construction fails, the old FSM remains.

Every applied delta produces an **audit entry**:

```yaml
timestamp: ISO-8601
fsmId: ...
delta: {original delta object}
prevState: state-before-mutation
newState: state-after-mutation
author: actor-id
```

The audit trail is part of the durable record (typically merged into state.json#history).

## Errors

Standard error vocabulary:

| Error | When |
|---|---|
| `FSMNotRegisteredError` | `get`/`transition` called with unknown `fsmId` |
| `InvalidTransitionError` | No transition matches `(from, on)` for the current state |
| `RoleViolationError` | (FASTRIC only) `actorId` not permitted on the transition |
| `ConstraintViolationError` | (FASTRIC only) precondition hook returned false |
| `DeltaConflictError` | `applyDelta` cannot reconcile (e.g., remove transition that doesn't exist) |
| `SnapshotMismatchError` | `restoreFromSnapshots` fed a snapshot from an incompatible config |

Errors are *typed*; callers catch them and decide recovery (R1/R2/R3/R4 per `divergence-classes.md`).

## What this workflow does NOT cover

- The *spec format* (frontmatter, mermaid block) — see `fastric-authoring.md`
- *Linting* the spec — see `fastric-lint.md`
- *Persisting* the state file — see `state-file-persistence.md`
- *Hosting* the runtime via HTTP — see `state-service-spec.md`
- *Authoring named hooks* (`handoff-exists`, `evidence-present`, `non-author-acted`, custom) — see `fastric-authoring.md`

## Implementation hints (non-binding)

For reference, v0-PiFPEV implements this in TypeScript:
- `src/state/fastric-pifpev/multi-fsm-store.ts` — the store + transition (currently lacks `actorId`; v1 adds it)
- `src/state/fastric-pifpev/fsm-mutator.ts` — applyDelta + audit
- Wraps Pi-FASTRIC's `InterAgentFSM` rather than implementing a new engine

A v1 / v2 / non-TypeScript runtime could:
- Use a state-machine library (XState, Python `transitions`, Rust `statig`, etc.)
- Build from scratch with a discriminated-union states type
- Run state in an in-agent context (no separate runtime — the agent IS the runtime; this is the skill-native baseline)

All conform if they satisfy the contracts above.

## Anti-patterns

- **Hidden mutation.** Modifying a transition without going through `applyDelta` — loses the audit trail
- **Snapshot lock-in.** Embedding format details in snapshots that prevent runtime version migration
- **Tight coupling to one FSM library.** A wrapper layer (like v0's MultiFSMStore wrapping InterAgentFSM) is the safe pattern
- **Per-transition role check that bypasses hook registry.** Constraints belong in named hooks, not inlined in transition logic — keeps hooks reusable

## See also

- `~/.fpev/fastric-authoring.md` — what FASTRICs look like as authored
- `~/.fpev/fastric-lint.md` — checking spec correctness before runtime
- `~/.fpev/state-file-persistence.md` — durable storage of state
- `~/.fpev/state-service-spec.md` — HTTP runtime contract
- `~/.fpev/divergence-classes.md` — error → R-class mapping
