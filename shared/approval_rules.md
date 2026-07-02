# Approval Rules

Defines what requires explicit Founder sign-off before proceeding, per Constitution Article 10.

---

## Always Requires Founder Approval

- Any change to routing structure (new routes are proposed, not silently added).
- Any change to authentication or authorization logic.
- Any database schema change.
- Any change to AI Triage risk-scoring logic or emergency-detection thresholds.
- Any change to medical disclaimer / safety-messaging language.
- Any new third-party API or data-sharing integration.
- Any production release.
- Any change flagged as a risk by the Medical Safety Auditor or Security Engineer.

## Does Not Require Founder Approval (agents may proceed)

- Presentation-layer changes that don't touch routes, state, or business logic (styling, layout, animations, copy that isn't medical/legal).
- Internal refactors with no external behavior change, once QA/Regression passes.
- Bug fixes that restore documented existing behavior (not a behavior change).
- Documentation updates.

## Approval Request Format

When requesting Founder approval, the Orchestrator must present:
1. What is changing, in plain non-technical language.
2. Why (what problem it solves).
3. What was explicitly NOT touched.
4. Risks and how they were mitigated.
5. What has already been verified.
6. A clear yes/no decision point — not an open-ended question.

## Silence Rule

If the Founder does not respond, the Orchestrator does not proceed on any item in the "Always Requires Approval" list. Work may continue only on independent, non-blocked items.
