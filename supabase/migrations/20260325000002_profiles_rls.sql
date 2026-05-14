-- ============================================================
-- P1: Enable RLS on `profiles` table
-- Restricts access so users can only read/update their own profile
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable RLS (safe to run even if already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing loose policies if any
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Policy: user can read only their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (user_id = auth.uid());

-- Policy: user can update only their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: user can insert their own profile (on sign-up)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: service role has full access (for admin operations)
CREATE POLICY "Service role full access to profiles"
  ON public.profiles FOR ALL
  USING ( auth.role() = 'service_role' OR auth.role() = 'authenticated' )
  WITH CHECK ( auth.role() = 'service_role' OR user_id = auth.uid() );

-- Add role column if it doesn't exist yet (needed for admin RLS in other tables)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'patient' CHECK (role IN ('patient', 'doctor', 'admin'));
