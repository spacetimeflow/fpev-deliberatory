# State file persistence

How to durably persist FPEV cycle state to disk so that the cockpit, bridges, lint, and audit tools all read a consistent snapshot. This is the **state.json contract** for any FPEV implementation.

## When to use this workflow

You're building a component that needs to:
- Save the current state of a cycle (FSMs, gaps, artifacts, conformance, history) to a single file
- Read that file back with confidence it's not partially written
- Append to an audit trail without rewriting the whole file constantly (when possible)
- Back up state before major resets
- Migrate state across runtime versions

If you just need to know what's *in* state (the schema), see the schema section below. If you need to run a service over state, see `state-service-spec.md`.

## Canonical file name

```
{project-root}/orchestrator-state.json
```

For backups: `orchestrator-state.{label}.json.bak` (e.g., `orchestrator-state.v0-final.json.bak`).

## Atomic write — the load-bearing pattern

Readers (cockpit, lint, external tools) must **never see a half-written file**. The atomic-write pattern:

```
1. Serialize state → JSON string
2. Write to tempPath = "{filePath}.tmp"
3. fsync the temp file (force OS to flush to disk)
4. rename tempPath → filePath (atomic on same filesystem)
5. On any error in steps 2–4: unlink tempPath; do not modify filePath
```

The rename step is atomic on POSIX filesystems. The fsync ensures durability across power-loss. Skip either and you get torn writes or silent corruption.

## State schema (canonical shape)

The state file is a single JSON object with these fields:

```yaml
cycleId:        string             # e.g., "v1-frame-001"
stage:          string             # "frame" | "plan" | "execute" | "verify"
phase:          string             # phase id; convention varies by stage
alpha:          number             # 0..1; autonomy level
fsms:           {<id>: {state, branch?}}                        # FSM snapshots
dag:            {<phase>: {status, deps[], branch?, alpha?, ...}} # Phase DAG state
gaps:           {<id>: {status, evidence?, assigned?, path?, ...}}  # gap entries
artifacts:      {<id>: {status, lastAuthor?, path?, stage?, phase?, kind?, ...}}
conformance:    {<id>: {T?, R?, I?, C?, checkedAt, violations[]}}  # FASTRIC lint result
wiki:           [{id, path, title, tag?}]   # cross-cycle topics (indexed for cockpit)
references:     [{id, path, title, tag?}]   # this-cycle references
openQuestions:  [{id, question, status, answer?, raised-by, owns}]
github:         {repo?, branch, bridgeStatus, lastSync?, prs[], issues[]}
parent_branch:  string?            # E14 — fork/split/merge support
merged_from:    string[]?          # E14 — fork/split/merge support
history:        [{timestamp, type, from, to, reason?, author?, branch?}]
timestamp:      ISO-8601           # last update time
```

Implementations may add fields; they must not silently drop fields they don't recognize (preserve on round-trip).

## History — append-only audit trail

The `history` array is **append-only**. Entries are added; never modified after creation. Each entry records one significant event:

```yaml
timestamp: ISO-8601
type:      string   # "phase.complete", "fsm.transition", "action.approve", "cycle.init", "cycle.fork", ...
from:      string   # previous state/phase/value
to:        string   # new state/phase/value
reason:    string?
author:    string?  # agent or human who initiated
branch:    string?
```

Append patterns:

```
appendHistory(filePath, entry):
    state = readState(filePath)
    if state is null: return failure
    entry.timestamp = nowISO()
    state.history.push(entry)
    state.timestamp = entry.timestamp
    return writeState(filePath, state)
```

For high-frequency events (SSE events, transient UI state) — do NOT append to history. History is the durable audit trail, not the event log. Events are in-memory and capped (see `state-service-spec.md`).

## History rotation (when it gets long)

When `history.length` exceeds a threshold (default: 1,000 entries, ~50 KB) or `state.json` size exceeds ~50 KB:

- Move entries older than {threshold-date} to `state-history-{cycleId}.jsonl` (one entry per line)
- Keep recent entries (last N or last 30 days) in the live state.json
- Cockpit/lint readers consume the live state; deep audit consumers can read the rotated `.jsonl`

This is **optional** — small cycles don't need it. Implement when actual size becomes a problem (per v0's measured ~17 KB → 172 KB over one cycle, rotation triggers ~2–3 cycles in).

## Backup convention

Before destructive operations (cycle reset, schema migration, mass mutation):

```bash
cp orchestrator-state.json orchestrator-state.{label}.json.bak
```

Labels reflect the moment: `pre-migration`, `pre-reset`, `v0-final`, `before-mass-modify`.

`.bak` files are **read-only** historical records. They are not in the active read path. If you need to restore, copy `.bak` over `state.json` explicitly.

## Schema migration

When the schema changes between versions:

1. Detect the version (an explicit `schemaVersion: 1` field is best; v0 doesn't have one, infer from field presence)
2. If old format, transform to new before returning from `readState`
3. Write the new format on next `writeState`
4. Record the migration as a history entry: `{type: "schema.migration", from: "v1", to: "v2"}`

The runtime **never silently drops fields** — if migration would lose data, fail loudly and require manual intervention.

## Conformance entry shape

The `conformance.<fsmId>` entry has evolved:

```yaml
# v0 shape (single string)
conformance:
  <fsmId>: "passed" | "judged" | "failed"

# v1 shape ({T, R, I, C} per axis)
conformance:
  <fsmId>:
    T?: "passed" | "failed" | "judged"
    R?: "passed" | "failed" | "judged"
    I?: "passed" | "failed" | "judged"
    C?: "passed" | "failed" | "judged"
    checkedAt: ISO-8601
    violations: string[]
```

Migration: if reading a v0 entry (string), interpret as `{T: <value>}` and omit R/I/C until next conformance check.

## Anti-patterns

- **Non-atomic writes.** Direct write to `state.json` without temp + rename — torn writes guaranteed under crash
- **Multiple writers.** Several processes writing the file concurrently — use a daemon or file-lock (see `state-service-spec.md`)
- **History modification.** Editing a past history entry — destroys audit; if a record is wrong, append a correction entry, never modify
- **Schema drift.** Adding fields without coordinating across readers (cockpit, lint, bridge) — readers crash on unknown structure; the cure is canonical schema documentation in this file
- **Loss-on-migrate.** Migration that drops unrecognized fields — preserve unknowns even if you can't use them

## Implementation hints (non-binding)

v0-PiFPEV: `src/state/fastric-pifpev/state-file-io.ts` implements writeState / readState / appendHistory. Daemon inlines a second copy (divergence flagged for v1 unification — see G6).

v1's unified implementation (planned):
- `src/state/state-schema.ts` — canonical `OrchestratorState` type
- `src/state/state-file-io.ts` — atomic write + history append
- Both shim and daemon import the same module

A non-TypeScript implementation could use a SQLite database with the same logical shape (state as a JSON column, history as a separate table). The contract above (atomic write, append-only history, round-trip preservation) holds regardless of storage backend.

## See also

- `~/.fpev/state-machine-runtime.md` — what's persisted
- `~/.fpev/state-service-spec.md` — serving state over HTTP
- `~/.fpev/fastric-lint.md` — what produces conformance entries
- `~/.fpev/divergence-classes.md` — R-class divergence in state
