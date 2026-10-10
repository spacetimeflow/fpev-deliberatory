# Divergence classes — the R-class taxonomy

When your work diverges from what the previous stage said, classify the divergence and record it. This is the protocol's honesty mechanism (`recovery, not termination`).

## The four classes

| Class | Name | When |
|---|---|---|
| **R1** | State misinterpretation | You entered the wrong state (e.g., started executing in Plan, or skipped Frame entirely) |
| **R2** | Constraint violation | Output violates a hard rule (e.g., committed without an author-id; modified production state during Execute when α should be low) |
| **R3** | Format collapse | Output drifted from convention (e.g., wrong filename; missing frontmatter fields; broken markdown) |
| **R4** | Productive divergence | The upstream spec was wrong; you found a better way that satisfies the underlying intent |

## How to classify

Ask the questions in order:

1. **Did you enter the wrong stage/phase?** → R1
2. **Did you break a stated constraint?** → R2
3. **Did the output not match the expected shape?** → R3
4. **Did you intentionally do something different from what the Plan said, because the Plan was wrong?** → R4

Most divergences are R3 (small drift) or R4 (substantive insight). R1 and R2 are bug-shaped — fix and continue.

## Recovery actions by class

| Class | Recovery |
|---|---|
| R1 | Roll back to last good state. Identify how you ended up in the wrong stage. Re-enter correct stage. |
| R2 | Fix the violation. Re-emit the artifact. Record in handoff what constraint was almost violated and how it was caught. |
| R3 | Re-emit the artifact in the correct shape. Note the drift in handoff. |
| R4 | **Do not roll back.** Record the divergence prominently. Propagate-back updates the earlier stage's docs. |

## Recording R4 (productive divergence) — the canonical format

Every R4 divergence gets an entry in the handoff where it occurred, **and** an entry in the project's `wiki/topics/recovery-vs-termination-{author}.md` topic file. The wiki entry is the durable record.

Template:

```markdown
### {YYYY-MM-DD} — {one-line summary}

**Class:** R4 — productive divergence.
**Where:** {project} Stage {N} Phase {M} (`handoffs/...`).
**What:** {one paragraph — what did the upstream spec say, what did you do instead, why}
**Why productive:** {what insight emerged; why this is better than the upstream spec, not just different}
**Recovery action:** {what you did to recover — usually: update the artifact in place, update the upstream spec, continue}
**Propagate-back:** {what changes in upstream artifacts — Stage 1 Frame, Plan, etc. — to make this divergence canonical}
```

Example (real, from v0 Stage 4):

```markdown
### 2026-05-18 — v0 build infrastructure missing (R4-as-recovery)

**Class:** R4 — productive divergence.
**Where:** v0 Stage 4 Phase 1 (`v0-PiFPEV/handoffs/stage-4-phase-1-OpusCC47.md`).
**What:** Phase-3 handoffs reported tests passing, but `v0-PiFPEV/` had no `package.json`, no `tsconfig.json`, no `node_modules`. The executor had run with `node --experimental-strip-types` directly and never authored project-level config.
**Why productive:** the divergence pinpointed a missing class of deliverable (reproducible build), not a logic error. The executor's work was correct; only the surrounding scaffolding was absent.
**Recovery action:** Verifier authored minimal `package.json` + `tsconfig.json` with the `@fastric-core/*` path alias, ran `npm install`. No source edits.
**Propagate-back:** v1 Frame absorbed this as **C12 ("Reproducible build")**.
```

## Recording R2 and R3 (constraint/format violations)

These don't usually need a wiki entry — they're noise, not signal. Just record them in the handoff:

```markdown
### Anomaly during {phase}

**Class:** R3 (format).
**Symptom:** {what was wrong}
**Fix:** {what you did to fix it}
**Lesson:** {if applicable — usually "follow the convention next time"}
```

If you find yourself recording the same R2/R3 pattern repeatedly, that's a signal the underlying convention needs sharpening. Promote it to R4 territory: maybe the convention itself is wrong.

## How divergence interacts with propagate-back

Propagate-back is the protocol's mechanism for letting late stages update early ones. **R4 is the trigger for propagate-back.** R1, R2, R3 don't propagate back; they're local recovery.

When you decide R4 propagate-back is warranted:

1. Write the recovery in the current handoff
2. Write the wiki R-class log entry
3. Update the upstream artifact (Frame doc, Plan doc) — usually adding a "correction" sibling rather than editing in place (preserves audit trail)
4. Note the propagate-back in the current handoff's `produced:` frontmatter field

## When NOT to claim R4

R4 is for **substantive insights**, not for "we just chose differently." Sniff test:

- "Plan said use library X, we used Y because Y is faster" → maybe R4 if Y's better fits a Frame principle
- "Plan said write 8 tests, we wrote 5 because we ran out of time" → not R4, that's scope reduction (record as R2 if it violates a constraint, or just note it)
- "Plan said use one daemon, we used three because the architecture demanded it" → R4 if the architecture insight is real; otherwise R1 (you misread the Plan)

R4 should make the *next* cycle better. If the divergence wouldn't change how a future cycle is planned, it's probably not R4.

## See also

- `workflows/stages/4-verify.md` — Verify-stage handling of divergence and propagate-back
- The reference project's `wiki/topics/recovery-vs-termination-*.md` for worked examples
