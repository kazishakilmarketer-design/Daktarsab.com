# 🤖 AGENT_SYSTEM.md — DaktarSab Multi-Agent Development Framework

> **Version:** 1.0 · **Created:** 2026-04-24 · **References:** PROJECT_SUMMARY.md
> **Stack:** React 18 + TypeScript + Vite · Supabase · Gemini Pro · Firebase Hosting

---

## MASTER PROTOCOL (All Agents Follow This Loop)

```
1. CHECK   → Read current code/DB state before any change
2. FIND    → Identify exact bug/gap with file:line reference
3. FIX     → Apply minimal, targeted change only
4. RECHECK → Verify fix doesn't break adjacent logic
5. REPORT  → Output structured report (see each agent's Output Report Format)
```

---

## AGENT 1 — Master Controller

### Role
Orchestrates all 6 specialist agents. Routes tasks, resolves conflicts, tracks sprint progress, and enforces execution order. Acts as the single source of truth for what is being worked on at any time.

### Assigned Files
- `PROJECT_SUMMARY.md` — living system state document
- `AGENT_SYSTEM.md` — this file
- `src/App.tsx` — routing and guard decisions
- `supabase/migrations/` — schema change log

### Issue List
| ID | Issue |
|----|-------|
| MC-1 | No defined task-routing protocol between agents |
| MC-2 | No sprint state tracker — agents work in isolation |
| MC-3 | Security fixes (SEC-1 to SEC-6) have no enforcement gate |
| MC-4 | Phase 1 crash fixes not sequenced before Phase 2 UI work |

### Fix Strategy
1. Enforce execution order: Security → Database Agent → AI Triage Agent → UI/UX Agent → Booking Agent → Health Card Agent
2. Block Phase 2 work until all SEC-* issues are closed
3. Maintain master checklist in `PROJECT_SUMMARY.md` Section 13
4. Daily sync: each agent reports status via Output Report Format below

### Pipeline Steps
```
Step 1: Read PROJECT_SUMMARY.md §3 (Gap Analysis) + §13 (Checklist)
Step 2: Assign open 🔴 issues to correct specialist agent
Step 3: Confirm no two agents edit the same file simultaneously
Step 4: After each agent completes, update §14 System Health Scorecard
Step 5: Gate Phase 2 start: all SEC-* closed + UI-6 crash fixed + DB-1 resolved
```

### Output Report Format
```
## Master Controller Report — [DATE]
Sprint: [Phase 1 / Phase 2 / Phase 3]
Agents Active: [list]
Agents Blocked: [agent] — reason
Issues Closed This Cycle: [SEC-1, UI-6, ...]
Issues Still Open: [list with owner agent]
Phase Gate Status: Phase 2 LOCKED / UNLOCKED
Next Priority: [top 3 tasks with assigned agents]
```

---

## AGENT 2 — AI Triage Agent

### Role
Owns the full AI intelligence layer: symptom detection, Gemini pipeline, local fallback agents, specialist mapping, and emergency routing.

### Assigned Files
- `src/lib/AI_Engine.ts`
- `src/lib/aiChat.ts`
- `src/lib/orchestrator.ts`
- `src/lib/symptomDb.ts`
- `src/lib/doctorSaabAgents.ts`
- `src/lib/bilingualTranslator.ts`
- `supabase/functions/chat/index.ts`

### Issue List
| ID | Issue | Location |
|----|-------|----------|
| AI-1 | Dual specialist mapping — `SYMPTOM_DB.specialty` ≠ `TRIAGE_RULES[].specialist` | `AI_Engine.ts` vs `doctorSaabAgents.ts` |
| AI-2 | Emergency hospitals hardcoded to Dhaka for all patients | `doctorSaabAgents.ts:333–334` |
| AI-3 | `Math.random()` used for doctor rating and fee in fallback | `doctorSaabAgents.ts:354–356` |
| AI-4 | No session persistence — conversation history reset on page reload | `ChatInterface.tsx` |
| AI-5 | Emergency over-triggering on mild breathlessness | `symptomDb.ts` + `AI_Engine.ts:68` |
| AI-6 | `bilingualTranslator.ts` output injected into Gemini prompt unsanitized | `aiChat.ts:97` |

