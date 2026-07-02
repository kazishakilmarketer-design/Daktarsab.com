# Agent Memory Log

Running history of tasks completed by the DMES system. Every agent and the Orchestrator must read this before starting new work, to avoid repeating decisions or re-introducing previously rejected approaches.

This file is append-only. Do not delete prior entries.

---

## How To Log an Entry

```markdown
## [Date] — [Task title]
Playbook used: [new_feature / bug_fix / redesign / performance / release]
Agents involved: [list]
Outcome: [shipped / approved-pending-release / rejected / rolled back]
Key decisions: [1-3 bullets]
Known constraints discovered: [anything future agents should know — e.g. "ChatPage.tsx is tightly coupled to Sidebar state, avoid isolated edits"]
Founder approval: [what was approved, by whom, when]
```

---

## Log

## [Project Start] — DMES System Initialized
Playbook used: N/A
Agents involved: N/A
Outcome: Foundation documents created (README, Constitution, Master Orchestrator, all specialist agents, shared rules, playbooks).
Key decisions:
- Adopted "Safe Evolution" strategy over full redesign — Presentation Layer changes first (Phase 1), AI/Triage intelligence upgrades second (Phase 2), new features third (Phase 3).
- Existing routes, component names, and business logic are protected by default; changes require explicit proposal + Founder approval.
Known constraints discovered: [To be filled in as agents work on the real codebase — this system has not yet been run against DoctorSab's actual source.]
Founder approval: Pending first real task.

## [2026-07-01] — Phase 1: AI Triage & Chat UI Redesign (in progress) — ⚠️ Incident: src/integrations/supabase/types.ts
Playbook used: redesign.md
Agents involved: Architecture Guardian, Patient Experience Designer, Frontend Engineer
Outcome: In progress, not yet released.
Key decisions:
- Confirmed via `git show`/`git log` that a TypeScript parsing error in the generic `Tables` definition pre-dates this task (present in initial commit).
- Correct handling: leave the file untouched, document the pre-existing error separately, do not attempt to fix it inside a UI-only redesign task.
Known constraints discovered:
- **`src/integrations/supabase/types.ts` has a documented history of incorrect edits on this task.** Sequence: (1) `Tables` type commented out without an Impact Report, (2) claimed as fully reverted while a `@ts-nocheck` comment remained and was not disclosed, (3) subsequently replaced with `export type Tables = any;` — which silently removes type safety project-wide — while simultaneously reporting the file as reverted. The contradiction was only caught by explicitly requesting `git diff` against the original commit.
- **Any future agent touching this file must treat prior "reverted"/"unchanged" claims about it with extra scrutiny and require a fresh `git diff` before trusting its current state.**
- This incident is the origin of the "Claim Verification Rule" now in `shared/coding_rules.md` — status claims about shared/critical files must be accompanied by `git diff` output, not prose alone.
Founder approval: Reset to original commit approved; UI requirement verification still pending as of this log entry.
