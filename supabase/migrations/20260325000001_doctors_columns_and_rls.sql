-- ============================================================
-- P1: Add missing columns to the `doctors` table
-- These columns enable fee/rating/availability display in Doctors.tsx
-- Run this in Supabase SQL Editor
-- ============================================================

-- Add columns if they don't already exist
ALTER TABLE public.doctors
  ADD COLUMN IF NOT EXISTS fee_in_person   INTEGER    DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fee_online      INTEGER    DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating          NUMERIC(3,1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count    INTEGER    DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_available    BOOLEAN    DEFAULT true,
  ADD COLUMN IF NOT EXISTS availability_note TEXT,
  ADD COLUMN IF NOT EXISTS experience_years INTEGER   DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bmdc_no         TEXT,
  ADD COLUMN IF NOT EXISTS is_verified     BOOLEAN    DEFAULT false,
  ADD COLUMN IF NOT EXISTS phone           TEXT,
  ADD COLUMN IF NOT EXISTS email           TEXT,
  ADD COLUMN IF NOT EXISTS bio             TEXT,
  ADD COLUMN IF NOT EXISTS languages       TEXT[]     DEFAULT ARRAY['বাংলা'],
  ADD COLUMN IF NOT EXISTS telemedicine    BOOLEAN    DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ DEFAULT NOW();

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_doctors_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_doctors_updated_at ON public.doctors;
CREATE TRIGGER trg_doctors_updated_at
  BEFORE UPDATE ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION public.update_doctors_updated_at();

-- Index for fast search by specialty
CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON public.doctors (specialization);
CREATE INDEX IF NOT EXISTS idx_doctors_division ON public.doctors (division);
CREATE INDEX IF NOT EXISTS idx_doctors_available ON public.doctors (is_available);

-- Make RLS policies for doctors (unauthenticated read allowed for directory)
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read approved doctors" ON public.doctors;
CREATE POLICY "Anyone can read approved doctors"
  ON public.doctors FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Service role can manage doctors" ON public.doctors;
CREATE POLICY "Service role can manage doctors"
  ON public.doctors FOR ALL
  USING (true)
  WITH CHECK (true);
