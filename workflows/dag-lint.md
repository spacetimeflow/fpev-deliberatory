# DAG lint

How to lint a Phase DAG (or any directed acyclic graph) specification file. Companion to `stages/2-plan.md`: Plan stage produces a DAG; lint catches structural errors before Execute starts.

## When to use this workflow

You're checking a `*.dag.md` file or any frontmatter declaring `nodes:` and `edges:` for graph validity.

## Output shape

```yaml
file: src/plans/phase.dag.md
planId: phase-dag
verdicts:
  acyclic: passed | failed
  source-sink: passed | warned
  reachability: passed | failed
  declared-vs-edge: passed | warned
violations:
  - rule: cycles
    severity: error
    message: "Cycle detected: P4 → P5 → P4"
errors_total: 0
warnings_total: 1
```

## Rules

| Rule id | Severity | Check |
|---|---|---|
| `cycles` | error | DFS three-color algorithm finds no cycles (DAGs must be acyclic — that's the D in DAG) |
| `has-source` | error | At least one node has in-degree 0 (a starting point exists) |
| `single-source-preferred` | warning | Exactly one source node (multiple sources are valid but unusual; warn for review) |
| `has-sink` | warning | At least one node has out-degree 0 (a terminal point exists) |
| `all-reachable` | error | Every node is reachable from at least one source |
| `declared-nodes-match-edges` | warning | Every node in `nodes:` appears in at least one edge; every node in edges appears in `nodes:` (or doesn't, with a warning either way) |
| `edge-references-real-nodes` | error | Every edge's `from` and `to` reference declared or used nodes |
| `parallel-pairs-valid` | warning | If `parallel_pairs:` is declared, each pair member must be a node and reachable from a common ancestor |

## DAG vs FSM — when to use which lint

| If the structure... | Use |
|---|---|
| Represents per-cycle work that happens once each, in order | **DAG lint** (this file) |
| Represents state transitions a system passes through repeatedly | **FASTRIC/FSM lint** (see `fastric-lint.md`) |
| Has back-edges (revisit a prior node intentionally) | Probably an FSM, not a DAG |

Phase DAGs are **per-cycle execution plans**. Cadence/gap/artifact lifecycles are FSMs/FASTRICs. Don't lint one with the other's rules.

## Cycle detection — the load-bearing rule

A DAG with a cycle is a *contradiction in terms*. The DFS three-color algorithm:

```
WHITE = 0, GRAY = 1, BLACK = 2
color[node] = WHITE for all nodes

dfs(node):
    color[node] = GRAY
    for next in neighbors(node):
        if color[next] == GRAY:  return CYCLE_DETECTED
        if color[next] == WHITE and dfs(next):  return CYCLE_DETECTED
    color[node] = BLACK
    return OK
```

If a node has GRAY status when revisited, it's on the current recursion stack → cycle.

## Source/sink analysis

- **Source** = in-degree 0 (no incoming edges)
- **Sink** = out-degree 0 (no outgoing edges)

Healthy DAGs have one source and one or more sinks. Multiple sources usually indicate two unconnected sub-graphs (often a planning mistake — the warning prompts review).

Example healthy: `P0 → P1 → P2 → P3 → P4` (one source P0, one sink P4)
Example with parallel branches: `P0 → P1 → {P2, P3} → P4` (one source P0, one sink P4, but P2 and P3 are parallel)

## Reachability

Run BFS from each source; the union of visited nodes must equal `allNodes`. Unreachable nodes are dead code in the plan — usually a leftover from Plan iteration.

## Operational invocation

```bash
# Lint all DAGs in a directory
dag-lint src/plans/

# Lint one specific DAG
dag-lint src/plans/phase.dag.md
```

## Exit codes

| Code | Meaning |
|---|---|
| `0` | All DAGs pass (warnings OK) |
| `1` | At least one error |
| `2` | Lint tool itself errored |

## Anti-patterns

- **Linting an FSM as a DAG.** FSMs have cycles by design; DAG lint will fail every FSM. Use FASTRIC/FSM lint for those.
- **Silent dead nodes.** Unreachable nodes are a *planning* signal; don't silence the warning, fix the plan.
- **Multi-source by accident.** Two source nodes usually mean someone forgot to connect P0 to P1, or there's a hidden parallel kickoff. Warning prompts review.

## Implementation hints (non-binding)

v0-PiFPEV: `src/plans/dag-lint.ts` implements all rules above (303 LoC, with a fourth copy of the hand-rolled YAML parser — flagged for v1 unification, see G4).

A non-TypeScript implementation could use a graph library (NetworkX in Python, igraph, etc.) and apply standard algorithms. The rules above are independent of language.

## See also

- `~/.fpev/stages/2-plan.md` — Plan stage produces the DAG
- `~/.fpev/fastric-lint.md` — FSM/FASTRIC linting (different concern)