### Fix Strategy
1. **AI-1:** Create `src/lib/specialtyMap.ts` with `CANONICAL_SPECIALTY` record (25 specialties, bilingual). Both `AI_Engine.ts` and `doctorSaabAgents.ts` import from it.
2. **AI-2:** Replace hardcoded Dhaka hospital array with `findHospitalsByLocation(patientDistrict)` Supabase query using district from `PatientContext`.
3. **AI-3:** Remove `Math.random()` — query real `doctors` table for `rating` and `fee_in_person` fields.
4. **AI-4:** On triage completion call `saveConsultationToHistory()` → persist to `medical_records`. On chat load, read last 3 records to restore context.
5. **AI-5:** Add `intensity` qualifier to emergency entries. Only trigger emergency if ≥ 2 emergency signals present OR score ≥ threshold.
6. **AI-6:** Sanitize translator output — strip markdown, limit to 200 chars before injecting into system prompt.

### Pipeline Steps
```
Step 1: Create src/lib/specialtyMap.ts — CANONICAL_SPECIALTY (25 specialties)
Step 2: Update AI_Engine.ts — replace inline specialty strings with CANONICAL_SPECIALTY keys
Step 3: Update doctorSaabAgents.ts — replace TRIAGE_RULES specialist strings with CANONICAL_SPECIALTY
Step 4: Fix doctorSaabAgents.ts:333 — call findHospitalsByLocation(district) from PatientContext
Step 5: Remove Math.random() from doctorSaabAgents.ts:354–356 — query doctors table instead
Step 6: Add symptom_logs INSERT in AI_Engine.ts after every triage decision
Step 7: Sanitize bilingualTranslator output before aiChat.ts:97 injection
Step 8: Test: same symptom → same specialist via both AI_Engine and doctorSaabAgents paths
```

### Output Report Format
```
## AI Triage Agent Report — [DATE]
Files Modified: [list]
AI-1 Status: FIXED / IN PROGRESS — specialtyMap.ts created with [N] entries
AI-2 Status: FIXED / OPEN — emergency now queries [district] hospitals
AI-3 Status: FIXED / OPEN — Math.random() removed from [file:line]
AI-5 Threshold: emergency triggers at score ≥ [N] (was [old value])
symptom_logs: INSERT verified ✅/❌
Test Result: [N]/20 emergency phrases detected correctly
Regressions: [none / list]
```

---

## AGENT 3 — Location Routing Agent

### Role
Owns all geographic logic: district/upazila normalization, hospital lookup accuracy, patient location context, and the `locations` master table.

### Assigned Files
- `src/lib/locations.ts`
- `src/components/DistrictSelector.tsx`
- `src/contexts/PatientContext.tsx`
- `supabase/migrations/` (new location migration)
- `src/lib/doctorSaabAgents.ts` (findHospitalsByLocation)
- `src/lib/orchestrator.ts` (findHospitalsByLocation call)

### Issue List
| ID | Issue | Location |
|----|-------|----------|
| LOC-1 | No normalized locations table — district/upazila stored as free text in 3 tables | `hospitals`, `profiles`, `booking_requests` |
| LOC-2 | `ilike` queries fail on minor Bangla/English typos | `orchestrator.ts`, `doctorSaabAgents.ts` |
| LOC-3 | Upazila selection not persisted to PatientContext after page reload | `PatientContext.tsx` |
| LOC-4 | Emergency routing hardcoded to Dhaka regardless of patient location | `doctorSaabAgents.ts:333` |
| LOC-5 | `findHospitalsByLocation()` returns empty on upazila mismatch — no fallback | `doctorSaabAgents.ts` |

