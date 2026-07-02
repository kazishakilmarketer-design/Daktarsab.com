# Playbook: Redesign (UI/UX)

Use for visual/interaction changes, following the "Safe Evolution, not Redesign" principle.

---

## Trigger Examples
- "Redesign AI Triage UI"
- "Update Chat Interface to Gemini-inspired style"

## Governing Principle
Phase 1 rule applies: **Presentation Layer only.**
- ✅ New Chat UI, AI Avatar, better message cards, smart input bar, mobile hamburger menu, animations.
- ❌ No route changes, no API changes, no database changes, no component renames.

## Standard Agent Sequence

1. **Architecture Guardian** — Impact Report confirming the redesign's footprint is Presentation-Layer only. If it isn't, stop and reclassify as `new_feature.md`.
2. **Product Strategist** — confirm scope and phase alignment.
3. **Patient Experience Designer** — flow/visual spec, following existing Adaptive Triage UI patterns (quick-selection, progressive disclosure).
4. **Frontend Engineer** — implementation, existing component names preserved, no route edits.
5. **Medical Safety Auditor** — mandatory if any copy or interaction pattern touches triage/emergency messaging.
6. **QA & Regression Engineer** — full regression, with specific focus on responsive/mobile and cross-route visual consistency.
7. **Documentation Engineer** — log.
8. **Release Gatekeeper** — final sign-off.

## Notes
- If mid-implementation the Frontend Engineer discovers the redesign actually requires a logic or route change, halt immediately and escalate to Architecture Guardian — do not quietly expand scope.
