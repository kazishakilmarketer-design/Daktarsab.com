-- ============================================================
-- DaktarSab — Partner Registrations (Doctor Registration Form)
-- Migration: 20260321_partner_registrations_full_schema.sql
--
-- Stores all 4-step registration form data from /join-as-partner
-- Fields map 1:1 to handleSubmit() payload in JoinAsPartner.tsx
-- ============================================================

-- ── 1. Create partner_registrations table ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.partner_registrations (
  id                   UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at           TIMESTAMPTZ  DEFAULT timezone('utc', now()) NOT NULL,

  -- ── STEP 1: Identity & Contact ─────────────────────────────────────
  type                 TEXT         NOT NULL DEFAULT 'specialist_doctor',
  name                 TEXT         NOT NULL,
  bmdc_no              TEXT         NOT NULL,
  email                TEXT         NOT NULL,
  phone                TEXT         NOT NULL,
  photo_url            TEXT,                          -- Supabase Storage URL (uploaded later)
  photo_data           TEXT,                          -- base64 fallback (temp, kept for migration)
  password_hash        TEXT,                          -- bcrypt hash — set server-side, never plain

  -- ── STEP 2: Professional Info ────────────────────────────────────────
  degrees              TEXT,                          -- comma-separated: "MBBS, FCPS"
  specialty            TEXT,                          -- e.g. "কার্ডিওলজিস্ট"
  experience_years     INTEGER      DEFAULT 0,
  hospital_name        TEXT,
  fee_in_person        INTEGER      DEFAULT 0,        -- BDT
  fee_online           INTEGER,                       -- NULL if telehealth = false

  -- ── STEP 3: Location & Schedule ──────────────────────────────────────
  division             TEXT,
  district             TEXT,
  area                 TEXT,
  address              TEXT,
  working_days         TEXT,                          -- comma-separated: "mon,tue,wed"
  slot_start           TEXT,                          -- "09:00"
  slot_end             TEXT,                          -- "13:00"
  slot_duration        TEXT,                          -- "২০ মিনিট"

  -- ── STEP 4: Services & Telemedicine ──────────────────────────────────
  telehealth           BOOLEAN      DEFAULT false,
  telehealth_medium    TEXT,                          -- "video" | "audio" | NULL
  services             TEXT,                          -- comma-separated service list
  accepts_emergency    BOOLEAN      DEFAULT false,
  digital_prescription BOOLEAN      DEFAULT false,

  -- ── Admin / workflow ──────────────────────────────────────────────────
  status               TEXT         NOT NULL DEFAULT 'pending',
                                                      -- 'pending' | 'approved' | 'rejected'
  admin_notes          TEXT,
  reviewed_at          TIMESTAMPTZ,
  approved_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ── 2. Indexes for fast admin lookups ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_partner_reg_status     ON public.partner_registrations(status);
CREATE INDEX IF NOT EXISTS idx_partner_reg_email      ON public.partner_registrations(email);
CREATE INDEX IF NOT EXISTS idx_partner_reg_district   ON public.partner_registrations(district);
CREATE INDEX IF NOT EXISTS idx_partner_reg_specialty  ON public.partner_registrations(specialty);
CREATE INDEX IF NOT EXISTS idx_partner_reg_created_at ON public.partner_registrations(created_at DESC);

-- ── 3. Unique constraint: one registration per BMDC number ─────────────
-- (commented out — allow re-submission during development)
-- ALTER TABLE public.partner_registrations ADD CONSTRAINT uq_bmdc_no UNIQUE (bmdc_no);

-- ── 4. Row Level Security ───────────────────────────────────────────────
ALTER TABLE public.partner_registrations ENABLE ROW LEVEL SECURITY;

-- Anyone (including unauthenticated visitors) can submit the registration form
CREATE POLICY "Anyone can submit partner registration"
  ON public.partner_registrations
  FOR INSERT
  WITH CHECK (true);

-- Only authenticated admins (role = 'admin') can read/update registrations
CREATE POLICY "Admins can view all registrations"
  ON public.partner_registrations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update registration status"
  ON public.partner_registrations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- A registered doctor can read their own application (matched by email)
-- This enables a future "check my application status" feature
CREATE POLICY "Applicant can view own registration"
  ON public.partner_registrations
  FOR SELECT
  USING (
    email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- ── 5. Helper view for admin panel ────────────────────────────────────
CREATE OR REPLACE VIEW public.vw_partner_registration_summary AS
SELECT
  id,
  created_at,
  name,
  bmdc_no,
  email,
  phone,
  specialty,
  degrees,
  experience_years,
  district,
  division,
  fee_in_person,
  fee_online,
  telehealth,
  accepts_emergency,
  digital_prescription,
  status,
  admin_notes,
  reviewed_at
FROM public.partner_registrations
ORDER BY created_at DESC;

-- ── 6. Comment documentation ───────────────────────────────────────────
COMMENT ON TABLE public.partner_registrations IS
  'Stores doctor/specialist registration applications submitted via /join-as-partner. '
  'Admin reviews and changes status to approved/rejected. '
  'On approval, a row should be inserted into public.doctors.';

COMMENT ON COLUMN public.partner_registrations.status IS
  'pending = awaiting admin review | approved = added to doctors table | rejected = declined';

COMMENT ON COLUMN public.partner_registrations.working_days IS
  'Comma-separated short day codes: mon,tue,wed,thu,fri,sat,sun';

COMMENT ON COLUMN public.partner_registrations.slot_duration IS
  'Human-readable Bengali string e.g. "২০ মিনিট"';

COMMENT ON COLUMN public.partner_registrations.password_hash IS
  'bcrypt hash of the password the doctor set during registration. '
  'Never store plain text. Set via a Supabase Edge Function.';
