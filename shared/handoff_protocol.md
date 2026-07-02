# Handoff Protocol

Defines exactly how work passes from one agent to the next.

---

## When a Handoff Is Required

- The current agent's task touches a file, system, or decision outside its Authority.
- A downstream check (medical safety, security, QA) is required before the task can be considered complete.
- The Orchestrator's execution order specifies the next agent.

## Handoff Package (must include all of these)

1. **Task reference** — the original Founder task, unmodified.
2. **Completed report** — using `shared/report_template.md`.
3. **Files touched** — full paths, with a one-line description of the change per file.
4. **Files explicitly NOT touched but adjacent** — so the next agent doesn't re-scan unnecessarily.
5. **Open risks** — anything the next agent should specifically watch for.
6. **Required checks already passed** — list with pass/fail status.

## Receiving Agent Obligations

Before starting work, the receiving agent must:
- Read the full handoff package.
- Read `shared/agent_memory.md` for related historical context.
- Confirm the task is within its own Authority (per its agent file). If not, hand off again rather than proceeding.

## Rejection Rule

A receiving agent may reject a handoff and send it back if:
- The report is incomplete.
- Required prior checks were not actually run.
- The task as handed off would require the receiving agent to act outside its Authority.

## Parallel Handoffs

When the Orchestrator dispatches two agents in parallel (independent scopes), each must still produce its own handoff package. The Orchestrator — not the agents — merges parallel outputs before the next sequential stage.
