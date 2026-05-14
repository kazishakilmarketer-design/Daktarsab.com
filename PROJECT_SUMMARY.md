# 🏥 PROJECT_SUMMARY.md — DaktarSab Digital Healthcare Platform

> **Generated:** 2026-04-24 · **Auditor:** Antigravity AI — Senior System Architect  
> **Stack:** React 18 + TypeScript + Vite · Supabase (PostgreSQL + Edge Functions) · Gemini Pro AI · Firebase Hosting  
> **Scope:** 25 pages · 20+ components · 11 AI modules · 14 SQL migrations · 5 edge functions

---

## 1. 🧾 PROJECT OVERVIEW

### What DaktarSab Is

DaktarSab (ডাক্তার সাব) is a Bangladesh-based Digital Healthcare Platform that gives patients instant, AI-powered medical guidance in **Bangla and English** — then routes them to real doctors, hospitals, ambulances, and diagnostic centers near their location.

### Target Users

| User Type | Entry Point | Core Need |
|-----------|------------|-----------|
| **Patients** | `/chat` AI Symptom Checker | Understand symptoms, get specialist + hospital recommendation |
| **Doctors** | `/doctor-dashboard` | Manage appointment queue, view patient bookings |
| **Hospital Partners** | `/partner-dashboard` | Receive patient leads, manage facility |
| **Admins** | `/kazi` | Approve partners, manage leads, oversee all bookings |

### Core Mission

Democratize quality healthcare guidance for all 170M+ Bangladeshis — regardless of location or income — using AI triage in native Bangla, with affordable routing to the right specialist.

### Current MVP Capabilities (What Actually Works)

- ✅ AI chat triage (Gemini Pro + local fallback) in Bangla + English
- ✅ 500+ symptom database with severity classification (3 levels)
- ✅ Emergency detection — bypasses Gemini, returns ambulance trigger immediately
- ✅ Supabase booking pipeline (Patient → Doctor accept/reject → Admin view)
- ✅ Doctor/Hospital/Partner directory with real Supabase data
- ✅ Admin panel with leads + bookings + partner approval + billing ledger
- ✅ Auth system: Google OAuth + Email/Password + profile completion gate
- ✅ RBAC via `profiles.role` ('patient' | 'doctor' | 'admin')
- ✅ Digital Health Card (display works; download crashes)
- ✅ Lead tracking on every AI booking intent → `leads` table
- ✅ Partner self-registration → admin approval → DB trigger auto-creates doctor record + flips role

---

## 2. ⚙️ CURRENT SYSTEM ARCHITECTURE

### Frontend — React 18 + Vite + TypeScript

#### Application Shell

```
QueryClientProvider (React Query)
  └── AuthProvider (useAuth hook + Supabase session)
        └── PatientProvider (profile, treatmentTier, location context)
              └── BrowserRouter
                    └── Routes (23 routes)
```

#### Route Map

| Route | Guard | Component | Status |
|-------|-------|-----------|--------|
| `/` | – | Redirect → `/home` | ✅ |
| `/auth` | Public | `Auth.tsx` | ✅ |
| `/update-password` | Public | `UpdatePassword.tsx` | ✅ |
| `/complete-profile` | Public | `CompleteProfile.tsx` | ✅ |
| `/home` | ProtectedRoute | `HomeDashboard.tsx` | ✅ |
| `/chat` | ProtectedRoute | `Index.tsx` → `ChatInterface` | ✅ |
| `/doctors` | ProtectedRoute | `Doctors.tsx` | ✅ |
| `/hospital-map` | ProtectedRoute | `HospitalMap.tsx` | ✅ |
| `/appointments` | ProtectedRoute | `Appointments.tsx` | ✅ |
| `/health-card` | ProtectedRoute | `HealthCard.tsx` | ⚠️ Download crash |
| `/prescription` | ProtectedRoute | `Prescription.tsx` | ✅ |
| `/reports` | ProtectedRoute | `TestReports.tsx` | ✅ |
| `/profile` | ProtectedRoute | `PatientProfile.tsx` | ✅ |
| `/payment` | ProtectedRoute | `PaymentGateway.tsx` | ⚠️ Sandbox only |
| `/join-as-partner` | Public | `JoinAsPartner.tsx` | ✅ |
| `/doctor-dashboard` | **NO GUARD** | `DoctorDashboard.tsx` | 🔴 Security gap |
| `/partner-dashboard` | **NO GUARD** | `PartnerDashboard.tsx` | 🔴 Security gap |
| `/partner-bookings` | ProtectedRoute (no role) | `PartnerBookings.tsx` | ⚠️ |
| `/kazi` | Internal check only | `AdminDashboard.tsx` | ⚠️ No ProtectedRoute |
| `/admin/bookings` | ProtectedRoute (no role) | `AdminBookings.tsx` | ⚠️ |
| `/about` | Public | `AboutUs.tsx` | ✅ |
| `/features` | Public | `Features.tsx` | ✅ |
| `/import` | ProtectedRoute | `ImportHospitals.tsx` | ⚠️ Dev tool |

**Total: 23 routes · Properly guarded: 13 · Security gaps: 5**

#### Key Components

| Component | File | Purpose |
|-----------|------|---------|
| Chat UI | `ChatInterface.tsx` | AI conversation, SSE streaming reader |
| Results | `ResultsPanel.tsx` | Doctor/Hospital result cards + booking CTA |
| Booking | `BookingModal.tsx` | Patient appointment request form |
| Map | `HospitalMapView.tsx` | Leaflet map of real hospitals |
| Location | `DistrictSelector.tsx` | Division → District → Upazila cascade |
| Gate | `ProfileGate.tsx` | Blocks booking if profile incomplete |
| Nav | `BottomNav.tsx` | Mobile bottom navigation |

#### UI System — Two Conflicting Layers

| Layer | Files | Used By |
|-------|-------|---------|
| **New (card-based)** | `patient-ui.css` (14KB) + CSS vars (`--g0..--g9`, `--amber`, `--bg`) | `/chat`, ResultsPanel, BottomNav |
| **Old (Tailwind utilities)** | `tailwind.config.ts` + Tailwind classes | All dashboards, Auth, HomeDashboard |

> ⚠️ No unified design token system. Components from the two layers clash visually in some flows.

---

### Backend — Supabase

#### Edge Functions (5 deployed)

| Function | Purpose | Called From UI? |
|----------|---------|-----------------|
| `chat` | Gemini Pro SSE streaming (main AI endpoint) | ✅ `aiChat.ts` |
| `gemini-chat` | Secondary Gemini endpoint (legacy) | ❌ Not called |
| `import-doctors` | Admin CSV import utility | ❌ No UI |
| `import-hospitals` | Hospital data importer | ⚠️ `/import` (unguarded) |
| `send-notification` | Push/email notification | ❌ Built, never called |

#### Authentication

