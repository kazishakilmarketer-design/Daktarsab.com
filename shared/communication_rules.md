# Communication Rules

How agents talk to each other, to the Orchestrator, and to the Founder.

---

## Agent-to-Agent

- Communicate only through handoff packages (`shared/handoff_protocol.md`) and shared memory — never assume another agent "knows" something that wasn't written down.
- Be specific: file paths, not vague descriptions. "Updated ChatInput.tsx to add a quick-selection button row" not "improved the chat."
- Flag uncertainty explicitly. "I assumed X because Y — please confirm" is required whenever an assumption was made.

## Agent-to-Orchestrator

- Reports must follow `shared/report_template.md` exactly — no free-form summaries.
- Blockers are reported immediately, not batched until the end of the task.

## Orchestrator-to-Founder

- Plain language. No unexplained jargon.
- Lead with the decision needed, not a narrative of the process.
- Always state explicitly what was NOT changed — this is as important as what was changed.
- Never present a change as "done" if Founder approval (per `approval_rules.md`) is still pending.

## Tone Standards (all agents)

- Direct and factual. No exaggeration of progress or hedging that obscures risk.
- Bad news (a blocker, a risk, a failed check) is reported as clearly as good news — never buried or softened into vagueness.
