# Handoff Package — Patient Experience Designer → Medical Safety Auditor

**Date:** 2026-07-01
**From:** Agent 04 — Patient Experience Designer
**To:** Agent 08 — Medical Safety Auditor
**Protocol reference:** `.doctorsab/shared/handoff_protocol.md`

---

## 1. Original Founder Task (verbatim)

> Implement the 2 missing distressed-user requirements exactly as follows:
>
> 1. Persistent Disclaimer line — Add a small, always-visible line at the bottom of the chat interface (below the input bar, not a popup/modal). Exact text: "এটি একটি প্রাথমিক পরামর্শ, ডাক্তারের বিকল্প নয়। জরুরি প্রয়োজনে নিকটস্থ হাসপাতালে যোগাযোগ করুন।"
>
> 2. Elderly-friendly defaults — Base font size for chat messages and buttons: minimum 16px. Minimum tap target size for all interactive buttons at 44x44px.
>
> Additionally (approved earlier in this task):
> - One-tap Emergency Actions: expand the emergency banner to include "অ্যাম্বুলেন্স কল" (tel:999) and "শেয়ার লোকেশন" (geolocation → Google Maps) buttons.
> - Mode selector badge (Normal / Deep / Emergency) in the chat topbar.
> - Live Symptom Summary Card.
> - Quick Selection Grid at session start.

---

## 2. Completed Report (per shared/report_template.md)

### Agent: Patient Experience Designer (04)
### Task: Distressed-user requirements — Disclaimer + Elderly-friendly defaults + Emergency Banner One-tap Actions
### Date: 2026-07-01

### Summary
Added 5 distressed-user UI requirements to src/components/ChatInterface.tsx and src/patient-ui.css. Changes are presentation-layer only. The emergency detection logic (isEmergencyMessage, EMERGENCY_KEYWORDS_BN/EN, triage rules) was NOT modified. A lint-driven refactor of the pre-existing Supabase upsert sync block was briefly introduced, caught by Founder review, and reverted; the sync block is now byte-for-byte identical to commit b8c1fd0845.

### Files Affected
- src/components/ChatInterface.tsx — UI only: mode badge, emergency banner expansion, disclaimer, font sizes, quick grid, symptom card. No changes to isEmergencyMessage call site, triage logic, or medical_records sync block.
- src/patient-ui.css — CSS only: mode badge styles, tap targets, elderly-friendly font rules.

### Files NOT Affected (adjacent but untouched)
- src/lib/doctorSaabAgents.ts
- src/lib/AI_Engine.ts
- src/lib/orchestrator.ts
- src/integrations/supabase/types.ts
- src/pages/DoctorDashboard.tsx
- eslint.config.js

### Decisions Made
- Emergency banner buttons use window.open('tel:999') — relies on OS dialer, does not replace it.
- Geolocation share opens Google Maps URL; no data sent to DaktarSab servers.
- Disclaimer is hardcoded Bengali string, always visible, non-interactive, rendered outside the scrollable message list.
- isEmergencyMessage() call at line 290 is unchanged — banner shows immediately on keyword match, before AI response.
- Font upgrade from text-sm (14px) to text-base (16px) scoped to chat message bubble <p> elements only.

### Risks Identified
- Emergency button on desktop may not trigger dialer → Low severity on primary mobile platform.
- Geolocation silent-fail on permission denial → Low severity; ambulance call is independent.
- Mode badge "জরুরি" vs emergency banner confusion → HIGH — requires Medical Safety Auditor judgment (see Risk A below).

### Checks Run (Constitution Article 9)
- [PASS] Build success
- [PASS] TypeScript / lint — 10 errors / 1 warning, all pre-existing, zero net-new
- [N/A]  Route validation — no new routes
- [PASS] Import validation
- [NOT RUN] Runtime / console error check — requires live browser session
- [NOT RUN] Responsive check — visual diff review only; device simulation not run
- [NOT RUN] Regression test — deferred until after Medical Safety Auditor approval
- [N/A]  API compatibility — no API changes

