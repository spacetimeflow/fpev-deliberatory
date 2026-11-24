---
created-at: 2026-11-23
created-by: OpusCC5
type: domain-schema
domain: local-model-installation
complements: workflows/ (the FPEV cadence) — does not replace any stage
derived-from: local-AI v1–v3 on two Macs (64 GB M2 Max and 24 GB M5; about 84 handoffs, Apr–Nov 2026)
status: draft v0.1 (2026-11-23) — written from the record; revise after the next model change that follows it, and again after a non-Apple machine
---

# Domain schema — installing and running local AI models

For projects that choose, install, measure and keep a set of **local models** on a specific machine,
then keep that set current as models, quantizations and engines change. The human is the **operator**:
they use the models and own every judgment of taste, disk and risk. Agents research, download, measure,
bind and record.

Numbers below are from the reference machines. Carry the **method** to a new machine, never the speeds.

## 1. When this applies

All four should hold. If only one or two do, take §5's decisions and §6's tripwires.

1. **The result depends on this machine:** its memory, bandwidth, GPU limits, disk and OS.
2. **Candidates change faster than the setup:** new quants, engines and fine-tunes keep arriving.
3. **Published claims do not transfer:** vendor speed and quality need checking here.
4. **Fit for use has a human part:** a model can pass every benchmark and still feel worse.

Sibling kinds that borrow most of this: self-hosted speech, image or embedding models; a shared
inference server; choosing a cloud GPU configuration.

**Two ways to enter this schema:**

| Trigger | Use | Size |
|---|---|---|
| New machine, or a question that may change the whole setup | **Full cycle** (§3) | Frame → Plan → Execute → Verify |
| "Try this model", "swap these tiers", "this one feels worse" | **Model-change loop** (§4) | one Verify phase the operator opens |

Most of the work is the second kind. Do not open a new cycle for one model swap. Open a new cycle when
the loop has changed what the Frame assumed.

## 2. The program layer

```
<local-ai>/
├── references/local-ai-history-<machine>-<author>.md   ← SHARED: every model, engine and speed tried
├── wiki/topics/                  ← SHARED doctrine across machines and cycles
├── models/<family>/              ← weights, outside any version folder
├── v{N}-local-AI-<machine>/      ← one FPEV cycle per machine
│   ├── handoffs/  README.md
│   ├── references/ (prompts-*, bench-results/)
│   └── src/ (bench/, shell/)     ← launchers and measurement drivers
```

**Rule: one history file per machine, read before any proposal and updated after every phase.** It
answers "was this tried?", "what speed should I expect at this context?" and "which trap did we hit?".
Newest first, with every number citing its source file. It is the compounding asset of the program.

Rows name the **model and quant**, not only the tier. Tier names get reassigned, and an old row saying
`mid` then means a different model.

## 3. Phase template for a full cycle (Stage 3)

| Phase | Name | What it does | Why here |
|---|---|---|---|
| **P0** | Machine ceiling | Record chip, memory, usable GPU memory, measured read bandwidth, free disk, OS | Every later number is checked against this |
| **P1** | Current state | Inventory running tiers, launchers, client config, files on disk, and what is actually loaded in a fresh shell | Plans built on the intended setup fail on the real one |
| **P2** | Instrument | Speed driver, contention sampler, quality suite, operator prompt set (§7) | A measurement written after a result tends to favour it |
| **P3** | Baseline | Measure the incumbents with the instrument | Candidates need something to beat |
| **P4** | Cheap levers | Flags, draft or speculation settings, reasoning effort, on the existing files | These cost no disk |
| **P5** | Candidates | One candidate family at a time through the model-change loop (§4) | Keeps the disk bounded and causes separate |
| **P6** | Engine question | Compare engines on the same weights. Build nothing unless the ceiling says a build can pay | A perfect kernel cannot beat a bandwidth bound |
| **P7** | Long-context soak | Grow to the context the operator really uses, with a long reply at the end | Short results do not transfer |
| **P8** | Bind | Launchers, switchers, client config, revert path | |
| **P9** | Close | Live check of every tier from a fresh shell; disk cleanup; history and wiki updated | Execute's closing phase; Verify is the operator's |

