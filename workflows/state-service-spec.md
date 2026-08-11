# State service spec

The HTTP contract for serving FPEV cycle state. A "state service" (a.k.a. daemon) hosts the `orchestrator-state.json` and provides read, mutation, and live-event endpoints. This is the canonical contract for any implementation (v0's Node daemon, future Python/Rust/Go daemons, or even an MCP server).

## When to use this workflow

You're building (or interfacing with) a state service. This includes:
- Implementing the daemon for a PiFPEV runtime
- Building a cockpit, lint tool, or bridge that talks to the daemon
- Writing an external tool that wants to drive an FPEV cycle programmatically

If you only need to **read** state directly from disk, see `state-file-persistence.md` — you don't need a service.

## Default binding

```
http://localhost:7327
```

Port 7327 chosen historically (v0); not load-bearing. Configurable per deployment.

## Endpoints

### `GET /state`

Returns the current state.json contents as JSON.

| Status | Body |
|---|---|
| 200 | Full `OrchestratorState` object |
| 500 | `{ "error": "..." }` if read fails |

### `POST /action`

Submits an action to mutate state. Body is a JSON object with shape:

```yaml
type:    string   # one of the action types below
payload: object   # action-specific
```

| Status | Meaning |
|---|---|
| 200 | Action applied; body is `{ success: true, actionType, newState, event? }` |
| 400 | Bad payload (missing `type`, invalid JSON, unknown action); body has `error` |
| 500 | Server-side failure (write error, etc.) |

### `GET /events`

Server-Sent Events stream of state mutations. On connection, replays the last N events from the in-memory log, then streams new events as they happen.

```
event: connected
data: { "timestamp": "..." }

id: evt-42
event: phase.complete
data: { ... }
```

### `GET /events/history`

Returns the last N in-memory events as JSON (default N=1000, capped).

| Status | Body |
|---|---|
| 200 | `{ events: [...] }` |

### `GET /health`

Liveness check.

| Status | Body |
|---|---|
| 200 | `{ status: "ok", timestamp: "..." }` |

### Optional — `POST /webhook/{source}`

Receivers for external events (GitHub merges, email replies, etc.). Each source defines its own payload shape. See `github-bridge.md` for the GitHub source.

## Action vocabulary

These action types are canonical. Implementations may add more; the standard set is:

| `type` | Payload | Effect |
|---|---|---|
| `approve` | `{author?}` | Advance current phase to its successor (per Phase DAG) |
| `reject` | `{}` | Roll back to previous phase |
| `modify` | `{field, value}` | Set `state.{field} = value` (raw, recovery use) |
| `redirect` | `{phase, author?}` | Set current phase to the named target |
| `add-phase` | `{phaseId, deps[]}` | Add a new node to the Phase DAG |
| `adjust-alpha` | `{alpha}` | Set autonomy level (clamped 0..1) |
| `abort` | `{reason}` | Mark cycle aborted |
| `escalate-to-subcycle` | `{reason}` | Spawn a nested FPEV sub-cycle (E13) |
| `fork` | `{branchName}` | Fork the cycle (E14) |
| `split` | `{component}` | Split off a component (E14) |
| `merge` | `{fromBranch}` | Merge a branch back (E14) |

Each action handler:
1. Acquires write lock
2. Reads current state
3. Applies mutation
4. Writes state atomically (per `state-file-persistence.md`)
5. Appends history entry
6. Emits SSE event
7. Returns result

## Concurrency model — single writer

The service serializes writes. Common patterns:

- **In-memory promise chain** (v0's choice): each write awaits the prior write; reads run concurrently
- **File-level advisory lock**: `flock` on the state file
- **Optimistic concurrency**: include `version` in `POST /action`; reject if state changed since

Any pattern is OK as long as **no two writes interleave**. The cockpit's headline test is the 100× parallel-approve check: 100 concurrent `POST /action` calls must produce exactly 100 history entries with no torn writes.

## SSE event types

Standard event types broadcast on `/events`:

| Event type | When |
|---|---|
| `connected` | Client subscribes |
| `phase.complete` | A phase advances |
| `phase.reject` | A phase rolls back |
| `phase.redirect` | A phase is redirected |
| `phase.escalate` | A phase escalates to sub-cycle |
| `dag.fanout` | Multiple phases become active in parallel |
| `dag.add_phase` | A new phase added to DAG |
| `cycle.complete` | All phases reached terminal |
| `cycle.abort` | Cycle aborted |
| `cycle.init` | New cycle started |
| `state.modify` | Generic `modify` action applied |
| `alpha.adjust` | Autonomy level changed |
| `fsm.transition` | Any registered FSM advanced (FASTRIC-aware runtimes) |
| `fastric.conformance` | Lint pass completed; new conformance entry |
| `github.pr.opened` | (when bridge wired) PR opened via openHandoffPR |
| `github.pr.merged` | (when webhook configured) PR merged on GitHub |
| `github.gap.synced` | Gap status synced to GitHub issue |

Implementations broadcast events as they happen; clients filter client-side.

## CORS

For browser-based clients (cockpit), respond to OPTIONS with:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

And include `Access-Control-Allow-Origin: *` on actual responses. (For multi-tenant deployments, scope this down.)

## In-memory event log — capacity

The service keeps the last N events in memory (default N=1000). When the buffer fills, oldest are dropped (FIFO).

This is for **live monitoring**, not audit. The audit trail is in `state.history` (persisted). Don't conflate.

## Service lifecycle

```bash
# Start
npx tsx src/daemon/daemon.ts
# or
python3 -m fpev.daemon
# or any implementation conforming to this contract

# Health check
curl http://localhost:7327/health

# Stop — SIGINT or SIGTERM
kill <pid>
```

The service handles SIGINT/SIGTERM gracefully: stop accepting new connections, flush pending writes, exit clean.

## Anti-patterns

- **Multiple writers without coordination.** Two services binding to the same `state.json` — guaranteed corruption
- **Action handler bypassing atomic-write.** If an action mutates state.json directly without temp + rename, you get torn writes
- **SSE without backpressure.** Slow clients block fast event sources; implement reasonable buffering or drop
- **No request body limits.** Unbounded POST bodies enable trivial DoS; cap at ~1 MB
- **Logs in event stream.** SSE is for state changes, not application logs; conflating them confuses cockpit UI

## Implementation hints (non-binding)

v0-PiFPEV: `src/daemon/daemon.ts` implements all of the above (482 LoC). The state-file-io is currently inlined rather than imported from the shim — flagged for v1 unification (G5).

A v1 implementation:
- Imports `state-schema.ts` and `state-file-io.ts` (no inline copy)
- Adds FASTRIC-aware events (`fastric.conformance`, `fsm.transition` with `actorId`)
- Optional: webhook ingress for GitHub bridge (G14)

A non-TypeScript implementation could use FastAPI (Python), Actix (Rust), Gin (Go), or even a shell-script daemon with `socat`. Any HTTP framework works.

## See also

- `~/.fpev/state-file-persistence.md` — what's behind the API
- `~/.fpev/state-machine-runtime.md` — FSM/FASTRIC behavior the service exposes
- `~/.fpev/cockpit-design.md` — primary consumer of the service
- `~/.fpev/github-bridge.md` — webhook ingress + outbound bridge calls
- `~/.fpev/fastric-lint.md` — emits to `state.conformance`
