-- Migration: 20260424000001_database_integrity.sql
-- Fixes: DB-1, DB-2, DB-3, DB-4

-- DB-1: Unify profiles.role
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'patient';

UPDATE public.profiles 
  SET role = 'admin' 
  WHERE role = 'super_admin';

ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS valid_role_check;

ALTER TABLE public.profiles 
  ADD CONSTRAINT valid_role_check 
  CHECK (role IN ('patient', 'doctor', 'kazi', 'admin', 'partner'));

-- DB-2: doctors.partner_id missing FK constraint
ALTER TABLE public.doctors 
  ADD COLUMN IF NOT EXISTS partner_id UUID;

-- Just in case there are bad partner_id strings, we cast or recreate. 
-- Since it might be text or already UUID but without FK:
ALTER TABLE public.doctors 
  DROP CONSTRAINT IF EXISTS doctors_partner_id_fkey;

ALTER TABLE public.doctors 
  ADD CONSTRAINT doctors_partner_id_fkey 
  FOREIGN KEY (partner_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- DB-3: booking_requests.user_id FK constraint
ALTER TABLE public.booking_requests
  DROP CONSTRAINT IF EXISTS booking_requests_user_id_fkey;

-- Ensure column is UUID
ALTER TABLE public.booking_requests 
  ALTER COLUMN user_id TYPE UUID USING user_id::uuid;

ALTER TABLE public.booking_requests
  ADD CONSTRAINT booking_requests_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- DB-4: leads.user_id FK constraint
ALTER TABLE public.leads
  DROP CONSTRAINT IF EXISTS leads_user_id_fkey;

ALTER TABLE public.leads 
  ALTER COLUMN user_id TYPE UUID USING user_id::uuid;

ALTER TABLE public.leads
  ADD CONSTRAINT leads_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