```
Supabase Auth (Email/Password + Google OAuth)
  → on sign-in: checks profiles.full_name + phone
  → if missing: redirect to /complete-profile
  → on complete: checks profiles.role
  → routes doctor → /doctor-dashboard
  → routes admin → /kazi
  → routes patient → /home
```

---

### AI System Architecture

#### Layer 1 — AI_Engine.ts (Local Triage, runs on EVERY message)

- Loads 500+ symptom entries from `symptomDb.ts`
- Normalizes input: lowercase + remove Bangla diacritics + strip punctuation
- Scores each SYMPTOM_DB entry: exact match = +100, partial = +`kw.length`, emergency tag = +50
- Emergency regex heuristics as fallback (Bangla patterns for chest pain, breathlessness, fainting)
- Duration override: symptoms ≥ 4 days → `mild` upgrades to `moderate`
- **Output:** `EngineResult { isEmergency, severity, specialty, routingAdvice, bookingTrigger }`

#### Layer 2 — aiChat.ts (Gemini Streaming)

```
if (engineResult.isEmergency) → SKIP GEMINI → return hardcoded emergency JSON
else → POST to /functions/v1/chat (Gemini Pro, 8-second timeout)
  → read SSE stream line-by-line (data: {...} format)
  → on failure/401/timeout → fallback to runDoctorSaabAgents()
```

#### Layer 3 — orchestrator.ts (Enrichment)

```
streamChat() → raw AI response string
  → parseAiResponse() → extract JSON from Gemini markdown
  → if structured diagnosis:
      findHospitalsByLocation(district, upazila)  [Supabase ilike]
      queryDoctors(specialty, district)            [Supabase query]
      estimateCost(tests, monthlyIncome)           [local 3-tier pricing]
  → merge → final AiMedicalResponse
  → saveConsultationToHistory() → INSERT medical_records
```

#### Layer 4 — doctorSaabAgents.ts (Local Fallback, no Gemini needed)

- `isEmergencyMessage()` — keyword-set lookup from SYMPTOM_DB emergency entries
- `triageSymptoms()` — 14-rule scoring triage → specialist mapping
- `estimateCost()` — 3-tier pricing (বাজেট / মধ্যম / প্রিমিয়াম) for 20+ test types
- `suggestTests()` — specialty → recommended tests list
- `findHospitalsByLocation()` — Supabase strict district + upazila filter (no fallback)

---

## 3. 🚨 GAP ANALYSIS (CRITICAL)

### 🤖 AI Issues

| ID | Issue | Location | Impact |
|----|-------|----------|--------|
| AI-1 | **Dual specialist mapping** — `SYMPTOM_DB.specialty` strings differ from `TRIAGE_RULES[].specialist` strings. Same symptom can route to different specialists depending on path taken | `AI_Engine.ts` vs `doctorSaabAgents.ts` | Inconsistent routing |
| AI-2 | **Emergency hospitals hardcoded to Dhaka** — even for patients in Chittagong, Sylhet, Rajshahi | `doctorSaabAgents.ts:333–334` | Wrong emergency routing |
| AI-3 | **Doctor fallback uses `Math.random()` for rating and fee** — no real data | `doctorSaabAgents.ts:354–356` + `ResultsPanel.tsx:253–254` | Fake data in production |
| AI-4 | **No AI session persistence** — `conversationHistory` truncated to last 6 messages; full reset on page reload | `ChatInterface.tsx` | Lost consultation context |
| AI-5 | **Emergency over-triggering** — `shortness_of_breath` always = emergency even when mild | `symptomDb.ts` + `AI_Engine.ts:68` | Unnecessary 🚨 alerts |
| AI-6 | **`bilingualTranslator.ts` output injected into Gemini system prompt** without sanitization | `aiChat.ts:97` | Prompt injection risk |

### 🗄️ Database Issues

| ID | Issue | Location | Impact |
|----|-------|----------|--------|
| DB-1 | **Duplicate `role` column on `profiles`** — Migration 20260317 adds ENUM `user_role`, migration 20260330 adds TEXT `role` — both exist | Two migrations | Schema conflict, unpredictable behavior |
| DB-2 | **No normalized locations table** — district/upazila stored as free-text in three separate tables | `hospitals`, `profiles`, `booking_requests` | `ilike` fails on minor typos |
| DB-3 | **`booking_requests.user_id` has no FK** to `auth.users` | Migration 20260311 | Cannot JOIN patient to booking |
| DB-4 | **`leads.user_id` has no FK** to `auth.users` | Migration 20260311 | Orphaned lead records |
| DB-5 | **`hospital_resources` table exists but is empty** — migration created 2026-04-04, no seed data, no UI | Migration 20260404 | Feature built but dead |
| DB-6 | **`medical_logs` table orphaned** — created in first migration, never referenced in any UI | Migration 20260224 | Dead schema weight |

### 🎨 UI Issues

| ID | Issue | Location | Severity |
|----|-------|----------|----------|
| UI-1 | **DoctorDashboard sidebar hardcoded `"Dr. Rahim Ahmed"`** — `doctorProfile` state loaded but never rendered in sidebar | `DoctorDashboard.tsx:427–431` | 🔴 Every doctor sees wrong identity |
| UI-2 | **DoctorDashboard Reviews tab = static `REVIEWS_DATA` array** — `reviews` table never queried | `DoctorDashboard.tsx` | 🟡 Fake reviews |
| UI-3 | **DoctorDashboard Earnings = static `EARNINGS_BARS`** — No earnings table exists | `DoctorDashboard.tsx` | 🟡 Fake earnings |
| UI-4 | **PartnerDashboard metrics hardcoded** — "28 bookings today", "12 doctors available" | `PartnerDashboard.tsx:420–424` | 🟡 Fake metrics |
| UI-5 | **PartnerDashboard TIMELINE = 100% static mock data** | `PartnerDashboard.tsx` | 🟡 Fake schedule |
| UI-6 | **HealthCard download crash** — `canvas.toDataString()` called (method does not exist) | `HealthCard.tsx:37` | 🔴 Page crash |
| UI-7 | **HealthCard blood group always `N/A`** — `displayBloodGroup` hardcoded | `HealthCard.tsx:18` | 🟡 Wrong health card |
| UI-8 | **ResultsPanel fallback = 4 hardcoded Dhaka doctors** with `Math.random()` fees/ratings | `ResultsPanel.tsx:211–214` | 🟡 Fake directory |
| UI-9 | **HomeDashboard stats hardcoded** — `১২,৭৫০+` consultations, `২,২৩২+` doctors | `HomeDashboard.tsx` | 🟡 Not real counts |
| UI-10 | **Admin search bar non-functional** — no `onChange` handler | `AdminDashboard.tsx:447` | 🟡 Broken feature |
| UI-11 | **`hospital_resources` CapacityWidget missing** — table has data schema, no UI component | `ResultsPanel.tsx`, `HospitalMapView.tsx` | 🔴 PMO requirement |

### 🔐 Security Issues