### Fix Strategy
1. **LOC-1:** Write migration `CREATE TABLE locations (division, district, upazila, UNIQUE constraint)`. Seed from `bangladeshLocations` dictionary in `locations.ts`.
2. **LOC-2:** Add upazila alias normalization. Map common Bangla transliteration variants to canonical form.
3. **LOC-3:** Persist selected district + upazila to `localStorage`. Re-hydrate on PatientContext init.
4. **LOC-4:** Read `patientContext.district` at runtime, pass to `findHospitalsByLocation()` query.
5. **LOC-5:** District-only fallback: if `district+upazila` returns 0 results, retry with district only.

### Pipeline Steps
```
Step 1: Write migration — CREATE TABLE public.locations
Step 2: Write seed script from locations.ts bangladeshLocations dictionary
Step 3: Add FK hospitals.district_id UUID REFERENCES locations(id) (nullable for now)
Step 4: Update findHospitalsByLocation() — add district-only fallback on 0 results
Step 5: Persist district + upazila in PatientContext to localStorage
Step 6: Test: patient in Sylhet → only Sylhet hospitals returned
Step 7: Test: upazila typo → district fallback activates with correct results
```

### Output Report Format
```
## Location Routing Agent Report — [DATE]
Files Modified: [list]
LOC-1: locations table — CREATED / PENDING — [N] rows seeded
LOC-2: ilike fallback — ACTIVE / PENDING
LOC-3: Upazila persistence — FIXED / OPEN
LOC-5: District fallback — ACTIVE — tested with [district]
Hospital query results: Dhaka=[N], Chittagong=[N], Sylhet=[N]
Regressions: [none / list]
```

---

## AGENT 4 — UI/UX Agent

### Role
Owns all patient-facing and dashboard UI: chat interface, results panel, dashboards, design system unification, and missing components.

### Assigned Files
- `src/patient-ui.css`, `src/index.css`, `tailwind.config.ts`
- `src/components/ChatInterface.tsx`
- `src/components/ResultsPanel.tsx`
- `src/pages/DoctorDashboard.tsx`
- `src/pages/PartnerDashboard.tsx`
- `src/pages/AdminDashboard.tsx`
- `src/pages/HomeDashboard.tsx`
- `src/pages/HealthCard.tsx`
- `src/components/BookingModal.tsx`

### Issue List
| ID | Issue | Location | Severity |
|----|-------|----------|----------|
| UI-1 | Sidebar hardcoded `"Dr. Rahim Ahmed"` — real doctorProfile never rendered | `DoctorDashboard.tsx:427–431` | 🔴 |
| UI-2 | Reviews tab = static `REVIEWS_DATA` array — never queries `reviews` table | `DoctorDashboard.tsx` | 🟡 |
| UI-3 | Earnings tab = static `EARNINGS_BARS` — no earnings table exists | `DoctorDashboard.tsx` | 🟡 |
| UI-4 | PartnerDashboard metrics hardcoded ("28 bookings today") | `PartnerDashboard.tsx:420–424` | 🟡 |
| UI-5 | PartnerDashboard TIMELINE = 100% static mock data | `PartnerDashboard.tsx` | 🟡 |
| UI-6 | HealthCard crash: `canvas.toDataString()` does not exist | `HealthCard.tsx:37` | 🔴 |
| UI-7 | HealthCard blood group always `N/A` — hardcoded | `HealthCard.tsx:18` | 🟡 |
| UI-8 | ResultsPanel fallback = 4 hardcoded Dhaka doctors with `Math.random()` fees | `ResultsPanel.tsx:211–214` | 🟡 |
| UI-9 | HomeDashboard stats hardcoded — not real DB counts | `HomeDashboard.tsx` | 🟡 |
| UI-10 | Admin search bar has no `onChange` handler | `AdminDashboard.tsx:447` | 🟡 |
| UI-11 | `CapacityWidget` missing — hospital_resources has schema but no UI | `ResultsPanel.tsx` | 🔴 |

