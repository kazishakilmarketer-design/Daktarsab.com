-- Phase 3 Schema Additions

-- 1. Add payment and meeting links to booking_requests
ALTER TABLE public.booking_requests
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  ADD COLUMN IF NOT EXISTS transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS meet_link TEXT;

-- 2. Create Storage Bucket for Patient Documents (if not exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('patient_documents', 'patient_documents', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage RLS Policies
-- Allow authenticated users to upload files to patient_documents
CREATE POLICY "Allow authenticated uploads" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'patient_documents');

-- Allow authenticated users to read files from patient_documents
CREATE POLICY "Allow authenticated reads" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'patient_documents');
