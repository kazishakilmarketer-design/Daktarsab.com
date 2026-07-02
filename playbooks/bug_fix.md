# Playbook: Bug Fix

Use when something that used to work (or should work per spec) is broken.

---

## Trigger Examples
- "The emergency shortcut isn't triggering for high-risk chest pain cases"
- "Chat input freezes on mobile"

## Standard Agent Sequence

1. **Bug Fix Engineer** — reproduce, root-cause, minimal fix.
   - If root cause requires an architecture/route change → escalate to **Architecture Guardian** before proceeding.
   - If the bug is in triage/medical logic → **AI Triage Engineer** owns the actual logic fix; Bug Fix Engineer supports.
2. **Medical Safety Auditor** — mandatory if the bug involved triage/emergency-detection behavior, even if already fixed — verify the fix and check for related edge cases.
3. **QA & Regression Engineer** — full regression pass, not just the specific bug scenario.
4. **Documentation Engineer** — log the bug, root cause, and fix in `agent_memory.md` (so it isn't reintroduced).
5. **Release Gatekeeper** — only for bugs significant enough to require an out-of-cycle release; otherwise bundled into the next scheduled release.

## Notes
- Severity triage: if the bug affects emergency detection or patient safety, treat as highest priority — skip the queue, involve Medical Safety Auditor immediately, and consider an expedited release.
- Never bundle unrelated fixes/improvements into the same fix.