| ID | Issue | File:Line | Severity |
|----|-------|-----------|----------|
| SEC-1 | `/doctor-dashboard` has **no `ProtectedRoute`** — any URL visitor enters | `App.tsx:53` | 🔴 Critical |
| SEC-2 | `/partner-dashboard` has **no `ProtectedRoute`** | `App.tsx:54` | 🔴 Critical |
| SEC-3 | `/kazi` (Admin) has **no `ProtectedRoute`** — only internal `role` check | `App.tsx:55` | 🔴 Critical |
| SEC-4 | **DoctorDashboard logout does not call `supabase.auth.signOut()`** — only clears local state | `DoctorDashboard.tsx:466–469` | 🔴 Session persists after logout |
| SEC-5 | **PartnerDashboard logout same bug** | `PartnerDashboard.tsx:395` | 🔴 Session persists |
| SEC-6 | `/partner-bookings` + `/admin/bookings` have ProtectedRoute but **no role enforcement** — any patient accesses | `App.tsx:52,56` | 🟠 High |

---

## 4. 🏗️ TARGET ARCHITECTURE (CLEAN SYSTEM)

```
┌──────────────────────────────────────────────────────────────┐
│                  PATIENT BROWSER (PWA)                        │
│  React 18 + TypeScript + Vite | Unified CSS Design System     │
│                                                              │
│  Chat v2 ──► AI Engine ──► Results Panel ──► Booking Engine  │
│  (default)   (local)       (real DB data)   (leads + appts)  │
└──────────────────────────────┬───────────────────────────────┘
                               │ HTTPS / REST / SSE / Realtime
┌──────────────────────────────▼───────────────────────────────┐
│                    SUPABASE BACKEND                           │
│                                                              │
│  Edge Functions          PostgreSQL (15 tables)   Auth       │
│  ├── /chat (Gemini SSE)  ├── profiles             ├── Email  │
│  ├── /send-notification  ├── doctors              ├── Google │
│  ├── /import-hospitals   ├── hospitals            └── RBAC   │
│  └── /import-doctors     ├── hospital_resources             │
│                          ├── booking_requests               │
│                          ├── leads                          │
│                          ├── medical_records                │
│                          ├── prescriptions                  │
│                          ├── reviews                        │
│                          ├── partner_registrations          │
│                          ├── locations (NEW)                │
│                          └── symptom_logs (NEW)             │
└──────────────────────────────┬───────────────────────────────┘
                               │ Gemini API (Google AI)
┌──────────────────────────────▼───────────────────────────────┐
│              GOOGLE GEMINI PRO (AI Layer)                     │
│  System prompt: Dr. Saab persona + structured JSON schema    │
│  Fallback: DoctorSaab multi-agent system (local, no API)     │
└──────────────────────────────────────────────────────────────┘
```

### Clean Frontend Module Structure (Target)

```
src/
├── pages/                   ← one file per route
├── components/
│   ├── chat/                ← ChatInterface, VoiceInput, ChatBubble
│   ├── results/             ← ResultsPanel, DoctorCard, HospitalCard, CapacityWidget
│   ├── booking/             ← BookingModal, AppointmentStatus, LeadGate
│   ├── dashboard/           ← DoctorDashboard, PartnerDashboard, AdminDashboard
│   ├── health/              ← HealthCard, PrescriptionWriter, MedicalRecord
│   ├── ui/                  ← shadcn components (button, card, dialog, etc.)
│   └── layouts/             ← PatientLayout, DashboardLayout
├── lib/
│   ├── ai/                  ← AI_Engine, aiChat, orchestrator, symptomDb
│   ├── location/            ← locations, districtUtils (normalized)
│   ├── booking/             ← bookingService, leadTracking
│   └── health/              ← healthMemory, medicalRecords
├── hooks/                   ← useAuth, usePatient, useDoctors, useBookings
├── contexts/                ← AuthContext, PatientContext
└── integrations/            ← supabase client + generated types
```

---

## 5. 🧬 CORE MODULES

| Module | Files | Status | Priority Fix |
|--------|-------|--------|-------------|
| **AI Symptom Engine** | `AI_Engine.ts`, `aiChat.ts`, `orchestrator.ts`, `symptomDb.ts` | ⚠️ Working but dual-mapping bug | Unify specialist map |
| **Location Engine** | `locations.ts`, `DistrictSelector.tsx` | ⚠️ Works, upazila persistence broken | Normalize to DB table |
| **Booking Engine** | `BookingModal.tsx`, `ResultsPanel.tsx`, `leadTracking.ts` | ✅ Fully working end-to-end | Add user_id FK |
| **Doctor Dashboard** | `DoctorDashboard.tsx` | 🔴 Identity fake, logout bug | SEC-4 + UI-1 fix |
| **Partner Dashboard** | `PartnerDashboard.tsx`, `PartnerBookings.tsx` | 🔴 Metrics fake, logout bug | SEC-5 + real queries |
| **Admin Panel** | `AdminDashboard.tsx`, `AdminBookings.tsx` | ⚠️ 75% real, search broken | SEC-3 fix + search |
| **Partner Registration** | `JoinAsPartner.tsx` + DB trigger | ✅ Fully working | — |
| **Digital Health Card** | `HealthCard.tsx` | 🔴 Download crashes | `toDataURL()` fix |
| **Hospital Resources** | `hospital_resources` table | 🔴 Table exists, no UI | Build CapacityWidget |
| **Prescription System** | `Prescription.tsx` + DB schema | ⚠️ Schema ready, no writer UI | Build PrescriptionWriter |
| **Universal Health Record** | `healthMemory.ts`, `medical_records` table | ⚠️ Write works, read partial | Connect to UI |
| **Notification System** | `send-notification` edge fn | ❌ Built, never called | Wire to booking events |

---

## 6. 🗄️ DATABASE STRUCTURE (FINAL)

### Relationships Overview

```
auth.users (Supabase)
  ├── profiles          (1:1 via user_id UNIQUE)
  ├── medical_records   (1:N via patient_id)
  ├── prescriptions     (1:N via patient_id + doctor_id)
  ├── reviews           (1:N via reviewer_id)
  ├── booking_requests  (1:N via user_id)  ← FK MISSING, must add
  ├── leads             (1:N via user_id)  ← FK MISSING, must add
  └── doctors           (1:1 via user_id, optional)

hospitals
  └── hospital_resources (1:1 via hospital_id)

partner_registrations
  └── [DB trigger on status='approved']
        ├── INSERT into doctors (upsert on email)
        └── UPDATE profiles.role = 'doctor'
```

### Table Definitions