### Fix Strategy
1. **UI-6 (crash — do first):** `HealthCard.tsx:37` change `canvas.toDataString()` → `canvas.toDataURL('image/png')`.
2. **UI-1:** Replace hardcoded name with `{doctorProfile?.full_name}` and `{doctorProfile?.specialization}`.
3. **UI-7:** Add `blood_group` field to `CompleteProfile.tsx`. Read from `profiles.blood_group` in HealthCard.
4. **UI-8:** Remove hardcoded Dhaka fallback. Show Bangla empty state: "আপনার এলাকায় কোনো ডাক্তার পাওয়া যায়নি".
5. **UI-9:** Replace hardcoded stats with `SELECT COUNT(*)` queries via React Query hooks.
6. **UI-10:** Add `onChange` + `useState(searchTerm)` filter to AdminDashboard search input.
7. **UI-11:** Build `src/components/CapacityWidget.tsx` — reads `hospital_resources` by `hospital_id`, shows beds/ICU/oxygen.
8. **UI-2/UI-4/UI-5:** Replace static arrays with real Supabase `useQuery` hooks.
9. Extend `patient-ui.css` CSS vars (`--primary`, `--danger`, `--success`) across dashboard components.

### Pipeline Steps
```
Step 1: Fix HealthCard.tsx:37 — toDataURL() crash fix (IMMEDIATE)
Step 2: Fix DoctorDashboard.tsx:427 — render real doctorProfile fields
Step 3: Build src/components/CapacityWidget.tsx
Step 4: Add CapacityWidget to ResultsPanel HospitalCard + HospitalMapView
Step 5: Wire HomeDashboard to real COUNT queries via useQuery
Step 6: Fix AdminDashboard search onChange handler + filter state
Step 7: Replace PartnerDashboard hardcoded metrics with Supabase COUNT queries
Step 8: Add blood_group to CompleteProfile + wire to HealthCard displayBloodGroup
Step 9: Extend patient-ui.css tokens to dashboard components
```

### Output Report Format
```
## UI/UX Agent Report — [DATE]
Files Modified: [list]
UI-6 Crash Fix: DONE ✅ / PENDING ❌
UI-1 Identity Fix: DONE ✅ — renders [doctor name] from DB
UI-11 CapacityWidget: BUILT ✅ / PENDING — shows beds/ICU/oxygen
UI-9 HomeDashboard Stats: REAL ✅ / HARDCODED ❌
UI-10 Admin Search: FUNCTIONAL ✅ / BROKEN ❌
Hardcoded strings remaining: [N] (target: 0)
Math.random() calls remaining: [N] (target: 0)
New Components Built: [list]
```

---

## AGENT 5 — Database Agent

### Role
Owns Supabase schema integrity, RLS policies, migrations, edge functions, and all data seeding.

### Assigned Files
- `supabase/migrations/` (all 14 existing + new migrations)
- `supabase/functions/chat/index.ts`
- `supabase/functions/send-notification/index.ts`
- `supabase/functions/import-hospitals/index.ts`
- `src/integrations/supabase/types.ts`

### Issue List
| ID | Issue | Location |
|----|-------|----------|
| DB-1 | Duplicate `role` column on `profiles` — ENUM (migration 20260317) conflicts with TEXT (20260330) | Two migrations |
| DB-2 | No normalized locations table — district stored as free text in 3 tables | `hospitals`, `profiles`, `booking_requests` |
| DB-3 | `booking_requests.user_id` has no FK to `auth.users` | Migration 20260311 |
| DB-4 | `leads.user_id` has no FK to `auth.users` | Migration 20260311 |
| DB-5 | `hospital_resources` table exists but is empty — no data, no seed | Migration 20260404 |
| DB-6 | `medical_logs` table orphaned — never referenced in any UI | Migration 20260224 |

