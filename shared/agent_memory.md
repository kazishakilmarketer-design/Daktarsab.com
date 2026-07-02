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

## [2026-07-01] — Lint Technical Debt (Pre-existing)
Playbook used: redesign.md
Agents involved: Frontend Engineer, QA Engineer
Outcome: Deferred pending Founder decision
Key decisions:
- Lint errors in many files unrelated to UI redesign are documented as technical debt.
- No code changes will be made to those files in this task.
Known constraints discovered:
- Files: src/pages/DoctorDashboard.tsx, src/pages/Doctors.tsx, src/pages/HealthCard.tsx, src/pages/HomeDashboard.tsx, src/pages/JoinAsPartner.tsx, src/pages/PartnerBookings.tsx, src/pages/PartnerDashboard.tsx, src/pages/PaymentGateway.tsx, src/testTriageAI.ts
- Error count: 127 errors, 18 warnings (total 145 problems) from the lint run on original commit.
Founder approval: Deferred pending decision.

---

## [2026-07-01] — Lesson Learned: Lint-Driven Refactor of Pre-existing Backend Persistence
Playbook used: redesign.md
Agents involved: Frontend Engineer, QA Engineer
Outcome: Caught by Founder review — reverted cleanly
Key decisions:
- During a "Presentation Layer only" UI redesign of ChatInterface.tsx, a lint error (`no-explicit-any`) in the pre-existing Supabase `.upsert()` call triggered a refactor of that call into a select-then-branch pattern (select → insert or update). This changed the persistence mechanism (2 round-trips instead of 1, different error handling) while producing identical end-state data.
- Founder correctly identified this as a backend logic change outside redesign scope. The refactor was reverted to the original single `.upsert({...}, { onConflict: "user_id,record_type" })` call exactly as in commit b8c1fd0845.
Known constraints discovered:
- CRITICAL RULE for all future agents: Any lint or type-safety fix that touches a line containing a Supabase `.from()`, `.upsert()`, `.insert()`, `.update()`, `.select()`, or `.delete()` call must be treated as a potential backend scope boundary. Even if the file is otherwise in scope (e.g. ChatInterface.tsx for a UI task), do NOT refactor the surrounding persistence logic. If the pre-existing `any` cast is the only path to suppressing the lint error without touching call structure, add a `// eslint-disable-next-line` comment and leave the call unchanged.
- File affected: src/components/ChatInterface.tsx — the Supabase sync block around the `chatSyncRef.current = setTimeout(...)` closure is pre-existing backend persistence logic, not part of the UI layer.
Founder approval: Revert approved 2026-07-01.

---

## [2026-07-01] — Future Consideration: Emergency Banner Dismissibility (Risk C)
Playbook used: redesign.md
Agents involved: Medical Safety Auditor
Outcome: Deferred — low priority, no action taken in this task
Key decisions:
- The emergency banner currently has a "বন্ধ করুন" (close) button that immediately hides it with no confirmation step. A distressed user could accidentally dismiss it while trying to interact with the ambulance/location buttons.
- Founder decision: no action in this task. Flagged for a future UX/safety hardening pass.
Known constraints discovered:
- Future consideration: evaluate requiring a confirmation tap ("আপনি কি নিশ্চিত বন্ধ করতে চান?") before closing the emergency banner, or a brief delay before the close button becomes active.
- Component affected: src/components/ChatInterface.tsx — emergencyBanner state and "বন্ধ করুন" Button at line ~424.
Founder approval: Deferred 2026-07-01. Revisit in Phase 2 (UX hardening).

---

## [2026-07-01] — HIGH PRIORITY FOLLOW-UP: Pediatric Fever Not Triggering Emergency Banner
Playbook used: N/A — standalone clinical safety gap, requires new_feature or bug_fix playbook
Agents involved: Medical Safety Auditor (identified), AI Triage Engineer (Agent 05) (action required)
Outcome: OPEN — not addressed in this task, must be scheduled as separate high-priority task
Key decisions:
- A child with a fever of 104°F (40°C) or higher is a genuine clinical emergency. However, the current TRIAGE_RULES in src/lib/doctorSaabAgents.ts classify all "জ্বর" (fever) as urgency: "low", and fever keywords are NOT present in the EMERGENCY_KEYWORDS_BN/EN sets derived from SYMPTOM_DB.
- This means a parent typing "শিশুর জ্বর ১০৪" or "আমার বাচ্চার জ্বর অনেক বেশি" will NOT see the emergency banner — a direct clinical safety gap.
Known constraints discovered:
- File affected: src/lib/doctorSaabAgents.ts — TRIAGE_RULES fever entry (urgency: "low") and SYMPTOM_DB entries where severity is not "emergency" for fever.
- Required action for Agent 05: (1) Add high-fever-in-child as an emergency sub-case in SYMPTOM_DB (e.g. severity: "emergency" when combined with pediatric context or high temperature mention). (2) Consider a composite rule: fever keywords + age < 5 OR temperature > 103°F → emergency. (3) Verify the change does not cause false-positive emergency banners for adult low-grade fevers.
- Founder priority: HIGH — this is a clinical safety gap, not a UX issue. Schedule before next major release.
Founder approval: Flagged by Medical Safety Auditor 2026-07-01. Requires Founder scheduling of Agent 05 task.

---

## [2026-07-01] — HIGH PRIORITY FOLLOW-UP: Stroke and Pregnancy Emergency Keyword Coverage Unverified
Playbook used: N/A — requires dedicated audit task
Agents involved: Medical Safety Auditor (identified), AI Triage Engineer (Agent 05) (action required)
Outcome: OPEN — coverage not verified during this task's audit, must be audited separately
Key decisions:
- During the Medical Safety Auditor review of the Distressed-User UI Redesign task, stroke and pregnancy-complication emergency keyword coverage in SYMPTOM_DB and EMERGENCY_KEYWORDS_BN/EN could not be verified within scope. These are high-risk omissions if not covered.
- Stroke symptoms (sudden speech loss, facial drooping, arm weakness — "হঠাৎ কথা বলতে পারছে না", "মুখ বেঁকে গেছে", "হাত অবশ হয়ে গেছে") and pregnancy complications (antepartum haemorrhage, eclampsia — "গর্ভাবস্থায় রক্তক্ষরণ", "খিঁচুনি") were not tested against live keyword sets.
Known constraints discovered:
- Files to audit: src/lib/doctorSaabAgents.ts (EMERGENCY_KEYWORDS_BN/EN, TRIAGE_RULES), src/lib/symptomDb.ts (SYMPTOM_DB severity classifications).
- Required action for Agent 05: (1) Enumerate all stroke and obstetric-emergency keyword entries currently in SYMPTOM_DB. (2) Run isEmergencyMessage() against the listed test phrases. (3) Add any missing keywords and set severity: "emergency" appropriately. (4) Produce a test report confirming coverage.
- Founder priority: HIGH — stroke is a time-critical emergency ("time is brain"); pregnancy haemorrhage is life-threatening. Coverage gaps here could cause false reassurance in real emergencies.
Founder approval: Flagged by Medical Safety Auditor 2026-07-01. Requires Founder scheduling of Agent 05 task.
