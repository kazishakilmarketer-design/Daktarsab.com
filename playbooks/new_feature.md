# Playbook: New Feature

Use when the task is adding a new capability that doesn't exist yet.

---

## Trigger Examples
- "Build Hospital Recommendation System"
- "Add a Medical Timeline feature"
- "Add voice conversation support"

## Standard Agent Sequence

1. **Architecture Guardian** — full scan, dependency graph, Impact Report for the new feature's footprint.
2. **Product Strategist** — scope definition, phase alignment (is this Phase 1/2/3 per the roadmap?), cost/UX trade-offs.
3. **Patient Experience Designer** — flow/UX spec (if patient-facing).
4. **AI Triage Engineer** — triage/conversation logic spec (if the feature touches AI conversation).
5. **Frontend Engineer** + **Backend AI Engineer** — implementation (can run in parallel on independent layers, coordinated by Orchestrator).
6. **Medical Safety Auditor** — mandatory if the feature touches triage, symptoms, emergency detection, or medical advice.
7. **QA & Regression Engineer** — full verification.
8. **Performance Engineer** — if the feature adds new API calls/AI usage, measure and optimize.
9. **Security Engineer** — mandatory if new data flows or integrations are introduced.
10. **Documentation Engineer** — log the feature.
11. **Release Gatekeeper** — final sign-off collection and Founder approval.

## Notes
- New routes are always additive — Architecture Guardian confirms no existing route is altered.
- If the feature is Phase 3 (per README roadmap) but Phase 1/2 work is incomplete, Product Strategist flags this to the Founder before proceeding.
