# Agent Completion Report Template

Every agent must fill out this exact template at the end of every task. Copy the structure below.

```markdown
## Agent: [Agent Name]
## Task: [Original Founder task, verbatim]
## Date: [ISO date]

### Summary
[2-4 sentences: what was done and why]

### Files Affected
- path/to/file.tsx — [what changed]
- path/to/file2.ts — [what changed]

### Files NOT Affected (adjacent but untouched)
- path/to/related-file.tsx
- path/to/related-file2.tsx

### Decisions Made
- [Decision 1 and rationale]
- [Decision 2 and rationale]

### Risks Identified
- [Risk] → [Mitigation, or "escalated to Founder"]

### Checks Run (Constitution Article 9)
- [ ] Build success
- [ ] TypeScript / lint
- [ ] Route validation
- [ ] Import validation
- [ ] Runtime / console error check
- [ ] Responsive check
- [ ] Regression test
- [ ] API compatibility

### Outstanding Issues
- [Anything unresolved, or "None"]

### Recommended Next Step
- [Which agent should receive this next, or "Ready for Founder approval"]
```

## Rules

- Every checkbox must be explicitly marked pass/fail — never left blank.
- "Files Affected" must use exact paths, not descriptions.
- If a section has nothing to report, write "None" — do not omit the section.
