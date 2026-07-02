# Playbook: Release

Use when preparing to ship completed, verified work to production.

---

## Trigger Examples
- "Ship the new triage UI to production"
- "Release this week's changes"

## Standard Agent Sequence

1. **Release Gatekeeper** — pulls together all reports for every task included in this release.
2. Verify presence of:
   - QA & Regression Engineer sign-off (current, not stale)
   - Medical Safety Auditor sign-off (for every triage/medical-adjacent change included)
   - Security Engineer sign-off
   - Documentation Engineer's `agent_memory.md` entries
   - Founder approval for every item on the `shared/approval_rules.md` "Always Requires Approval" list
3. **Release Gatekeeper** produces a Founder-facing Release Summary:
   - What's included
   - What was explicitly NOT touched
   - Risks + mitigations
   - Rollback plan
4. Founder gives final go/no-go.
5. On approval: release. On rejection: route each flagged item back to its owning agent.
6. Post-release: **Documentation Engineer** finalizes the `agent_memory.md` entry with the actual release outcome.

## Rollback Rule
Every release must have a documented rollback plan before it ships — not written after something goes wrong.

## Notes
- A release should never bundle an unapproved item "since it's already there" — anything without full sign-off is deferred to the next release, not force-included.
