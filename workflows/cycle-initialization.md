# Cycle initialization

How to bootstrap a brand-new FPEV project, from empty directory to ready-for-Stage-1-Frame in under 10 minutes. This file is for the common case: solo / small-team, no PiFPEV daemon, agent-driven via the ritual.

## When to start a new FPEV cycle

| Situation | Approach |
|---|---|
| Brand-new problem, no prior project | New project + cycle 1 |
| Iterating on an existing project (v0 done, planning v1) | New version directory (`v1-yourproject/`) inside the same repo; share `wiki/` across versions |
| Branching for a hypothesis you'll merge or discard | Git branch on the existing project; no new directory |
| Spinning off a sub-problem | Either new project or a new wiki topic, depending on scope |

This file covers the first two. Branches and sub-problems don't need full initialization.

## Bootstrap — brand-new project

```bash
PROJECT=my-project

# 1. Create the skeleton
mkdir -p $PROJECT/{handoffs,wiki/topics,references/walkthroughs}

cd $PROJECT

# 2. README at the root — short explainer
cat > README.md <<'EOF'
# my-project

An FPEV-cadenced project. See the fpev-deliberatory conventions for the protocol overview and `handoffs/` for stage outputs.

## Layout

- `handoffs/`             — stage outputs (markdown)
- `wiki/topics/`          — cross-cycle conceptual entries
- `references/`           — reviews, walkthroughs, external readings
- `references/surfaces/`  — decision surfaces (HTML), made on request

## Status

Stage 1 — Frame (just started).
EOF

# 3. Git init (recommended — versioning is part of the protocol's audit trail)
git init -q
git add .
git commit -m "init: FPEV cycle-001 skeleton" -q

echo "Project $PROJECT initialized. Open the directory in your agent and invoke the ritual:"
echo "  Follow fpev-deliberatory. We're working on $PROJECT. We are now in version 0 stage 1 phase F0."
echo "  Let's start the Frame triptych."
```

What this produces:

- An empty but well-structured project directory
- README that orients newcomers
- A git history starting at cycle-001 init

## Bootstrap — new version of existing project

```bash
PROJECT=my-project
SRC_VERSION=v0
DST_VERSION=v1

cd $PROJECT

# 1. Create new version directory
mkdir -p $DST_VERSION-yourproject/handoffs

# 2. Seed v1's handoffs/ with v0's correction docs (if any)
cp $SRC_VERSION-yourproject/handoffs/v${SRC_VERSION#v}-*-correction.md $DST_VERSION-yourproject/handoffs/ 2>/dev/null

# 3. Add a README for the new version
cat > $DST_VERSION-yourproject/README.md <<EOF
# $DST_VERSION-yourproject

v${DST_VERSION#v} of the FPEV project. Seeded from v${SRC_VERSION#v} correction docs.

See \`handoffs/\` for stage outputs. The project's wiki and references are one level up; this version's own are here.
EOF

# 4. Top-level README explains layout
cat > README.md <<EOF
# $PROJECT

Two versions coexist:

- \`$SRC_VERSION-yourproject/\` — shipped $SRC_VERSION
- \`$DST_VERSION-yourproject/\` — fresh $DST_VERSION
- \`wiki/\`, \`references/\` — the project's, shared by its sub-projects
- \`.claude/\` — shared agent settings (if used)
EOF

git add .
git commit -m "init: $DST_VERSION-yourproject; seeded from $SRC_VERSION correction docs" -q

echo "$DST_VERSION-yourproject ready. Invoke the ritual:"
echo "  Follow fpev-deliberatory. We're working on $PROJECT. We are now in version ${DST_VERSION#v} stage 1 phase F0."
echo "  Let's start the v${DST_VERSION#v} Frame triptych using the seeded correction docs."
```

## The ritual after bootstrap

Once the directory exists, every session starts with the ritual:

> Follow `fpev-deliberatory`. We're working on project `<name>` in `<project-dir>`. We are now in version `<v>` stage `<n>` phase `<m>`. Let's `<continue / start Stage 1 Frame / start Stage 2 Plan / etc.>`.

The agent reads this set's `README.md`, identifies the current stage from `handoffs/`, and proceeds.

## What NOT to bootstrap

Don't pre-create:

- **Empty handoff stubs.** Let stages produce their own handoffs. Empty files invite scope-creep edits.
- **A full wiki/topics/ catalog.** Topics emerge from need; pre-seeding produces dead topics.
- **`src/` if there's no code yet.** Frame may decide there's no code at all (documentation-only project). Wait until Stage 2 Plan declares code deliverables.
- **A Phase DAG.** Plan decides the DAG. Frame doesn't.

## First-cycle Stage 1 Frame — what to expect

The Frame stage produces three sibling handoffs (the triptych). See `workflows/stages/1-frame.md` for the full guide. Briefly:

| File | What |
|---|---|
| `handoffs/stage-1-frame-problem-{author}.md` | Problem statement + principles + constraints + anti-scope |
| `handoffs/stage-1-frame-architecture-{author}.md` | What we're building, file-layout sketch, dependencies |
| `handoffs/stage-1-frame-gaps-{author}.md` | Knowledge unknowns, closure criteria, dependency DAG |

Generate decision surfaces in `references/surfaces/` only when the human asks.

Stage 1 is **slow**. Expect 1–3 days of part-time work for a first cycle; longer for ambitious problems. Resist the urge to skip to Plan; cheap Frame fixes expensive Execute.

## Common bootstrap mistakes

- **Skipping the README.** Future-you (or future agents) won't know what `your-project/` is.
- **Skipping `git init`.** Version-control is the cycle's audit trail; running without it loses propagate-back evidence.
- **Bootstrapping inside another project's directory.** Use a fresh directory. Cross-project pollution is hard to untangle later.
- **Pre-writing the problem statement before invoking the ritual.** The agent + you produce it together during Frame. Pre-writing biases the framing.

## After bootstrap, before invoking the ritual

Spend ~5 minutes thinking about:

- Who is this for? (Audience drives Frame's problem statement.)
- What's the smallest deliverable that proves the cycle worked?
- What would you regret not having decided clearly at the start?

These don't need writing down yet — they go into Frame. But thinking them helps the ritual not start cold.

## See also

- `workflows/project-folder-structure.md` — full skeleton reference
- `workflows/handoff-conventions.md` — naming + frontmatter
- `workflows/stages/1-frame.md` — Frame stage detail