#### `profiles`
```sql
id              UUID PK DEFAULT gen_random_uuid()
user_id         UUID REFERENCES auth.users(id) UNIQUE   -- login link
local_id        TEXT                                     -- guest tracking
name            TEXT NOT NULL DEFAULT ''
full_name       TEXT                                     -- from CompleteProfile
phone           TEXT
age             TEXT
gender          TEXT
location        TEXT                                     -- district (free text, no FK)
monthly_income  INTEGER NOT NULL DEFAULT 0
blood_group     TEXT CHECK IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')
role            TEXT DEFAULT 'patient' CHECK IN ('patient','doctor','admin')
-- ⚠️ CONFLICT: also has `role user_role ENUM` from migration 20260317
is_active       BOOLEAN NOT NULL DEFAULT false
created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
```

#### `doctors`
```sql
id               UUID PK
full_name        TEXT
specialization   TEXT
division         TEXT                          -- free text (no FK to locations)
phone            TEXT
email            TEXT UNIQUE                   -- ON CONFLICT target for trigger
bmdc_no          TEXT
is_verified      BOOLEAN DEFAULT false
is_available     BOOLEAN DEFAULT true
fee_in_person    INTEGER DEFAULT 0
fee_online       INTEGER DEFAULT 0
rating           NUMERIC(3,1) DEFAULT 0
review_count     INTEGER DEFAULT 0
experience_years INTEGER DEFAULT 0
availability_note TEXT
bio              TEXT
languages        TEXT[] DEFAULT ARRAY['বাংলা']
telemedicine     BOOLEAN DEFAULT false
user_id          UUID REFERENCES auth.users(id)
created_at       TIMESTAMPTZ
updated_at       TIMESTAMPTZ
```

#### `hospitals`
```sql
id          UUID PK
name        TEXT
type        TEXT                              -- 'সরকারি' | 'বেসরকারি'
district    TEXT                              -- free text
upazila     TEXT                              -- free text
phone       TEXT
address     TEXT
is_verified BOOLEAN DEFAULT false
created_at  TIMESTAMPTZ
```

#### `hospital_resources` ✅ Schema ready — ❌ No data, no UI
```sql
id                   UUID PK
hospital_id          UUID REFERENCES hospitals(id) ON DELETE CASCADE
hospital_name        TEXT NOT NULL DEFAULT ''
beds_available       INTEGER NOT NULL DEFAULT 0
icu_beds_available   INTEGER NOT NULL DEFAULT 0
oxygen_status        TEXT NOT NULL DEFAULT 'Medium' CHECK IN ('High','Medium','Low')
updated_by           UUID REFERENCES auth.users(id)
last_updated_at      TIMESTAMPTZ DEFAULT now()
created_at           TIMESTAMPTZ DEFAULT now()
```

#### `booking_requests`
```sql
id             UUID PK
user_id        UUID                           -- ⚠️ NO FK — must add REFERENCES auth.users(id)
user_name      TEXT NOT NULL
user_phone     TEXT NOT NULL
service_type   TEXT NOT NULL                  -- 'doctor'|'hospital'|'ambulance'|'diagnostic'
provider_name  TEXT NOT NULL
preferred_date TEXT
preferred_time TEXT
notes          TEXT
status         TEXT DEFAULT 'new'             -- 'new'|'confirmed'|'completed'|'cancelled'
created_at     TIMESTAMPTZ
```

#### `leads`
```sql
id               UUID PK
user_id          UUID                        -- ⚠️ NO FK — must add REFERENCES auth.users(id)
type             TEXT                        -- 'appointment'|'inquiry'|'emergency'
doctor_name      TEXT
hospital_name    TEXT
specialty        TEXT
district         TEXT
symptom          TEXT
condition        TEXT
source           TEXT                        -- 'ai_recommendation'|'manual'
patient_name     TEXT
phone            TEXT
status           TEXT DEFAULT 'pending'      -- 'pending'|'Converted'
assigned_partner TEXT
lead_value       INTEGER DEFAULT 200
inquiry_details  TEXT
created_at       TIMESTAMPTZ
```

#### `medical_records` (UHR)
```sql
id           UUID PK
patient_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE
type         TEXT CHECK IN ('summary','prescription','record','lab_report')
content_data JSONB                           -- structured consultation data
file_url     TEXT                            -- uploaded lab reports
doctor_id    UUID REFERENCES auth.users(id)
created_at   TIMESTAMPTZ
```

#### `prescriptions`
```sql
id         UUID PK
doctor_id  UUID REFERENCES auth.users(id) ON DELETE CASCADE
patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
rx_json    JSONB NOT NULL                    -- { diagnosis, medicines: [...], notes }
pdf_url    TEXT
created_at TIMESTAMPTZ
```

#### `reviews`
```sql
id            UUID PK
reviewer_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE
provider_id   UUID NOT NULL                  -- doctor UUID or hospital UUID
provider_type TEXT NOT NULL CHECK IN ('doctor','hospital')
rating        INTEGER NOT NULL CHECK (1-5)
comment       TEXT
created_at    TIMESTAMPTZ
```

#### `partner_registrations`
```sql
id               UUID PK
name             TEXT
full_name        TEXT
specialty        TEXT
division         TEXT
district         TEXT
phone            TEXT
email            TEXT
bmdc_no          TEXT
fee_in_person    INTEGER
fee_online       INTEGER
experience_years INTEGER
bio              TEXT
status           TEXT DEFAULT 'pending' CHECK IN ('pending','approved','rejected')
reviewed_at      TIMESTAMPTZ
created_at       TIMESTAMPTZ
```

### Target: New Tables to Create

#### `locations` — Normalized location master
```sql
CREATE TABLE public.locations (
  id        UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  division  TEXT NOT NULL,
  district  TEXT NOT NULL,
  upazila   TEXT NOT NULL,
  UNIQUE(division, district, upazila)
);
-- Populate from locations.ts (bangladeshLocations dictionary)
-- Then add FK: hospitals.district_id UUID REFERENCES locations(id)
```

#### `symptom_logs` — AI analytics and QA
```sql
CREATE TABLE public.symptom_logs (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id            UUID REFERENCES auth.users(id),
  raw_message        TEXT,
  detected_severity  TEXT,            -- 'emergency'|'moderate'|'mild'
  detected_specialty TEXT,
  engine_score       NUMERIC,
  gemini_used        BOOLEAN,
  session_id         TEXT,
  created_at         TIMESTAMPTZ DEFAULT now()
);
```

---

## 7. 🔁 DATA FLOW

### Full Patient Journey (End-to-End)

