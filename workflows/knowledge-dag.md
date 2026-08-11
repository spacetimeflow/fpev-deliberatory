# Knowledge DAG

How to build and maintain a directed graph of concept-references across an FPEV project — linking wiki topics, references, handoffs, gaps, and decisions into a navigable web. This is the *meta-workflow* that ties the other knowledge artifacts together.

## When to use this workflow

You're building a tool that:
- Visualizes how concepts in a project relate (which wiki topic cites which, which handoff reads which references, which gap closes which question)
- Detects orphans (topics or references with no incoming or outgoing links)
- Surfaces the project's intellectual structure for newcomers
- Powers a "see also" generator for any artifact

Or you're trying to understand your own project's knowledge structure when it's grown beyond what fits in your head.

## What a knowledge DAG node is

Any artifact that carries identity:

| Node type | Source | Identity |
|---|---|---|
| **Wiki topic** | `wiki/topics/{slug}-{author}.md` | `wiki:{slug}` |
| **Reference** | `references/{name}.md` or `references/{name}.html` | `ref:{name}` |
| **Walkthrough** | `references/walkthroughs/{name}.md` | `walkthrough:{name}` |
| **Handoff** | `handoffs/stage-{N}-{artifact}-{author}.md` | `handoff:stage-{N}-{artifact}` |
| **Decision** | A `### DN — Title` section in a plan handoff | `decision:{cycleId}:D{N}` |
| **Gap** | A `### GN — Title` section in a gaps handoff | `gap:{cycleId}:G{N}` |
| **External** | A URL in a `sources:` frontmatter field or a markdown link | `external:{url}` |

Nodes have metadata: `title`, `authors`, `status`, `tags`, `created-at`.

## What an edge is

A directional citation from one node to another. Edge types:

| Edge type | Meaning | Source field |
|---|---|---|
| `reads` | A handoff's `reads:` frontmatter declares the inputs it depended on | `reads:` |
| `related` | A wiki topic's `related:` field lists conceptually-adjacent topics | `related:` |
| `sources` | A wiki topic's `sources:` field cites the external readings + handoffs that informed it | `sources:` |
| `siblings` | Frame triptych or other multi-doc artifacts cross-reference each other | `siblings:` |
| `closure` | A gap closes because evidence is provided by another artifact | `Closer:` in gap entry |
| `cites` | Inline markdown link like `[[topic-name]]` or `wiki/topics/...md` | parsed from body |
| `governs` | A FASTRIC `*.fastric.md` governs the lifecycle of a state class | `spec_type: fastric` + lifecycle reference |

A node can have multiple outgoing and incoming edges. The graph is directed but not constrained to be acyclic — wiki topics often cite each other bidirectionally.

## What this graph IS NOT

- **Not a strict ontology.** No global concept hierarchy; just citations as they appear in real artifacts.
- **Not authoritative for content.** The artifact's content is canonical; the graph is metadata derived from frontmatter + parsed links.
- **Not a replacement for `wiki-html-delivery.md`.** The wiki HTML generator renders content. The knowledge DAG provides the *links between* content.
- **Not always acyclic.** Despite "DAG" in the name (kept for consistency with `phase.dag.md` terminology), bidirectional citations are common and OK. Treat as a general directed graph; cycle detection is informational.

## Builder algorithm

```
For each candidate file under {wiki/topics, references, handoffs}/:
  parse frontmatter
  identify node id (per the table above)
  create node with metadata
  for each edge type:
    extract edge targets from frontmatter (reads, related, sources, siblings)
    extract inline citations from body (markdown links)
    create edges
For each handoff body:
  extract decision sections (### DN — Title) → decision nodes
  extract gap sections (### GN — Title) → gap nodes
For each closed gap:
  parse Closer reference → closure edge

After building:
  detect orphans (in-degree 0 AND out-degree 0)
  detect dangling links (edge target node doesn't exist)
  compute strongly connected components (concept clusters)
  compute betweenness centrality (which nodes bridge the most subgraphs)
```

Output: a JSON object with `nodes[]` and `edges[]`, plus computed properties.

## Output formats

The builder produces multiple consumable formats:

| Format | Use case |
|---|---|
| **JSON** (`knowledge-dag.json`) | Programmatic consumers (cockpit, lint, search) |
| **Mermaid** (`knowledge-dag.mmd`) | Visual rendering in markdown |
| **HTML interactive graph** (`knowledge-dag.html`) | Browseable in cockpit (force-directed layout via vis-network or d3) |
| **Linter report** | Orphans, dangling links, dead-ends |

JSON shape:

