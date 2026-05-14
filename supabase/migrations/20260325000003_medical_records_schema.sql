-- ============================================================
-- P1: Ensure medical_records table exists with correct schema
-- This supports Prescription.tsx's save functionality
-- Run in Supabase SQL Editor if table doesn't exist
-- ============================================================

CREATE TABLE IF NOT EXISTS public.medical_records (
  id            UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  record_type   TEXT         NOT NULL DEFAULT 'prescription',  -- 'prescription' | 'test' | 'diagnosis' | 'report'
  title         TEXT         NOT NULL,
  content_data  JSONB        DEFAULT '{}'::jsonb,
  file_url      TEXT,                                           -- Future: uploaded file URL
  doctor_name   TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ  DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  DEFAULT NOW()
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_medical_records_ts()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_medical_records_ts ON public.medical_records;
CREATE TRIGGER trg_medical_records_ts
  BEFORE UPDATE ON public.medical_records
  FOR EACH ROW EXECUTE FUNCTION public.update_medical_records_ts();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_medical_records_user_id    ON public.medical_records (user_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_type       ON public.medical_records (record_type);
CREATE INDEX IF NOT EXISTS idx_medical_records_created_at ON public.medical_records (created_at DESC);

-- RLS
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own medical records"   ON public.medical_records;
DROP POLICY IF EXISTS "Users can insert own medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Users can delete own medical records" ON public.medical_records;

CREATE POLICY "Users can read own medical records"
  ON public.medical_records FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own medical records"
  ON public.medical_records FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own medical records"
  ON public.medical_records FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own medical records"
  ON public.medical_records FOR DELETE
  USING (user_id = auth.uid());