```
[Entry]
User → / → redirect → /home (ProtectedRoute)
  ├── Not logged in → /auth (email/Google OAuth)
  ├── Logged in, no profile → /complete-profile
  │     └── saves: full_name, phone, age, gender, location, monthly_income, blood_group
  └── Profile complete → /home → click "AI পরামর্শ নিন"

[Chat]
/chat → ChatInterface.tsx
  → Patient types symptom (Bangla or English)
  → PatientContext provides: age, gender, district, upazila, income

  [AI Layer 1 — AI_Engine.ts — LOCAL, always runs]
    → Normalize input text (lowercase + strip diacritics)
    → Score 500+ SYMPTOM_DB entries
    → If isEmergency → set bookingTrigger = 'ambulance'

  [Emergency Branch]
    → Skip Gemini entirely
    → Return structured emergency JSON → ResultsPanel shows 🚨 UI
    → "অ্যাম্বুলেন্স কল করুন" button

  [Normal Branch]
    → aiChat.ts: POST to Supabase /functions/v1/chat
    → Gemini Pro streams SSE response (tries to JSON in markdown)
    → Fallback if fails: runDoctorSaabAgents() (local, no API needed)

  [Orchestrator — orchestrator.ts]
    → parseAiResponse() → extract structured JSON
    → findHospitalsByLocation(district, upazila) → Supabase ilike
    → queryDoctors(specialty, district) → Supabase query
    → estimateCost(tests, monthlyIncome) → tiered BDT pricing
    → saveConsultationToHistory() → INSERT medical_records (summary type)

[Results]
ResultsPanel.tsx
  → Shows: condition badge, severity level, immediateAdvice
  → Shows: Doctor cards (real Supabase data or mock fallback)
  → Shows: Hospital cards (real Supabase data or empty)
  → Shows: Test list with income-tiered cost estimates
  → Bengali TTS button (SpeechSynthesisUtterance bn-BD)
  → "বুক করুন" → handleIntentToBook()

[Booking]
handleIntentToBook()
  ├── if !user → /auth
  ├── if !hasCompletedProfile → ProfileGate modal
  └── else → AppointmentModal (patientName + phone)
        → Submit: UPDATE leads or INSERT new lead record
        → trackLead() → leads table
        → Toast: "প্রতিনিধি কল করবেন"

[Admin View]
/kazi → AdminDashboard.tsx
  → Leads tab: all lead records, assign to partner
  → Bookings tab: all booking_requests
  → Partner Approvals: partner_registrations (approve → DB trigger fires)
  → Billing: derived from assigned_partner field count

[Doctor View]
/doctor-dashboard → DoctorDashboard.tsx
  → Bookings queue: booking_requests filtered by provider_name
  → Accept/Reject/Complete → UPDATE booking_requests.status
  → Realtime: Supabase postgres_changes channel

[Patient Follow-up]
/appointments → Appointments.tsx
  → reads booking_requests WHERE user_id = auth.uid()
  → shows status badge (new / confirmed / completed / cancelled)
```

---

## 8. 🎨 UI/UX SYSTEM

### Current Design Tokens (`patient-ui.css`)

```css
--g0: #F8F9FA   /* lightest gray — card backgrounds */
--g1: #F1F3F5
--g5: #495057   /* body text */
--g7: #212529   /* headings */
--g9: #101213   /* dark */
--amber: #F59E0B /* star ratings, highlights */
--bg: #FAFBFC   /* page background */
--ink2: #6C757D /* secondary text */
```

### Card System Classes

| Class | Usage |
|-------|-------|
| `.patient-screen.active` | Full-screen page panel |
| `.doc-result-card` | Doctor result card |
| `.drc-row1` / `.drc-row2` | Card header + footer rows |
| `.drc-book-btn` | "বুক করুন" CTA button |
| `.drc-mv` / `.drc-mv-val` / `.drc-mv-lbl` | Metric cells (rating, reviews, fee) |
| `.filter-chips` / `.fchip` | Specialty filter pills |
| `.search-bar-full` | Search input with icon |

### Emergency UI Flow
- `bookingTrigger = 'ambulance'` → `ResultsPanel` switches to red emergency mode
- Shows 🚨 banner + bold Bangla warning text
- "৯৯৯ কল করুন" + "অ্যাম্বুলেন্স বুক করুন" dual CTAs

### Chat UX Flow
- Phase 1 (Gemini): AI asks 2-3 clarifying questions (streamed text, no result card)
- Phase 2 (Diagnosis): Gemini returns structured JSON → `parseAiResponse()` → ResultsPanel slides in
- Bengali TTS: full result readable via `SpeechSynthesisUtterance` (voice priority: Google বাংলা → Microsoft Bangla → bn-BD)
- Mobile-first: `BottomNav.tsx` with icons for Home, Chat, Doctors, Map, Profile

### Target: Missing UI Components to Build

| Component | Where to Add | Data Source |
|-----------|-------------|-------------|
| `CapacityWidget` | `HospitalCard` in ResultsPanel + HospitalMapView | `hospital_resources` table |
| `PrescriptionWriter` | DoctorDashboard → Prescriptions tab | writes `prescriptions` table |
| `ReviewForm` | Post-appointment flow in Appointments.tsx | writes `reviews` table |
| `ResourceUpdatePanel` | DoctorDashboard/PartnerDashboard | updates `hospital_resources` |
| `AIHistoryPanel` | ChatInterface — restore session | reads `medical_records` (type=summary) |

---

## 9. 🤖 AI ENGINE (FINAL DESIGN)

### Symptom Database Architecture

- **Source 1:** `symptomDb.ts` — 500+ hardcoded TypeScript entries
- **Source 2:** `new 500+ Symptom List.csv` — imported via `import symptomCsv from "...?raw"`
- **Entry Schema:**
  ```typescript
  {
    bengali: string[];     // ["বুক ব্যথা", "বুকে চাপ অনুভব"]
    english: string[];     // ["Chest Pain", "Chest Pressure"]
    specialty: string;     // "Cardiology (কার্ডিওলজি)"
    severity: "emergency" | "moderate" | "mild" | "unknown"
  }
  ```

### Specialties Covered (25+)

| Specialty | Bengali |
|-----------|---------|
| Cardiology | কার্ডিওলজিস্ট (হৃদরোগ বিশেষজ্ঞ) |
| Neurology | নিউরোলজিস্ট (স্নায়ু বিশেষজ্ঞ) |
| Pulmonology | পালমোনোলজিস্ট (ফুসফুস বিশেষজ্ঞ) |
| Gastroenterology | গ্যাস্ট্রোএন্টারোলজিস্ট |
| Orthopedics | অর্থোপেডিক্স বিশেষজ্ঞ |
| Dermatology | ডার্মাটোলজিস্ট (চর্মরোগ বিশেষজ্ঞ) |
| Pediatrics | শিশু বিশেষজ্ঞ (পেডিয়াট্রিশিয়ান) |
| Gynecology | স্ত্রী রোগ ও প্রসূতি বিশেষজ্ঞ |
| ENT | নাক-কান-গলা বিশেষজ্ঞ |
| Ophthalmology | চক্ষু বিশেষজ্ঞ |
| Dentistry | ডেন্টিস্ট (দন্তরোগ বিশেষজ্ঞ) |
| Nephrology | নেফ্রোলজিস্ট (কিডনি বিশেষজ্ঞ) |
| Endocrinology | এন্ডোক্রাইনোলজিস্ট (ডায়াবেটিস) |
| Psychiatry | মনোরোগ বিশেষজ্ঞ (সাইকিয়াট্রিস্ট) |
| Urology | ইউরোলজিস্ট |
| Oncology | ক্যান্সার বিশেষজ্ঞ |
| General Medicine | মেডিসিন বিশেষজ্ঞ (জেনারেল ফিজিশিয়ান) |
| Emergency | জরুরি বিভাগ চিকিৎসক |