## 4. The model-change loop (the standard procedure)

Run these in order inside one Verify phase. **Stop at each `GATE`** for the operator's word unless they
have already given it for this step. Approval for one model or step does not extend to the next.

### A. Understand the request

1. **Record the operator's words**, unchanged and numbered, in `references/prompts-*`.
2. **Read the history file.** If the candidate or a close relative was tried, start from that result.
3. **Name the question** in one line: speed, fit, quality, or the operator's felt difference.
4. **If the trigger is "this feels worse", list what changed** between the two setups: weights, quant
   recipe, format, engine, sampler, reasoning effort, chat template. Compare the templates and generation
   config directly. Do not blame one factor while several moved together.

### B. Choose and identify the candidate

5. **Search, and grade each source:** measured here, measured elsewhere, vendor-reported, or opinion.
   Check what hardware a vendor's speed came from.
6. **Identify the exact artifact:** repository, filename, **revision**, size and hash. A filename is not an
   identity; publishers re-upload different quants under the same name.
7. **Do the fit arithmetic:** weights + KV at the intended context + vision projector + draft model,
   against usable GPU memory (not total RAM) and free disk after download.
8. **Estimate speed** from the nearest measured relatives, and label it an estimate.
9. **`GATE`:** propose one candidate with its size, expected speed, what it would replace, and the pass
   criteria. The operator decides whether to download.

### C. Install and measure, without touching the live setup

10. **Download into its own folder**, pinned to the revision. **Verify size and SHA-256.**
11. **Serve on a spare port**, one model resident at a time, with the flags it will ship with.
12. **Measure speed** (recipe V2), and **quality** (recipe V3) unless the operator waives either.
13. **Report against the pass criteria**, including what was not measured and which comparisons cross
    sessions.
14. **`GATE`:** the operator decides adopt, reject, or test further. If they prefer a model the numbers
    rank lower, record that as their decision. Their use is evidence that the suite cannot produce.

### D. Bind and verify

15. **Back up** the launcher and client config with a dated suffix, and state the revert command.
16. **Bind** the launcher, status text, switcher and client entry, including **the client's default model
    ID** if it changes. When tiers swap, check which flags travel with the model and which stay with the
    tier (caches, effort, vision, context).
17. **Verify live from a fresh shell** (recipe V4), through the real launcher and the real client.
18. **Leave the machine as you found it:** stop what you started, unless the operator wants it running.

### E. Record and clean up

19. **Write the phase handoff:** the operator's point, method, results, verdict, what remains unmeasured,
    and how to revert.
20. **Update the history file:** lineup, speed rows, new traps, open threads.
21. **`GATE` before deleting** any weights, unless the operator already said to. Record the re-download
    command with its revision and hash first. Hard-link identical shards rather than storing them twice.

## 5. Standard decisions (with defaults)