```yaml
nodes:
  - id: wiki:fastric-fsm
    type: wiki
    title: FASTRIC — Finite Automata...
    status: mature
    metadata: {authors, family, related, created-at}
  - id: handoff:stage-1-frame-problem
    type: handoff
    title: Problem statement (Stage 1)
    ...
edges:
  - from: handoff:stage-1-frame-problem
    to: wiki:fastric-fsm
    type: reads
    metadata: {via: "frontmatter.reads"}
analysis:
  orphans: [wiki:obscure-topic]
  dangling: [wiki:future-topic]  # referenced but doesn't exist yet
  clusters: [["wiki:fastric-fsm", "wiki:flexible-stochastic-fsm", ...]]
```

## CLI invocation

```bash
# Build the graph for a project
knowledge-dag build --project . --output references/knowledge-dag.json

# Render as Mermaid for embedding in markdown
knowledge-dag render --input references/knowledge-dag.json --format mermaid > diagram.mmd

# Lint: find orphans, dangling, dead-ends
knowledge-dag lint --input references/knowledge-dag.json

# Update only — incremental, only re-parse changed files
knowledge-dag build --update --since 2026-05-15
```

## Cockpit integration

The cockpit can:
- Display the graph (interactive HTML)
- Show "see also" for any artifact (incoming/outgoing edges)
- Highlight orphans in the wiki/references panels
- Surface dangling links as a v1.x finding

State integration: write the graph to `state.knowledgeDag` (or a sibling file `references/knowledge-dag.json`) and the cockpit's Knowledge panel polls/links to it.

## Update cadence

| Trigger | What |
|---|---|
| Stage transition | Regenerate (new handoff means new edges) |
| Wiki topic added or edited | Regenerate the affected subgraph |
| Cycle complete | Full rebuild (capture closures) |
| CI on every commit | Lint only (orphans + dangling) |

Avoid: building on every keystroke. The graph is structure, not content; rebuild on artifact boundaries.

## Lint rules

| Rule | Severity | Check |
|---|---|---|
| `no-orphans` | warning | Every node has at least one incoming or outgoing edge (orphans are usually dead topics) |
| `no-dangling` | warning | Every edge target points to a real node |
| `no-self-loop` | informational | A node citing itself (sometimes intentional, usually a copy-paste error) |
| `family-coherent` | warning | Topics in the same family link to each other more than to outside families (if not, the family grouping may be wrong) |
| `recent-without-citation` | warning | A wiki topic exists for >2 cycles with no incoming edges (no handoff cites it) — may indicate rot |

These prompt cleanup, not enforcement. The graph is a navigational aid; lint warnings invite curation.

## What this enables

Once the graph exists, you can answer:

- "Where is FASTRIC defined and where is it cited?" — visit `wiki:fastric-fsm`, see incoming edges
- "If I delete this wiki topic, what breaks?" — outgoing edges show dependencies; incoming show citers
- "What concepts cluster together in this project?" — look at strongly connected components
- "Where should this new wiki topic live (which family)?" — closest existing cluster
- "Which references nobody reads?" — orphans + low-betweenness nodes

The graph **doesn't make decisions** — it informs them. Humans curate based on the analysis.

## Anti-patterns

- **Citation as obligation.** Adding `related:` entries just to inflate the graph; only cite when the relationship is real
- **Graph as content.** The graph is metadata; people read the artifacts, not the graph
- **One-shot generation.** Build once, never update; the graph rots fast as new handoffs accumulate
- **Sprawling families.** Trying to give every topic a family; standalone is a valid state for genuinely novel concepts

## Implementation hints (non-binding)

Not yet implemented in v0-PiFPEV. v1+ deliverable; estimated ~250 LoC:

- 100 LoC: frontmatter + body parsing
- 50 LoC: graph construction
- 50 LoC: analysis (orphans, clusters, centrality)
- 50 LoC: output renderers (JSON, mermaid, HTML)

Libraries to consider:
- `graphlib`, `networkx` (Python), `igraph` for graph algorithms
- `vis-network`, `cytoscape.js`, `d3-force` for interactive HTML
- `mermaid` for static rendering

A first-pass implementation could be a single Python script with `markdown_it`, `networkx`, and a Jinja template — ~150 LoC, fully functional.

## See also

- `~/.fpev/wiki-authoring.md` — `related:` and `sources:` fields the builder reads
- `~/.fpev/handoff-conventions.md` — `reads:` and `siblings:` fields
- `~/.fpev/wiki-html-delivery.md` — uses link resolution similar to this builder
- `~/.fpev/cockpit-design.md` — Knowledge panel display
- `~/.fpev/gap-lifecycle.md` — gap closure edges