### Emergency Scoring Logic

```
For each SYMPTOM_DB entry:
  score = 0
  for each keyword in (bengali + english):
    if normalized_text == keyword → score += 100
    if normalized_text includes keyword → score += min(20, keyword.length)
  if entry.severity === 'emergency' → score += 50  ← promotion bias
  track highest-scoring entry

Backup regex emergency patterns (Bangla):
  /বুক.*(তীব্র|তীক্ষ্ণ).*ব্যথ/u
  /শ্বাসকষ্ট|শ্বাস নিতে কষ্ট/u
  /অজ্ঞান|বেহুঁশ/u
  /রক্তক্ষরণ|রক্তপাত/u
  /জরুরি|জরূরী/u
```

### Bangladesh Context Routing Logic

```
Income-based routing:
  monthlyIncome < 15,000 BDT  → "সরকারি হাসপাতালে যান" (government)
  monthlyIncome < 40,000 BDT  → "ক্লিনিক বা প্রাইভেট চেম্বার" (private clinic)
  monthlyIncome ≥ 40,000 BDT  → "বিশেষায়িত হাসপাতাল" (specialist hospital)

Location-based:
  district + upazila → Supabase ilike query on hospitals table
  No match → return empty (no hardcoded Dhaka fallback in strict mode)

Duration rule:
  if symptoms ≥ 4 days + severity = 'mild' → upgrade to 'moderate'
  if symptoms in months/years → stays 'moderate' (chronic flag)
```

### Target Fix — Unified Specialist Canonical Map

```typescript
// PROBLEM: AI_Engine uses SYMPTOM_DB.specialty (25+ strings, bilingual mixed)
// doctorSaabAgents uses TRIAGE_RULES[].specialist (14 rules, different format)
// SOLUTION: Single source of truth

export const CANONICAL_SPECIALTY: Record<string, { bn: string; en: string }> = {
  cardiology:       { bn: "কার্ডিওলজিস্ট (হৃদরোগ বিশেষজ্ঞ)", en: "Cardiologist" },
  neurology:        { bn: "নিউরোলজিস্ট (স্নায়ু বিশেষজ্ঞ)", en: "Neurologist" },
  gastroenterology: { bn: "গ্যাস্ট্রোএন্টারোলজিস্ট", en: "Gastroenterologist" },
  // ... all 25 specialties
};
// Both AI_Engine + doctorSaabAgents read from CANONICAL_SPECIALTY
```

---

## 10. 💰 MONETIZATION MODEL

### Phase 1 — Lead Generation (Active)

| Item | Detail |
|------|--------|
| Model | Every AI booking intent = 1 lead in `leads` table |
| Default lead value | `lead_value = 200 BDT` per confirmed lead |
| Partner billing | Admin assigns lead to partner → billing ledger count × 200 BDT |
| Revenue path | Partner pays DaktarSab for leads they receive |

### Phase 2 — Partner Subscription (Planned)

- Hospital/clinic monthly subscription fee (tiered: Basic / Pro / Premium)
- Subscribed partners get **verified badge** + priority placement in AI recommendations
- `telemedicine = true` in `doctors` table → unlocks "অনলাইন কনসাল্টেশন" button
- DaktarSab earns MRR (Monthly Recurring Revenue)

### Phase 3 — Transaction Commission (Planned)

- bKash + SSLCommerz live integration into `PaymentGateway.tsx`
- DaktarSab takes 5–10% commission per confirmed paid appointment
- `payment_status` field + `transaction_id` in bookings table
- Patient receipt generation

### Phase 4 — Health Data & Insurance (Future)

- Anonymized aggregate health trend data → government / pharma partnerships
- Health Card as digital identity for health insurance eligibility
- Premium: AI health monitoring subscription for chronic disease patients
- B2B telemedicine API for corporate employee health programs

---

## 11. 🚀 ROADMAP

### Phase 1: System Stabilization — 2 Weeks

**Goal: Fix all critical bugs and security gaps. Zero hardcoded identities.**

```
Week 1 — Security First
  [SEC-1] App.tsx: Wrap /doctor-dashboard with <ProtectedRoute roles={['doctor','admin']}>
  [SEC-2] App.tsx: Wrap /partner-dashboard with <ProtectedRoute roles={['doctor','admin']}>
  [SEC-3] App.tsx: Wrap /kazi with <ProtectedRoute roles={['admin']}>
  [SEC-4] DoctorDashboard.tsx:466: await supabase.auth.signOut(); before setAuth(false)
  [SEC-5] PartnerDashboard.tsx:395: same fix
  [SEC-6] Add role checks to /partner-bookings + /admin/bookings

Week 2 — Crash Fixes & Identity
  [UI-6]  HealthCard.tsx:37: canvas.toDataString() → canvas.toDataURL()
  [UI-1]  DoctorDashboard: render doctorProfile?.full_name, doctorProfile?.specialization
  [UI-7]  CompleteProfile: add blood_group selector → HealthCard renders real value
  [DB-1]  Resolve profiles.role column conflict (drop ENUM, keep TEXT)
  [DB-3]  Add FK: ALTER TABLE booking_requests ADD COLUMN user_id UUID REFERENCES auth.users(id)
  [DB-4]  Add FK: ALTER TABLE leads ADD COLUMN ... (or ADD FOREIGN KEY to existing column)
```

### Phase 2: Stable MVP — 4 Weeks

**Goal: No hardcoded/static/random data in any production view.**

```
AI Fixes
  → Unify specialist mapping to CANONICAL_SPECIALTY map
  → Connect queryDoctors() results to real ratings/fees from doctors table
  → Log AI decisions to symptom_logs table
  → Emergency: fetch local hospitals by patient district, not hardcode Dhaka

Database Fixes
  → Create normalized locations table + seed from locations.ts dictionary
  → Seed hospital_resources with 50+ real hospital capacity records

UI Fixes
  → Build CapacityWidget → add to HospitalCard in ResultsPanel + HospitalMapView
  → DoctorDashboard Reviews tab: query reviews table WHERE provider_id = doctor.id
  → PartnerDashboard metrics: COUNT(*) from booking_requests for real numbers
  → HomeDashboard stats: SELECT COUNT(*) from medical_records, doctors WHERE is_verified=true
  → AdminDashboard search: add onChange + filter logic on leads + bookings
  → Persist conversationHistory to medical_records on each exchange
```

### Phase 3: Doctor Telemedicine — 6 Weeks

**Goal: Complete virtual doctor chamber with prescription writing.**

```
→ Build PrescriptionWriter UI → INSERT into prescriptions table
→ Patient views prescriptions at /prescription (connect to real DB)
→ DoctorDashboard: connect review writing + rating aggregation
→ Live payment: integrate bKash + SSLCommerz into PaymentGateway.tsx
→ Wire send-notification edge function to booking status changes
→ Telemedicine: WebRTC video consultation for doctors with telemedicine=true
```