| ID | Decision | Default | If wrong |
|---|---|---|---|
| **Tiers** | How many, named how | Named by **role** (`slow`, `mid`, `fast`), one default in the client | Rename in launcher and client |
| **Residency** | Models loaded at once | **One.** Switchers stop every tier first | Raise only after a measured soak |
| **Pinning** | Which revision | An exact commit, recorded with its hash. Never float on `main` | Re-download the recorded revision |
| **Upstream update** | A new upload of the same name | Treat it as a **new candidate**, measured against the pinned file | Keep the pin |
| **Primary metric** | What "faster" means | Prefill and TTFT at the operator's context, then decode. Agent sessions spend most time in prefill past about 30K | Re-weight for chat-only use |
| **Comparable speed** | Pass criteria | Set before the run, with the operator. A starting point when quality motivates the change: decode ≥ 0.75×, prefill ≥ 0.9× the incumbent | Operator adjusts |
| **Reasoning effort** | Which level | **Set explicitly and measure at the level you ship.** Engine defaults differ and higher can score lower | Re-run quality at the new level |
| **Quant choice** | Bits vs recipe | Compare recipes as well as bits: uniform, calibrated (imatrix) and mixed-precision quants of the same size can behave differently | Test the next rung |
| **Engine** | Which runtime | The one that wins on the same weights at long context; keep the previous one as a fallback when it costs little | Launcher fallback |
| **Custom engine** | Build one? | **No**, unless the roofline shows at least a 2× prize that existing tools cannot reach | New Frame |
| **Disk** | What to keep | Current tiers and working fallbacks. Delete rejected probes after the verdict, on the operator's word | Re-download from the record |
| **OS limits** | Sysctl and wired memory | Leave unchanged; if needed, make it a measured, reversible step the operator approves | Restore the value |
| **Privacy** | What reaches outside | Prompts and files stay local. Web research and downloads carry no personal or project details | — |

## 6. Tripwires and the rules that cost a phase to learn

**Tripwires** (stop and report; each one means the result cannot be trusted yet):

- A number **exceeds the roofline**: `tok/s × GB read per token > bandwidth × accepted tokens per pass`.
  Treat it as a bug. (A cache replay once produced a false 3.55×.)
- Hash or size **differs** from the recorded artifact.
- A **GPU watchdog or out-of-memory** error. First confirm that the fix's environment variable reached the
  process (`ps eww <pid>`). "The fix failed" was once "the fix never applied".
- Two passes of the same test differ by **more than about 5 %**, or contention is high during the run.
- The quality score **drops on a deterministic repeat** (temperature 0, same seed).
- A candidate would leave **less free disk** than the operator's floor.

**Rules:**

1. **Short-prompt wins do not transfer.** Three candidates won short and lost at 28K.
2. **Vendor speed is someone else's memory bandwidth.** A vendor's 93.8 tok/s came from a machine with
   about 3× the bandwidth. Fewer bits are not always faster: exotic low-bit kernels can be compute-bound.
3. **A test prompt can flatter speculation.** Repetitive text and code raise draft acceptance. A repetitive
   14K prompt once read 67.8 tok/s where a real corpus read 41.
4. **Absolute speeds move ±25 % across sessions; ratios within one pass move about 2 %.** Say which you have.
5. **One memory reading proves nothing.** A 4.8 GiB "saving" did not replicate. RSS is not GPU memory.
6. **Open shells keep old functions.** After editing a launcher, test from a fresh shell and tell the operator.
   A guarded `[ -f … ] && source` hid a misspelled path for weeks.
7. **Installers overwrite wrappers.** An upgrade removed a required environment variable. Install to a scratch
   bin directory, or re-check the wrapper afterwards.
8. **"Listed" is not "ready".** A server can list a model and still fail its first request. Smoke-test with one
   real completion.
9. **Budget for thinking.** A reasoning model can spend a small token budget before answering, so low quality
   scores may only mean truncation. Check the finish reason.
10. **A clean benchmark does not close a felt regression.** A model scored 12/12 while the operator found it
    weaker on instruction following and creativity. The suite did not test either.

## 7. Stage 4 and the verification recipes

Mechanical recipes run in Execute or inside a phase the operator opened. **The verdict is the operator's.**

| # | Phase | Establishes | Owner |
|---|---|---|---|
| V1 | Identity | The file on disk is the intended artifact | script |
| V2 | Speed | Candidate against incumbent on this machine | agent |
| V3 | Quality floor and prompt set | No regression, and material for judgment | agent, then **operator** |
| V4 | Live integration | The real launcher and client work | agent |
| V5 | **Use — the gate** | The operator works with it and judges it | **operator** |
| V6 | Record | Handoff, history, revert path | agent |

**V1 — identity.** Compare byte size and SHA-256 with the repository's LFS record for the pinned revision.

