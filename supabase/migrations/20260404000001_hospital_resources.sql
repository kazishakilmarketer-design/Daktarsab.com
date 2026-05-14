-- ============================================================
-- DaktarSab — Hospital Resources + Blood Group Migration
-- Migration: 20260404000001_hospital_resources.sql
--
-- 1. Creates hospital_resources table for live Bed/ICU/Oxygen tracking
-- 2. Adds blood_group column to profiles table
-- ============================================================

-- ── 1. Hospital Resources Table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hospital_resources (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id      UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  hospital_name    TEXT NOT NULL DEFAULT '',  -- Denormalized for fast lookup by name
  beds_available   INTEGER NOT NULL DEFAULT 0 CHECK (beds_available >= 0),
  icu_beds_available INTEGER NOT NULL DEFAULT 0 CHECK (icu_beds_available >= 0),
  oxygen_status    TEXT NOT NULL DEFAULT 'Medium'
                   CHECK (oxygen_status IN ('High', 'Medium', 'Low')),
  updated_by       UUID REFERENCES auth.users(id),
  last_updated_at  TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Index for fast lookup by hospital_id and name
CREATE INDEX IF NOT EXISTS idx_hospital_resources_hospital_id
  ON public.hospital_resources(hospital_id);

CREATE INDEX IF NOT EXISTS idx_hospital_resources_hospital_name
  ON public.hospital_resources(hospital_name);

-- ── 2. Row Level Security ─────────────────────────────────────────────────
ALTER TABLE public.hospital_resources ENABLE ROW LEVEL SECURITY;

-- Anyone can read hospital capacity (public health data)
CREATE POLICY "Hospital resources are publicly readable"
  ON public.hospital_resources FOR SELECT
  USING (true);

-- Authenticated users with role doctor/admin can insert resource records
CREATE POLICY "Doctors and admins can insert resource updates"
  ON public.hospital_resources FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
        AND role IN ('doctor', 'admin')
    )
  );

-- Authenticated users with role doctor/admin can update resource records
CREATE POLICY "Doctors and admins can update resources"
  ON public.hospital_resources FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
        AND role IN ('doctor', 'admin')
    )
  );

-- ── 3. Add blood_group to profiles ────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS blood_group TEXT
    CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'));

-- ── 4. Seed sample hospital resources (optional demo data) ────────────────
-- Uncomment and adjust for your actual hospital UUIDs:
-- INSERT INTO public.hospital_resources (hospital_name, beds_available, icu_beds_available, oxygen_status)
-- VALUES
--   ('Dhaka Medical College Hospital', 45, 8, 'High'),
--   ('Square Hospital', 30, 5, 'Medium'),
--   ('Bangabandhu Sheikh Mujib Medical University', 60, 12, 'High')
-- ON CONFLICT DO NOTHING;