### Phase 4: AI Health Ecosystem — 12 Weeks

**Goal: Longitudinal health tracking + proactive AI assistant.**

```
→ AI health trend analysis from medical_records history
→ Multi-profile family health management (profiles.relation field)
→ Blood bank directory integration
→ Ambulance real-time GPS tracking
→ Push notification system (send-notification edge fn → mobile)
→ Government hospital capacity public dashboard
→ B2B telemedicine API for corporate clients
→ AI health report generation for insurance eligibility
```

---

## 12. 🧠 AGENT TASK SYSTEM

### Agent Protocol (All Agents)

```
Every task follows this loop:
  1. CHECK   → Read the current code/DB state
  2. FIND    → Identify the exact bug/gap (file:line)
  3. FIX     → Apply minimal, targeted change
  4. RECHECK → Verify fix doesn't break adjacent logic
  5. REPORT  → Output: what changed, what was tested, success criteria met ✅/❌
```

---

### 🤖 Agent 1: AI Agent

**Role:** Owns the intelligence layer — symptom detection, triage logic, Gemini pipeline, fallback system.

**Responsibilities:**
- Maintain `symptomDb.ts` — add/update/remove entries with correct severity
- Fix specialist mapping conflict (AI-1) — create `CANONICAL_SPECIALTY` map
- Fix emergency hospital routing (AI-2) — query DB by patient district, not hardcode
- Eliminate `Math.random()` from all doctor data (AI-3)
- Implement `symptom_logs` INSERT after every triage decision
- Tune emergency detection thresholds to reduce over-triggering (AI-5)

**Input:**
```typescript
{ message: string, patientContext: PatientContext, conversationHistory: Message[] }
```

**Output:**
```typescript
AiMedicalResponse {
  isEmergency: boolean,
  condition: string,
  severity: 'emergency' | 'moderate' | 'mild',
  specialistNeeded: string,       // from CANONICAL_SPECIALTY
  hospitals: Hospital[],          // from Supabase (patient's district)
  tests: Test[],                  // income-tiered
  recommendedDoctors: Doctor[],   // real ratings/fees from DB
  bookingTrigger: 'ambulance' | 'hospital' | 'clinic' | 'diagnostic' | null
}
```

**Success Criteria:**
- [ ] Emergency detection ≥ 95% on test set (no false negatives)
- [ ] Same symptom = same specialist via both AI_Engine and doctorSaabAgents
- [ ] Zero `Math.random()` in doctor data
- [ ] Emergency hospitals match patient's district (not always Dhaka)
- [ ] `symptom_logs` row inserted after each triage

---

### 🎨 Agent 2: Frontend Agent

**Role:** Owns all patient-facing UI — chat, results, booking, dashboards, design system.

**Responsibilities:**
- Fix all UI bugs listed in Section 3 (UI-1 through UI-11)
- Build missing components: `CapacityWidget`, `PrescriptionWriter`, `ReviewForm`
- Replace all hardcoded/`Math.random()` data with real Supabase queries
- Unify CSS system — extend `patient-ui.css` vars across dashboards, retire ad-hoc Tailwind
- Ensure all interactive elements have `id` attributes for browser testing
- Implement conversation history restore from `medical_records` on page reload

**Input:** `AiMedicalResponse` from orchestrator + real Supabase data from hooks

**Output:** Production-quality React components with zero hardcoded strings

**Success Criteria:**
- [ ] DoctorDashboard shows real doctor name and specialty (not Rahim Ahmed)
- [ ] HealthCard download works without crash
- [ ] PartnerDashboard metrics reflect real Supabase `COUNT(*)` queries
- [ ] ResultsPanel shows Beds/ICU/Oxygen from `hospital_resources`
- [ ] HomeDashboard stats are real aggregated counts
- [ ] Admin search bar filters live data

---

### 🗄️ Agent 3: Backend Agent

**Role:** Owns Supabase schema, RLS policies, edge functions, and data integrity.

**Responsibilities:**
- Fix DB-1: Resolve `profiles.role` column conflict
- Fix DB-3, DB-4: Add `user_id` FK constraints to `booking_requests` and `leads`
- Create `locations` normalized table + seed migration from `locations.ts`
- Create `symptom_logs` table migration
- Seed `hospital_resources` with real hospital capacity data
- Improve RLS: Remove overly permissive `"Anyone can read leads"` policy
- Deploy and test `send-notification` edge function end-to-end
- Fix `medical_logs` — either connect to UI or deprecate

**Input:** Migration files in `/supabase/migrations/`

**Output:** Clean schema with all FKs, correct RLS, all edge functions testable

**Success Criteria:**
- [ ] `profiles.role` has one TEXT column, ENUM dropped
- [ ] `booking_requests` + `leads` have valid `user_id` FKs
- [ ] `hospital_resources` has ≥ 10 real records
- [ ] `locations` table seeded with all 64 districts + upazilas
- [ ] RLS test: patient A cannot read patient B's bookings
- [ ] `send-notification` called and logs email on booking status change

---

### 🧪 Agent 4: QA Agent

**Role:** Owns test coverage, regression detection, and pre-release validation.

**Responsibilities:**
- Write unit tests in `/src/test/` for `AI_Engine.ts` scoring logic
- Test emergency detection on 100 Bangla + English symptom phrases
- Test RBAC: verify each of SEC-1 through SEC-6 is closed
- Test booking E2E: INSERT → doctor sees → accept → patient sees `confirmed`
- Test HealthCard download (no crash after fix)
- Browser record critical user flows using automated screenshot tools
- Create regression test suite for all `Math.random()` data elimination

**Input:** `vitest.config.ts` (already configured), test case CSV from `new 500+ Symptom List.csv`

**Output:** Test suite with ≥ 80% coverage on AI Engine + security verification report

**Success Criteria:**
- [ ] `npm run test` passes with 0 failures
- [ ] All 6 SEC issues verified closed by route access tests
- [ ] Emergency detection: 0 false negatives on 20 known emergency phrases
- [ ] Booking flow: 5 concurrent requests all persist correctly
- [ ] HealthCard: download produces valid `.png` file

---

### 📋 Agent 5: Product Agent

**Role:** Owns roadmap alignment, stakeholder reporting, and acceptance criteria.

**Responsibilities:**
- Keep `PROJECT_SUMMARY.md` up to date as living document
- Define acceptance criteria before each sprint starts
- Track KPIs: lead count, conversion rate (lead→booking), partner count
- Review demo readiness before investor/government presentations
- Prioritize feature backlog across all agents weekly
- Define `symptom_logs` analytics requirements for QA Agent

**Input:** Lead/booking data from Supabase + agent status reports

**Output:** Weekly progress report + updated roadmap + acceptance criteria docs

