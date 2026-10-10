# FASTRIC authoring

FASTRIC = FSM + **R**oles + **I**nteractions + **C**onstraints. It's the prescriptive-spec format for things that *govern* future behavior (cadence, gap lifecycle, artifact lifecycle). Descriptive specs (impl traces, reverse-engineered behaviors) use plain FSM.

This file covers authoring FASTRIC specs in canonical markdown. Runtime enforcement (`transition(fsmId, event, actorId)` checks) is a runtime concern; this file is about how to *write* the spec.

## When to use FASTRIC vs FSM

| If the spec... | Use |
|---|---|
| Governs behavior — "this is how the cycle MUST proceed" | **FASTRIC** |
| Describes behavior — "this is how the executor actually behaved, sampled at phase end" | **FSM** |
| Has stochastic transitions reverse-engineered from traces | **FSM** with `determinism: stochastic` |
| Has prescriptive transitions agents are expected to follow | **FASTRIC** |

Mixing them is the v0 mistake. If your spec tells anyone what to do, it's prescriptive — use FASTRIC.

## Canonical file shape

```yaml
---
spec_type: fastric                    # or "fsm" for descriptive
fastric: {fsm-id}                     # short identifier
description: >
  One-paragraph description of what this FASTRIC governs.
canonical: md-with-mermaid
generated: src/fastric/{fsm-id}.fastric.json   # auto-generated JSON sibling
determinism: deterministic            # or "partial-order" or "stochastic"
authors: [{author-id}]                # C8 explicit

initial: {state-id}
states: [{state-1}, {state-2}, ...]

transitions:
  - id: t1
    from: {state-1}
    on: {event}
    to: {state-2}
    description: optional one-liner

roles:
  agents:
    - { id: {agent-id-1}, type: human|llm, permits: [t1, t3, t5] }
    - { id: {agent-id-2}, type: human|llm, permits: [t2, t4] }
  ownership:
    transitions:                      # PRIMARY — every transition has an owner
      t1: {agent-id-1}
      t2: {agent-id-2}
      t3: any
      t4: non-author
    states: {}                        # OPTIONAL derived view

interactions:
  handoffs:
    - { from-agent: {a1}, to-agent: {a2}, on-transition: t2, payload-schema: optional }
  self-loops:
    - { agent: {a1}, on-transition: t6 }

constraints:
  preconditions:
    - on-transition: t2
      named-hook: handoff-exists
      description: "stage-2 handoff file written before plan_approved"
  invariants:
    - at-state: closed
      named-hook: evidence-present
      description: "closed gaps must have evidence"
---

# {Fastric name} — {one-line summary}

```mermaid
stateDiagram-v2
    [*] --> {initial-state}
    {state-1} --> {state-2}: {event}
    ...
```

## State definitions

(prose explanation of each state — what it means, when it applies)

## Transition rationale

(why each transition exists; what triggers it; what the receiver does)
```

## Frontmatter, axis by axis

### T (Transitions)

The familiar FSM machinery. `from + on → to`. Every transition has a unique `id` (so roles/constraints can reference it).

### R (Roles)

Who can act on what.

