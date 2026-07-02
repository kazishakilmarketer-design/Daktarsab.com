# Playbook: Performance & Cost

Use when the task is about speed, responsiveness, or reducing AI/API cost.

---

## Trigger Examples
- "Improve Token Optimization"
- "Chat feels slow on first load"

## Standard Agent Sequence

1. **Architecture Guardian** — Impact Report for areas targeted for optimization.
2. **Performance Engineer** — baseline measurement, target identification, implementation, delta measurement.
3. **AI Triage Engineer** — consulted whenever an optimization would change what/how many questions are asked or what data reaches the AI (e.g. batching, template reuse, context reuse) — logic ownership stays with AI Triage Engineer even if Performance Engineer implements it.
4. **Medical Safety Auditor** — mandatory if any optimization could reduce the information available for a triage decision (e.g. removing a question to save tokens).
5. **QA & Regression Engineer** — verify no behavior regression alongside the performance gain.
6. **Documentation Engineer** — log baseline vs. result.
7. **Release Gatekeeper** — final sign-off.

## Notes
- Cost/speed optimizations must never be the sole justification for removing clinically relevant questions or steps — Constitution Article 1 (Patient Safety First) always outranks Article 8/cost efficiency.
- Always report measured before/after numbers, not estimates.