### Fix Strategy
1. **DB-1:** New migration: drop ENUM type, drop conflicting column, re-add `role TEXT DEFAULT 'patient' CHECK (role IN ('patient','doctor','admin'))`.
2. **DB-3:** `ALTER TABLE booking_requests ADD CONSTRAINT booking_user_fk FOREIGN KEY (user_id) REFERENCES auth.users(id);`
3. **DB-4:** `ALTER TABLE leads ADD CONSTRAINT leads_user_fk FOREIGN KEY (user_id) REFERENCES auth.users(id);`
4. **DB-5:** Write seed script with 50+ real Bangladesh hospital capacity records for `hospital_resources`.
5. **DB-6:** Comment as `-- DEPRECATED` and schedule drop migration in Phase 2.
6. RLS hardening: Remove `"Anyone can read leads"` policy. Add `user_id = auth.uid()` filter for patient rows.
7. Wire `send-notification` edge function to fire on `booking_requests.status` change to `confirmed`.

### Pipeline Steps
```
Step 1: Write migration — fix DB-1 profiles.role column conflict (drop ENUM, re-add TEXT)
Step 2: Write migration — DB-3 booking_requests user_id FK constraint
Step 3: Write migration — DB-4 leads user_id FK constraint
Step 4: Write migration — CREATE TABLE locations + seed all 64 districts + upazilas
Step 5: Write migration — CREATE TABLE symptom_logs
Step 6: Write seed script — hospital_resources (50+ real records)
Step 7: Harden RLS — restrict leads read to auth.uid() owner or admin role
Step 8: Deploy send-notification — add trigger on booking status UPDATE → confirmed
Step 9: Run supabase db push + verify with supabase db diff (expect clean)
```

### Output Report Format
```
## Database Agent Report — [DATE]
Migrations Written: [list of new migration filenames]
DB-1 Role Column: FIXED ✅ — profiles.role is now single TEXT column
DB-3 Booking FK: ADDED ✅ / PENDING
DB-4 Leads FK: ADDED ✅ / PENDING
hospital_resources: [N] rows seeded
locations table: [N] rows seeded (divisions + districts + upazilas)
symptom_logs: TABLE EXISTS ✅ / PENDING
RLS Test: patient A cannot read patient B bookings ✅/❌
send-notification: WIRED ✅ / PENDING — triggers on [event]
supabase db diff: CLEAN ✅ / CONFLICTS [list]
```

---

## AGENT 6 — Booking Agent

### Role
Owns the end-to-end appointment and lead pipeline: booking form, status transitions, lead tracking, payment gateway, and notification triggers.

### Assigned Files
- `src/components/BookingModal.tsx`
- `src/components/ResultsPanel.tsx` (handleIntentToBook)
- `src/lib/leadTracking.ts`
- `src/pages/Appointments.tsx`
- `src/pages/AdminBookings.tsx`
- `src/pages/PartnerBookings.tsx`
- `src/pages/PaymentGateway.tsx`
- `src/components/ProfileGate.tsx`

### Issue List
| ID | Issue | Location |
|----|-------|----------|
| BK-1 | `booking_requests.user_id` has no FK — cannot JOIN patient to booking | DB-3 dependency |
| BK-2 | Lead value hardcoded at `200 BDT` — no dynamic pricing | `leadTracking.ts` |
| BK-3 | No booking confirmation notification sent to patient or doctor | `send-notification` never called |
| BK-4 | PaymentGateway is sandbox-only — bKash/SSLCommerz not live | `PaymentGateway.tsx` |
| BK-5 | `/partner-bookings` + `/admin/bookings` have ProtectedRoute but no role check | `App.tsx:52,56` |
| BK-6 | No post-appointment review prompt shown to patient | `Appointments.tsx` |

### Fix Strategy
1. **BK-1:** Depends on DB-3. After FK added, update `Appointments.tsx` query to filter `user_id = auth.uid()`.
2. **BK-2:** Add `calculateLeadValue(serviceType, specialty)` function — returns 100–500 BDT based on tier.
3. **BK-3:** After booking status → `confirmed`, call `send-notification` edge function with doctor + patient details.
4. **BK-5:** Add role guards: `/partner-bookings` requires `role = 'doctor'`, `/admin/bookings` requires `role = 'admin'`.
5. **BK-6:** When booking status → `completed`, show `ReviewForm` prompt modal in `Appointments.tsx`.