- `agents:` declares all agents in the system. `type` is `human` or `llm`. `permits` lists transition IDs this agent is allowed to fire.
- `ownership.transitions:` is the **primary** ownership view — `t1: agent-X` means "transition t1 can only be fired by agent-X." Special values: `any` (anyone permitted), `non-author` (artifact lifecycle — actor must differ from artifact's `authors:`).
- `ownership.states:` is an optional derived view ("while in state X, agent Y is acting"). Don't author it directly; if needed, it's computed from outgoing-transitions ownership.

### I (Interactions)

Handoffs between agents.

- `handoffs:` declares "when transition t2 fires, agent A passes work to agent B." Optional `payload-schema:` documents what's passed.
- `self-loops:` for transitions that don't change agent (e.g., revisions within the same author).

### C (Constraints)

Preconditions and invariants enforced at runtime (when a FASTRIC runtime is present) or post-hoc (when lint runs).

- `preconditions:` checked at transition time. `named-hook` references a hook registered in the runtime. If the hook returns false (or a string with a failure message), the transition is rejected.
- `invariants:` checked when entering/leaving a state. Same hook pattern.

## Named hooks (the built-in three)

Most FASTRICs use these three; custom hooks can be added per project.

| Hook | Checks |
|---|---|
| `handoff-exists` | The expected handoff file is present in `handoffs/` on disk |
| `evidence-present` | The gap entry in state has non-empty `evidence` field |
| `non-author-acted` | The actor firing this transition is NOT the artifact's author (`actorId !== artifactAuthor`) |

A FASTRIC authored without runtime enforcement just declares which hooks should fire; a runtime that loads the FASTRIC actually invokes them.

## Mermaid block

Every FASTRIC includes a mermaid `stateDiagram-v2` block for human reading. The mermaid block must match the frontmatter — if `states:` lists 5 states, the mermaid block shows the same 5. Lint enforces parity.

## Examples (canonical from real cycles)

### Artifact lifecycle (prescriptive — needs `non-author-acted`)

```yaml
---
spec_type: fastric
fastric: artifact
initial: draft
states: [draft, reviewed, approved, final, archived, rejected]
transitions:
  - { id: t1, from: draft, on: review_requested, to: reviewed }
  - { id: t2, from: reviewed, on: approve, to: approved }
  - { id: t3, from: reviewed, on: reject, to: draft }
  - { id: t4, from: approved, on: finalize, to: final }
  - { id: t5, from: final, on: archive, to: archived }
  - { id: t6, from: reviewed, on: reject_terminal, to: rejected }

roles:
  agents:
    - { id: author-agent, type: llm, permits: [t1, t3] }
    - { id: reviewer-human, type: human, permits: [t1, t2, t3, t6] }
    - { id: orchestrator, type: llm, permits: [t4, t5] }
  ownership:
    transitions:
      t1: non-author        # reviewer must differ from author
      t2: non-author
      t3: any
      t4: orchestrator
      t5: orchestrator
      t6: non-author

constraints:
  preconditions:
    - on-transition: t1
      named-hook: handoff-exists
      description: "draft handoff must be on disk before review_requested"
---
```

### Gap lifecycle (prescriptive — needs `evidence-present`)

```yaml
---
spec_type: fastric
fastric: gap
initial: open
states: [open, resolving, closed, reopened]
transitions:
  - { id: t1, from: open, on: work_started, to: resolving }
  - { id: t2, from: resolving, on: evidence_found, to: closed }
  - { id: t3, from: closed, on: evidence_failed, to: reopened }
  - { id: t4, from: reopened, on: rework_started, to: resolving }
  - { id: t5, from: resolving, on: blocker_hit, to: open }

roles:
  agents:
    - { id: assignee, type: llm, permits: [t1, t2, t4, t5] }
    - { id: any-reviewer, type: human, permits: [t3] }

constraints:
  preconditions:
    - on-transition: t2
      named-hook: evidence-present
      description: "gap can't close without evidence in state"
---
```

## Authoring checklist

- [ ] Every transition has an id (`t1`, `t2`, …)
- [ ] Every transition's from/to states appear in `states:`
- [ ] Every transition has an owner in `roles.ownership.transitions`
- [ ] All `permits:` lists reference real transition ids
- [ ] All `named-hook:` references reference real hooks (built-in or project-registered)
- [ ] Mermaid block matches the frontmatter
- [ ] `authors:` is set (C8)
- [ ] Description prose explains the *intent*, not the mechanics

## When NOT to use FASTRIC

- Descriptive specs (impl traces) → use FSM
- One-off state machines that don't govern multi-agent behavior → FSM is sufficient
- The shape can be expressed as a simple boolean/enum → don't reach for a state machine at all

## See also

- `wiki/topics/fastric-fsm-{author}.md` — concept-level discussion in your project's wiki
- Reference FASTRICs in `v1-PiFPEV/src/fastric/` (when v1 lands)
