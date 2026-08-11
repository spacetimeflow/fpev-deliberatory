# Cadence

A deliberation protocol for working with LLMs that modulates pace, cultivates understanding, and compounds what you learn across cycles. A solo practitioner can use it with one or more LLM agents; a team can use it together in a shared repository (e.g., GitHub), adding new authors, discussions, and consolidations without changing the underlying shape. Append author-agent IDs to all generated artifacts for clear references and consolidations.

Give this document to your LLM agents as instructions — e.g. Pi Agent, OpenCode, Claude Code, OpenAI Codex. It describes the method; your agents operationalize it with you. For a new project, describe it in detail and say "Let's start with Stage 1: Framing." To resume mid-project, provide the current handoff document and say "Resume at Stage N."

## The core idea

Most people interacting with LLMs run at a single speed: reactive. LLM agents push output, you respond, they push again. No withdrawal, continuous attention. This inverts the relationship — instead of you directing, the agents set the agenda and you become a function of their output schedule.

Two common reactive patterns:

- **Continuous responsiveness:** LLM agents generate constantly, you attend constantly, you can't focus on anything else.
- **Suggestion overload:** every output comes with improvements, you're always behind trying to catch up.

Both run at execution pace during stages that require slowness. The fix is structural, not technological — same agents, different shape. The four-stage protocol **modulates pace across stages**: slow where human taste and judgment are irreplaceable, fast where LLM agents serve best, with a deliberate withdrawal phase where you step away entirely. The attention profile is a **U-shape** — framing and verification demand full human attention to open and close the problem; planning and execution let the system produce options then implement what you approved, requiring less of you.

This can apply to many contexts — research, software development, writing — anything with distinct phases demanding different human attention levels. Over repeated cycles, what you learn doesn't just solve the current problem: it accumulates in a companion wiki that makes future deliberation faster and more grounded. The protocol cultivates judgment, not just output.

## Architecture

Four stages, each with a prescribed pace — Frame, Plan, Execute, Verify (FPEV). The attention profile is a **U-shape**: both bookends demand full human attention, the middle lets you withdraw.

**Framing** (slow) — define the problem space, articulate principles and constraints, identify knowledge gaps. You control the speed; LLM agents generate perspectives, you discriminate among them. A well-framed problem is half-solved; a poorly framed one multiplies effort downstream.

**Planning** (moderate) — one or several LLM agents produce plans; consolidate and approve one that honors the frame. The plan specifies what each phase produces and how to verify the result, so execution can run on its own.

**Execution** (fast) — LLM agents implement the plan phase by phase. **Withdraw.** Step away — think, work on other things, rest. Peripheral monitoring is sufficient; the plan bounds the damage of any single step failing.

**Verification** (slow) — return to interactive mode, item by item. Check correctness, coherence, completeness. Can you explain what was produced in your own words? If not, you verified appearance without understanding substance. Propagate problems back to the originating stage.

Two structural features support the stages:

- **Multi-agent** — several LLM agents working in parallel at a stage, each reading only the upstream handoff, consolidated after independent work. Mix local models, cloud open-weight models, and closed-weight models as appropriate. Potential authors or collaborators can also contribute at any stage. Consolidation can be open (anyone consolidates) or dictated (a designated person consolidates) — the protocol doesn't prescribe.
- **Knowledge and memory** — handoffs bridging stage transitions, a companion wiki accumulating understanding across cycles, references preserving what influenced the work. Knowledge gaps are identified in Frame, tracked through Plan and Execute, checked for closure in Verify. Uncertainty markers guide verification priorities.

## Operations

**Frame.** State the problem in your own words before engaging LLM agents — your agenda, not theirs. Provide as much context as possible: files, websites, preliminary results, anything that grounds the agents in your specific situation. Then invite perspectives: ideas, constraints you missed, applicable frameworks. If using multiple agents, collect all perspectives before reading any. Read each carefully; moving too fast here is like chatting with someone who talks too fast — ideas overload and you can't discriminate signal from noise. Before leaving, make the problem definition, principles, hard constraints, and knowledge gaps explicit and stable. A good frame specifies what's in, what's out, what matters, what doesn't, and what you don't yet know.

**Plan.** Break the work into phases, each with clear steps and deliverables. A good plan defines what each phase produces, what constraints it must honor, and how to verify the result — so execution doesn't need you at every step. Don't over-specify; the plan bounds the work, it doesn't do the work. If using multiple agents, request plans from each and consolidate. Approve the plan.

**Execute.** LLM agents implement within plan boundaries — phase by phase, step by step. **Withdraw** — step away, think, work on other things, rest. A consolidation agent reviews between sub-steps; the plan bounds the damage of any single step failing, so peripheral monitoring is sufficient.

**Verify.** Find dedicated, uninterrupted time. Review the output — you identify issues, an LLM agent revises. Check correctness, coherence, completeness. Also check understanding: can you explain what the agents produced in your own words? If not, you verified appearance without understanding substance. When you find problems, propagate back to the originating stage and work through them interactively. You drive; LLM agents assist.

**Iteration and nesting.** When you find an issue at any stage, return to the originating stage's handoff. Framing problems → revise the frame and re-plan. Plan gaps → revise the plan and re-execute. Execution errors → start a new phase and re-execute. Verification failures → propagate back to whichever stage produced the issue. Iteration is not failure — it is how the protocol self-corrects. Sub-problems can get their own nested FPEV cycle.

## Knowledge and memory

Each stage transition produces a **handoff** — a markdown file in `handoffs/` that lets a fresh agent pick up where the previous stage left off. For example, the handoff from Execution's second phase is named stage-3-phase-2-IDs.md. A good handoff includes: current state, paths to source materials, distilled operational summaries (not just pointers), a glossary of non-obvious terms, what the next stage must produce, and any knowledge gaps or uncertainty markers carried forward — gaps and uncertainty live in handoffs, tracked from Frame through Verify. The diagnostic test: can a fresh agent, given only the handoff and the named source files, produce the next stage's deliverable? If not, the handoff is not done.

A **companion wiki** in `wiki/` accumulates what you learn across cycles. Each stage naturally updates it: Frame adds concepts, constraints, and gaps; Plan adds explanations and cross-references; Execute adds worked examples; Verify updates gap status and flags contradictions. When an agent starts a new stage, it reads the wiki as context. An **index** (catalog with links and summaries) and a **log** (running timeline) help you and the agents find things as the wiki grows. Both are updated after each stage or phase. The wiki is cultivated — it reflects what the deliberation actually produced, not a pre-planned taxonomy.

A **references** directory in `references/` preserves what influenced the work: discussions, comments, chat logs, source materials. If a mistake taught you something, that goes in too. When a sub-problem has been solved through the full FPEV cycle multiple times with consistent success, it can be promoted to a **tool** — a Mode-1 shortcut capturing the pattern: what the problem looks like, what frame works, what plan succeeds, what verification checks confirm. Tools live in references. When a tool fails, the problem recurses back to the full FPEV cycle.

**Knowledge gaps** are identified in Frame, tracked through Plan and Execute, checked for closure in Verify. The gap between your current understanding and what the problem requires is made explicit — you can't plan to close gaps you haven't named. Without gap tracking, frames collapse to "just solve the problem" and lose the structure that makes good planning and verification possible. Gaps make the difference between "I approved this" and "I understood and approved this." A gap carried forward is not a failure — it is a marked question that future cycles can address.

**Uncertainty marking.** Across all stages, agents should mark which parts of their output are uncertain — not generally uncertain, but specifically: "I'm confident about X, uncertain about Y because Z." These marks guide your verification priorities: verify the uncertain parts first.