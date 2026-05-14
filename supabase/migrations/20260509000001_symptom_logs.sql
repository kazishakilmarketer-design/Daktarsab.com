-- Migration: 20260509000001_symptom_logs.sql
-- Creates the symptom_logs table for AI triage analytics and QA auditing.

CREATE TABLE IF NOT EXISTS public.symptom_logs (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    raw_message        TEXT,
    detected_severity  TEXT CHECK (detected_severity IN ('emergency', 'moderate', 'mild', 'unknown')),
    detected_specialty TEXT,
    engine_score       NUMERIC,
    gemini_used        BOOLEAN DEFAULT false,
    session_id         TEXT,
    created_at         TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS
ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own symptom logs
CREATE POLICY "Users can view own symptom logs"
ON public.symptom_logs FOR SELECT
USING (auth.uid() = user_id);

-- The system (service role) inserts logs; patients insert their own
CREATE POLICY "Users can insert own symptom logs"
ON public.symptom_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all symptom logs for analytics
CREATE POLICY "Admins can view all symptom logs"
ON public.symptom_logs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
    )
);