### Outstanding Issues
- Geolocation silent-fail: no user feedback on permission denial.
- Mode badge vs emergency banner confusion: flagged for Medical Safety Auditor.
- Pre-existing lint debt (127 errors, 9 unrelated files): deferred, logged in shared/agent_memory.md.

### Recommended Next Step
Agent 08 — Medical Safety Auditor.

---

## 3. Files Touched

| File | Change |
|------|--------|
| src/components/ChatInterface.tsx | UI only: mode badge, emergency banner buttons, disclaimer, font sizes, quick grid, symptom card |
| src/patient-ui.css | CSS only: mode badge, tap targets, elderly-friendly font rules |

## 4. Files Adjacent but NOT Touched

| File | Reason adjacent |
|------|----------------|
| src/lib/doctorSaabAgents.ts | Contains isEmergencyMessage() — not modified |
| src/lib/AI_Engine.ts | AI triage engine — not modified |
| src/lib/orchestrator.ts | Consultation handler — not modified |
| src/components/OnboardingCard.tsx | Rendered inside ChatInterface — not modified |

---

## 5. Open Risks for Medical Safety Auditor

### RISK A (HIGH PRIORITY): Mode Badge "জরুরি" vs Emergency Banner

The mode selector badge in the topbar cycles: Normal → Deep → Emergency (জরুরি).

What it does: changes the `mode` state variable. The mode state is currently NOT wired into handleMedicalConsultation() — it is UI-only in this implementation.
What it does NOT do: it does NOT trigger setEmergencyBanner(true) and does NOT call tel:999.

Safety concern: A distressed user in an actual emergency might tap "জরুরি" in the mode badge expecting emergency services to be contacted, but nothing safety-critical happens. The real emergency path requires typing a message that matches isEmergencyMessage() keywords.

Auditor question: Is this label safe as-is, or should the Emergency mode badge either:
(a) be renamed to something non-emergency (e.g. "বিশেষজ্ঞ"), or
(b) trigger the emergency banner when selected?

### RISK B (MEDIUM): Disclaimer Copy — Adequacy

Persistent disclaimer (always visible at bottom of chat):
"এটি একটি প্রাথমিক পরামর্শ, ডাক্তারের বিকল্প নয়। জরুরি প্রয়োজনে নিকটস্থ হাসপাতালে যোগাযোগ করুন।"
Translation: "This is a preliminary consultation, not a substitute for a doctor. In case of emergency, contact the nearest hospital."

Auditor question: Is "প্রাথমিক পরামর্শ" (preliminary consultation) adequate wording, or does it risk implying the AI provides a real (if basic) medical consultation rather than automated assistance?

### RISK C (LOW): Emergency Banner Dismissibility

The emergency banner has a "বন্ধ করুন" (close) button. A user could dismiss it and continue chatting.

Auditor question: Is a dismissible emergency banner acceptable, or should it require a confirmation step before closing?

---

## 6. Required Checks Already Passed

| Check | Result |
|-------|--------|
| git diff b8c1fd0845 -- src/integrations/supabase/types.ts | ZERO DIFF |
| git diff b8c1fd0845 -- eslint.config.js | ZERO DIFF |
| git diff b8c1fd0845 -- src/pages/DoctorDashboard.tsx | ZERO DIFF |
| npx eslint src/components/ChatInterface.tsx | 10 errors / 1 warning — matches original baseline |
| Upsert sync block vs b8c1fd0845 | Byte-for-byte identical |
| shared/agent_memory.md — single ## Log header | CONFIRMED (line 23 only) |
| npm run build | PASS (pre-existing errors in unrelated files documented) |

---

Handoff prepared by Agent 04 — Patient Experience Designer, 2026-07-01.
Awaiting Agent 08 — Medical Safety Auditor review before QA/Regression or Release Gatekeeper stages.
