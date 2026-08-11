# GitHub bridge

How to map FPEV cycle state to GitHub primitives (PRs, issues, branches) so a team can collaborate via the GitHub UI while the cycle's source-of-truth state lives in PiFPEV. This is the canonical mapping spec — any implementation (v0's Node bridge, a Python rewrite, a GitHub Action) conforms to this.

## When to use this workflow

You're building or interfacing with a GitHub bridge for an FPEV project. Or you want to understand what gets posted where when a cycle advances.

If you're not using GitHub for collaboration, skip this workflow — FPEV doesn't require it.

## The mapping (one screen)

| FPEV concept | GitHub primitive |
|---|---|
| **Stage transition** (e.g., Frame → Plan) | **Pull Request** opened, reviewed, merged |
| **Stage handoff doc** | The PR's primary changed file |
| **Decision surface** | An HTML file in the PR's `references/surfaces/` change |
| **Gap** | **Issue** with lifecycle labels |
| **Cycle** | **Branch** (e.g., `cycle-001`, `v1-frame-001`) |
| **Fork / split / merge** (E14) | GitHub branches with fork/merge relationships |
| **Review request** | PR reviewer assignment |
| **Approval** | PR merge |

## The constraint — no destructive commands (C7)

The bridge uses `gh` CLI exclusively, and **NEVER** runs:

```
git push --force
git push --force-with-lease
git reset --hard
git clean -fd
git checkout --
```

Any bridge implementation MUST enforce this list. v0's implementation maintains `BLOCKED_COMMANDS` and checks before invoking shell. Test the safety check explicitly.

## Library API (canonical)

```
openHandoffPR(stage, handoffPath, decisionSurfacePath?, opts?) → BridgeResult
mapGapToIssue(gapId, status, evidence?, opts?) → BridgeResult
mapMergeToStateTransition(prNumber, opts?) → BridgeResult
listHandoffPRs(opts?) → BridgeResult[]
syncAllGaps(state, opts?) → BridgeResult
bridgeStatus(opts?) → BridgeStatus
```

| Function | What it does |
|---|---|
| `openHandoffPR` | Opens a PR for a stage transition; PR body summarizes decisions; reviewers assigned per the cycle's review-policy |
| `mapGapToIssue` | Creates or updates a GitHub issue tracking a gap, with the right labels |
| `mapMergeToStateTransition` | When a PR merges, advance the FSM to the next state and write to state.json |
| `listHandoffPRs` | Lists currently-open handoff PRs for the cycle |
| `syncAllGaps` | Bulk sync — given state.gaps, ensure every gap has a matching issue |
| `bridgeStatus` | Checks `gh auth status`, current repo, default branch; returns readiness |

## Gap ↔ Issue label mapping

| Gap status | Issue state | Labels (additive to base "gap") |
|---|---|---|
| `open` | `open` | `gap-open` |
| `resolving` | `open` | `gap-resolving` |
| `closed` | `closed` | `gap-closed` |
| `reopened` | `open` | `gap-reopened` |

Issue body template:

```markdown
**Gap ID:** {gapId}
**Status:** {status}
**Closure criterion:** {from gap entry}
**Assigned:** {who owns closing}
**Evidence:** {if status=closed, the evidence record}

---
Synced from FPEV cycle {cycleId} on {timestamp}.
```

The bridge updates this body on each sync; humans editing the body lose changes on next sync (this is intentional — issues are *projections* of state, not authority).

## PR body template for handoffs

```markdown
## {Stage} handoff — {project} {cycleId}

**Author:** {author-id}
**Stage:** {stage}
**Phase:** {phase}
**Reads:** {comma-separated handoff references}

### Decisions

- D1: {decision title} — {choice}
- D2: ...

### Gaps touched

- G7: opened
- G3: closed (evidence: ...)

### Conformance

- cadence: T✅ R✅ I✅ C✅
- gap: T✅ R✅ I✅ C✅
- artifact: T✅ R❌ I✅ C✅

---

📄 [Decision surface (cards)](references/surfaces/...html)
🤖 Generated from FPEV cycle. Source: `handoffs/stage-N-...-{author}.md`
```

The bridge extracts decisions, gaps, and conformance from the handoff's frontmatter + body and renders the PR description.

## Merge → state-transition flow

When a PR merges on GitHub, the bridge advances the cycle's state. Two patterns:

### Manual invocation (v0 default)

```bash
node src/bridges/github/github-bridge.ts --action on-merge --pr 42
```

The user runs this after merging. The bridge calls `mapMergeToStateTransition(42)` which:
1. Reads the PR's metadata (title, body, files changed)
2. Identifies the stage from the PR title/files
3. POSTs `/action {type: "approve"}` to the daemon
4. Updates state.json#history with a `github.pr.merged` event

### Webhook (v1+ feature, G14)

GitHub posts to `POST /webhook/github` when a PR merges. The daemon receives, validates the signature, and runs the same logic.

Manual is simpler; webhook is automatic. Both conform to this contract.

## CLI surface

For one-off invocations:

```bash
# Open a handoff PR
github-bridge --action open-pr --stage 2 --handoff handoffs/stage-2-plan-OpusCC47.md

# Sync one gap to its issue
github-bridge --action sync-gap --gap-id G7 --status resolving

# Bulk sync all gaps from current state
github-bridge --action sync-all-gaps

# Inspect bridge readiness
github-bridge --action status
```

## Configuration

```yaml
repo:        owner/repo            # required for write actions
branch:      main                  # default branch
daemonUrl:   http://localhost:7327 # for state transitions on merge
autoLabel:   true                  # auto-apply gap-* labels
dryRun:      false                 # if true, print commands without executing
```

Configuration lives in a small config file, environment variables, or CLI flags — bridge implementations decide.

## Authentication

The bridge relies on `gh auth status` being OK. It does NOT manage credentials itself. If unauthenticated, `bridgeStatus()` returns `{status: "needs-auth"}` and write actions fail with a clear message.

For team deployments using a GitHub App token, the bridge invokes `gh` with the appropriate `GH_TOKEN` environment variable. Token storage is out of scope.

## Anti-patterns

- **Bridge running with user-token in CI.** Use a bot token / GitHub App for CI; user-token PRs look like the user did it
- **Forgetting BLOCKED_COMMANDS check.** Every shell-out path runs through the safety check
- **Issue body drift.** Humans edit issue bodies; next sync overwrites; document this clearly so humans put commentary in PR comments instead
- **PRs that bundle multiple stages.** One PR per stage transition; otherwise the bridge can't map merge → single transition
- **Closing issues out-of-band.** If a gap closes via direct issue close (not through the bridge), state.json doesn't update and lint flags drift

## Implementation hints (non-binding)

v0-PiFPEV: `src/bridges/github/github-bridge.ts` (842 LoC + 391 LoC of tests). Library + CLI. End-to-end PR-merge flow is manual; webhook receiver is v1+ (G14).

A non-Node implementation could be:
- A `gh` extension (`gh-fpev`)
- A Python `subprocess` wrapper
- A GitHub Action that runs on PR-open / PR-merge events

All conform if they satisfy the mapping table and the BLOCKED_COMMANDS rule.

## See also

- `~/.fpev/state-service-spec.md` — `POST /action` from merge events
- `~/.fpev/state-file-persistence.md` — history event types (`github.pr.opened`, etc.)
- `~/.fpev/cockpit-design.md` — GitHub channel panel display
- `~/.fpev/stages/3-execute.md` — PR cadence per stage