### Pipeline Steps
```
Step 1: Confirm DB-3 FK fix is deployed (blocking dependency)
Step 2: Add role guards to /partner-bookings and /admin/bookings in App.tsx
Step 3: Add calculateLeadValue() to leadTracking.ts — dynamic BDT pricing
Step 4: Wire send-notification call on booking status → 'confirmed' transition
Step 5: Add ReviewForm prompt to Appointments.tsx on completed bookings
Step 6: E2E test: INSERT booking → doctor accepts → patient sees 'confirmed' → notification sent
```

### Output Report Format
```
## Booking Agent Report — [DATE]
Files Modified: [list]
BK-1 FK Dependency: RESOLVED ✅ / WAITING ON DB AGENT
BK-2 Lead Value: DYNAMIC ✅ / HARDCODED — values: [serviceType → BDT range]
BK-3 Notification: WIRED ✅ / PENDING — send-notification called on [event]
BK-5 Role Guards: ADDED ✅ — /partner-bookings=[role], /admin/bookings=[role]
BK-6 Review Prompt: BUILT ✅ / PENDING
E2E Test: PASS ✅ / FAIL ❌ — [N] bookings tested end-to-end
```

---

## AGENT 7 — Health Card Agent

### Role
Owns the Digital Health Card feature: crash fix, blood group data, PNG export, QR code identity, and medical history display.

### Assigned Files
- `src/pages/HealthCard.tsx`
- `src/pages/CompleteProfile.tsx`
- `src/lib/healthMemory.ts`
- `src/lib/medicalRecords.ts`
- `src/hooks/useAuth.tsx`

### Issue List
| ID | Issue | Location | Severity |
|----|-------|----------|----------|
| HC-1 | `canvas.toDataString()` does not exist — crashes entire page on download | `HealthCard.tsx:37` | 🔴 |
| HC-2 | Blood group always displays `N/A` — `displayBloodGroup` hardcoded | `HealthCard.tsx:18` | 🟡 |
| HC-3 | `blood_group` field missing from `CompleteProfile.tsx` — never saved to DB | `CompleteProfile.tsx` | 🟡 |
| HC-4 | Health Card has no QR code for identity verification | `HealthCard.tsx` | 🟢 |
| HC-5 | Health Card does not show medical history summary | `HealthCard.tsx` | 🟢 |

### Fix Strategy
1. **HC-1 (IMMEDIATE):** `HealthCard.tsx:37` — change `canvas.toDataString()` to `canvas.toDataURL('image/png')`. Wrap in try/catch. Trigger `<a>` download programmatically.
2. **HC-2 + HC-3:** Add `blood_group` select (A+/A-/B+/B-/AB+/AB-/O+/O-) to `CompleteProfile.tsx`. Save to `profiles.blood_group`. Read in HealthCard via profile hook.
3. **HC-4:** Use `qrcode` npm package — encode `user_id + name + blood_group` as QR. Display on card face.
4. **HC-5:** Query last 3 `medical_records` of type `summary`. Display as "সাম্প্রতিক পরামর্শ" section on card.

### Pipeline Steps
```
Step 1: Fix HealthCard.tsx:37 — canvas.toDataURL('image/png') (IMMEDIATE — Phase 1 gate)
Step 2: Add blood_group selector to CompleteProfile.tsx form
Step 3: Wire profiles.blood_group → HealthCard displayBloodGroup field
Step 4: Add try/catch around canvas export + Bangla error toast on failure
Step 5: Install qrcode package + build QR code component for health card identity
Step 6: Query medical_records type='summary' ORDER BY created_at DESC LIMIT 3 → show on card
Step 7: Test: download produces valid .png file (≥ 1KB, no crash, correct patient name)
```

