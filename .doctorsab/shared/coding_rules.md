# Coding Rules

Applies to every agent that writes or edits code (Frontend, Backend AI, Bug Fix, Performance, Security).

---

## Hard Rules

1. **Never rename existing components, files, routes, or exported function names.** If a rename would genuinely improve the codebase, propose it — don't do it.
2. **Never modify an existing route's path or params.** New routes are additive only.
3. **Never change a shared component's public prop interface** without checking every consumer first and documenting the impact.
4. **Never introduce a new state-management pattern** alongside an existing one (e.g. don't add Redux if the app uses Context/Zustand) without Founder approval.
5. **Never touch business logic while doing a "UI-only" task.** If a UI task seems to require a logic change, stop and hand off / escalate.
6. **Match existing code style** (formatting, naming conventions, file organization) — don't introduce a personal style.
7. **No temporary hacks, TODOs-as-solutions, or commented-out dead code** left in the final diff.
8. **Every new dependency must be justified** in the agent's report — no silent `npm install`.

## Before Editing Any File

1. Open and read the entire file.
2. Search for all imports of this file across the project.
3. Search for all usages of any exported symbol from this file.
4. Note this in the Impact Report before making the edit.

## Impact Report (required before every edit of a shared/critical file)

```markdown
### Impact Report — [filename]
Affected:
- [component/file] — [how]
Not affected:
- [component/file]
Rollback plan:
- [how to revert this specific change]
```

## After Every Commit (Constitution Article 9, minimum)

- [ ] Build succeeds
- [ ] TypeScript has no new errors
- [ ] ESLint has no new errors
- [ ] No broken imports
- [ ] No broken routes
- [ ] Responsive check (mobile + desktop)
- [ ] No new runtime errors
- [ ] No new console errors/warnings
- [ ] API compatibility preserved

## Claim Verification Rule (mandatory)

Any report that states a shared or critical file was "reverted," "unchanged," "restored to original," or "implemented" must attach the actual `git diff` output proving it — not a prose description. A claim without an attached diff is not accepted and the task must not proceed on the strength of the claim alone.

This applies especially to:
- Auto-generated or schema-defining files (e.g. `supabase/types.ts`)
- Global config files (`eslint.config.js`, `tsconfig.json`, etc.)
- Any file flagged in `shared/agent_memory.md` as having a history of incorrect edits

If a "revert" is claimed, the required diff must show **zero differences** against the reference commit — not a smaller diff, not a diff with added comments. Anything less than an empty diff means the revert is incomplete and must be redone before proceeding.

This rule exists because free-form status claims have previously diverged from the actual file state on this project (see `shared/agent_memory.md` — Supabase `types.ts` incident). Verification against source control output is the standard from this point forward, not an occasional spot-check.