**V2 — speed.**
1. One server at a time on a spare port, with a **contention sampler** running.
2. Mirrored order (**A-B-B-A**), restarting between passes. If the operator waives the control, run two passes
   of the candidate and label every ratio **cross-session**.
3. Each pass: three short prompts (chat, code, novel), then agent-style growth on a cached prefix
   (about 13K cold, +4.5K, +7K), then **one reply of at least 2K tokens** at that context.
4. Use a realistic corpus and report **real token counts**.
5. Report prefill, decode and TTFT per context, and check each against the roofline.

**V3 — quality.**
1. A deterministic floor suite (code, format, context retrieval) at the shipping effort with a budget large
   enough to finish thinking.
2. When the concern is taste, add an **operator prompt set**: instruction-constraint and creative prompts, same
   seed, shown blind where practical. The operator judges these. Do not score them for the operator.

**V4 — live integration.** From a fresh shell: start via the real command; confirm the model ID, the required
environment variables and flags; test vision if advertised; send one real request **through the client's default
path** and confirm that the intended server received it; scan the log for errors; stop the server.

**V5 — the gate.** V1–V4 show the install is correct. Only use shows that it is better for this operator.

## 8. Standard wiki topics (day one, at the program level)

| Topic | Holds |
|---|---|
| `machine-profile-<machine>` | measured ceilings and usable memory |
| `roofline-and-amortization` | the two equations that decide whether a technique can pay |
| `tier-definitions` | what each role is for, and how the operator chooses |
| `technique-catalog` | speculation, quant recipes, caches: what each needs and where it worked |
| `primer-local-llm-speed` | prefill, decode, TTFT and context, for a new reader |

## 9. Metrics to record

- Per configuration and context: prefill, decode, TTFT, tokens per draft cycle, real token counts.
- Artifact: repository, revision, hash, size; engine version; flags; reasoning effort.
- Quality: score, failed items, budget, repeatability.
- Operator's verdict in their words, and what they compared.
- Run conditions: contention, passes, whether comparisons are same-pass or cross-session.
- Disk before and after, and the re-download command for anything deleted.

Reference numbers (64 GB M2 Max, 345.6 GB/s measured read, Qwen3.8-27B at 13–25K context, Nov 2026): MLX 4-bit
on Splash 42–47 tok/s decode, 195–225 prefill; UD-IQ3_XXS on the same engine 34–41 decode, 201–234 prefill.

## 10. Reference implementation

the owner's `local-AI` project (not public). Start with `references/local-ai-history-OpusCC5.md`. Then read:

- `v3-machine-a/handoffs/stage-4-phase-17-engines-flashnext-iq3xxs-OpusCC5.md`: a full engine comparison.
- `v3-machine-a/handoffs/stage-4-phase-18-bonsai2-fast-candidate-OpusCC5.md`: a clean rejection.
- `v3-machine-a/handoffs/stage-4-phase-19-mlx-vs-gguf-fast-candidate-wenlong-OpusCC5.md`: the loop driven by
  an operator's felt regression.
- `v3-machine-b/`: a constrained machine, where a candidate was closed by arithmetic with no download.
- `v3-machine-a/src/bench/` and `src/shell/v3.zsh`: the drivers and launchers.

## 11. What the cadence does not supply (candidates for `workflows/`)

1. **A short loop for recurring operational change.** A model swap is too small for a cycle and larger than a
   question. Here it runs as a Verify phase; other domains with living deployments will need the same.
2. **A cross-cycle ledger.** The per-machine history file carries facts every cycle needs and fits neither a
   handoff nor a wiki topic.
3. **Reversible-change discipline.** Backup, revert command and live check for changes outside the version folder
   (shell config, client settings, installed binaries).
4. **Labels that survive reassignment.** When a role name moves to another artifact, older handoffs change meaning
   unless the record says when the label moved.
5. **Operator taste as evidence.** The cadence has no first-class way to record "the benchmark passes, and I still
   prefer the other one".