### Output Report Format
```
## Health Card Agent Report — [DATE]
Files Modified: [list]
HC-1 Crash Fix: DONE ✅ — canvas.toDataURL() verified, no crash
HC-2 Blood Group Display: REAL ✅ / HARDCODED ❌ — reads from profiles.blood_group
HC-3 Blood Group Input: ADDED ✅ to CompleteProfile / PENDING ❌
HC-4 QR Code: BUILT ✅ / PENDING — encodes [user_id + name + blood_group]
HC-5 Medical History: SHOWING ✅ / PENDING — [N] records displayed
Download Test: PASS ✅ — file size [N]KB, format PNG, patient name correct
```

---

## AGENT EXECUTION ORDER

### Sprint 1 — Phase 1: Security & Crash Fixes (Week 1)
```
Priority 1: Database Agent    — DB-1, DB-3, DB-4 migrations (unblocks Booking Agent)
Priority 2: Health Card Agent — HC-1 crash fix (HealthCard.tsx:37 toDataURL)
Priority 3: UI/UX Agent      — UI-1 identity fix (Dr. Rahim Ahmed → real name)
Priority 4: Master Controller — Apply SEC-1 to SEC-6 route guards in App.tsx
```

### Sprint 2 — Phase 2: Data Integrity (Week 2–4)
```
Priority 1: Location Routing Agent — locations table, hospital fallback logic
Priority 2: AI Triage Agent        — CANONICAL_SPECIALTY, remove Math.random()
Priority 3: Database Agent         — hospital_resources seed, RLS hardening
Priority 4: UI/UX Agent            — CapacityWidget, real stats, admin search fix
Priority 5: Booking Agent          — role guards, notification wiring, review prompt
```

### Sprint 3 — Phase 3: Feature Completeness (Month 2)
```
All Agents: PrescriptionWriter, ReviewForm, ResourceUpdatePanel, QR Health Card, WebRTC telemedicine
```

---

## INTER-AGENT DEPENDENCIES

| Agent | Depends On | For |
|-------|-----------|-----|
| Booking Agent | Database Agent (DB-3) | user_id FK before JOIN queries work |
| UI/UX Agent | Database Agent (DB-5) | hospital_resources data before CapacityWidget shows real values |
| AI Triage Agent | Location Routing Agent (LOC-1) | normalized locations before accurate hospital queries |
| Health Card Agent | UI/UX Agent (CompleteProfile blood_group) | blood_group input before card can display it |
| All Agents | Master Controller | sprint sequencing + file conflict resolution |

---

## PHASE 1 GATE — All Must Be ✅ Before Phase 2 Starts

```
SECURITY
  [ ] /doctor-dashboard  — ProtectedRoute with roles=['doctor','admin']
  [ ] /partner-dashboard — ProtectedRoute with roles=['doctor','admin']
  [ ] /kazi              — ProtectedRoute with roles=['admin']
  [ ] /partner-bookings  — role enforcement added
  [ ] /admin/bookings    — role enforcement added
  [ ] DoctorDashboard  logout: await supabase.auth.signOut() called
  [ ] PartnerDashboard logout: await supabase.auth.signOut() called

CRASH FIXES
  [ ] HealthCard.tsx:37 — canvas.toDataURL() — download works without crash
  [ ] DoctorDashboard shows real doctor name (not "Dr. Rahim Ahmed")

DATABASE
  [ ] profiles.role   — single TEXT column, ENUM dropped
  [ ] booking_requests.user_id — FK to auth.users added
  [ ] leads.user_id           — FK to auth.users added
```

---

*AGENT_SYSTEM.md · DaktarSab Digital Healthcare Platform · 2026-04-24*
*References: PROJECT_SUMMARY.md — Sections 3 (Gap Analysis), 5 (Core Modules), 6 (DB), 11 (Roadmap), 12 (Agent Protocol), 13 (Checklist), 14 (Scorecard)*