**Success Criteria:**
- [ ] Phase 1 bugs all resolved within 2 weeks
- [ ] Phase 2 shipped with zero hardcoded data (verified by QA Agent)
- [ ] Lead-to-booking conversion rate tracked and reported weekly
- [ ] All 5 SEC issues closed before any public-facing demo
- [ ] `PROJECT_SUMMARY.md` reflects current system state at all times

---

## 13. ✅ EXECUTION CHECKLIST — START HERE

### 🔴 Immediate (This Week — Block Everything Else)

```
SECURITY
  [ ] App.tsx:53  → Wrap /doctor-dashboard: <ProtectedRoute roles={['doctor','admin']}>
  [ ] App.tsx:54  → Wrap /partner-dashboard: <ProtectedRoute roles={['doctor','admin']}>
  [ ] App.tsx:55  → Wrap /kazi: <ProtectedRoute roles={['admin']}>
  [ ] App.tsx:52  → Add role check to /partner-bookings
  [ ] App.tsx:56  → Add role check to /admin/bookings
  [ ] DoctorDashboard.tsx:466 → await supabase.auth.signOut()
  [ ] PartnerDashboard.tsx:395 → await supabase.auth.signOut()

CRASH FIX
  [ ] HealthCard.tsx:37 → canvas.toDataString() ➜ canvas.toDataURL()

IDENTITY FIX (Demo critical)
  [ ] DoctorDashboard.tsx: sidebar renders doctorProfile?.full_name
  [ ] DoctorDashboard.tsx: sidebar renders doctorProfile?.specialization
```

### 🟡 This Sprint (Week 2–4)

```
DATABASE
  [ ] Write migration to drop ENUM role + keep TEXT role on profiles
  [ ] ALTER TABLE booking_requests ADD user_id FK
  [ ] ALTER TABLE leads ADD user_id FK
  [ ] CREATE TABLE locations (normalized) + seed script
  [ ] CREATE TABLE symptom_logs
  [ ] Seed hospital_resources with real data

AI ENGINE
  [ ] Create CANONICAL_SPECIALTY map (single source for all specialist strings)
  [ ] Remove Math.random() from doctorSaabAgents.ts doctor enrichment
  [ ] Fix emergency hospital lookup: query DB by patient district
  [ ] Add symptom_logs INSERT to AI_Engine.ts

UI
  [ ] Build CapacityWidget component → add to ResultsPanel HospitalCard
  [ ] Connect DoctorDashboard Reviews tab to reviews table
  [ ] Fix PartnerDashboard metrics → real Supabase COUNT queries
  [ ] Fix HomeDashboard stats → real aggregate queries
  [ ] Fix AdminDashboard search bar → onChange + filter logic
  [ ] Add blood_group field to CompleteProfile + HealthCard
  [ ] Persist conversation history to medical_records
```

### 🟢 Next Phase (Month 2)

```
  [ ] PrescriptionWriter UI → DoctorDashboard Prescriptions tab
  [ ] ReviewForm → Appointments.tsx post-completion
  [ ] ResourceUpdatePanel → Partner/Doctor dashboard
  [ ] WebRTC telemedicine for telemedicine=true doctors
  [ ] bKash + SSLCommerz live payment integration
  [ ] Wire send-notification edge fn to booking events
  [ ] AI health trend report from medical_records history
```

---

## 14. 📊 SYSTEM HEALTH SCORECARD

| Module | Current Score | Target Score | Key Blocker |
|--------|:------------:|:------------:|-------------|
| AI Triage Core | **75 / 100** | 95 / 100 | Dual specialist mapping, mock doctor ratings |
| Emergency Detection | **88 / 100** | 98 / 100 | Over-triggering on mild breathlessness |
| Patient Chat UI | **80 / 100** | 95 / 100 | Mock fallback doctors, no history persistence |
| Booking Engine | **85 / 100** | 95 / 100 | Missing user_id FK, no real payment |
| Doctor Dashboard | **40 / 100** | 85 / 100 | Wrong identity (Rahim Ahmed), mock reviews, logout bug |
| Partner Dashboard | **35 / 100** | 80 / 100 | Hardcoded metrics, static schedule, logout bug |
| Admin Panel | **70 / 100** | 92 / 100 | SEC-3 no guard, search broken |
| Security / RBAC | **38 / 100** | 98 / 100 | 3 unguarded routes + 2 logout vulnerabilities |
| Database Schema | **58 / 100** | 90 / 100 | Duplicate role col, missing FKs, empty hospital_resources |
| Hospital Resources | **8 / 100** | 85 / 100 | Table schema exists, zero data, zero UI |
| Payment System | **15 / 100** | 75 / 100 | Sandbox-only, no live MFS gateway |
| Notification System | **5 / 100** | 70 / 100 | Edge function built, never connected |
| **OVERALL PLATFORM** | **55 / 100** | **90 / 100** | — |

---

## 15. 📎 FILE REFERENCE MAP

| Feature | Key Files |
|---------|-----------|
| AI Triage | `src/lib/AI_Engine.ts`, `src/lib/aiChat.ts`, `src/lib/orchestrator.ts` |
| Symptom DB | `src/lib/symptomDb.ts`, `new 500+ Symptom List.csv` |
| Fallback Agents | `src/lib/doctorSaabAgents.ts` |
| Bilingual | `src/lib/bilingualTranslator.ts` |
| Locations | `src/lib/locations.ts`, `src/components/DistrictSelector.tsx` |
| Chat UI | `src/components/ChatInterface.tsx`, `src/pages/Index.tsx` |
| Results | `src/components/ResultsPanel.tsx` |
| Booking | `src/components/BookingModal.tsx`, `src/lib/leadTracking.ts` |
| Auth | `src/hooks/useAuth.tsx`, `src/pages/Auth.tsx`, `src/components/ProtectedRoute.tsx` |
| Patient Context | `src/contexts/PatientContext.tsx` |
| Health Card | `src/pages/HealthCard.tsx` |
| Doctor Dashboard | `src/pages/DoctorDashboard.tsx` |
| Partner Dashboard | `src/pages/PartnerDashboard.tsx` |
| Admin | `src/pages/AdminDashboard.tsx`, `src/pages/AdminBookings.tsx` |
| Health Memory | `src/lib/healthMemory.ts`, `src/lib/medicalRecords.ts` |
| Gemini Edge Fn | `supabase/functions/chat/index.ts` |
| Notification | `supabase/functions/send-notification/index.ts` |
| DB Migrations | `supabase/migrations/` (14 files, chronological) |
| Routing | `src/App.tsx` |
| Design System | `src/patient-ui.css`, `src/index.css`, `tailwind.config.ts` |

---

*Document generated by Antigravity AI · DaktarSab Full Codebase Analysis · 2026-04-24*  
*Based on: 25 page components · 20 shared components · 11 AI library files · 14 SQL migrations · 5 Supabase edge functions · SYSTEM_AUDIT_REPORT.md*
