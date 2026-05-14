-- ============================================================
-- DaktarSab — RBAC Role Policies & Trigger Enhancement
-- Migration: 20260330000001_rbac_role_policies.sql
--
-- 1. Adds RLS policies to booking_requests for role-based access
-- 2. Enhances partner approval trigger to flip profiles.role
-- 3. Adds policy for service-role admin reads on booking_requests
-- ============================================================

-- ── 1. RLS on booking_requests ───────────────────────────────────────────
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

-- Drop any old loose policies
DROP POLICY IF EXISTS "Anyone can insert bookings" ON public.booking_requests;
DROP POLICY IF EXISTS "Users can read own bookings" ON public.booking_requests;
DROP POLICY IF EXISTS "Doctors can read all bookings" ON public.booking_requests;
DROP POLICY IF EXISTS "Admins can read all bookings" ON public.booking_requests;
DROP POLICY IF EXISTS "Doctors can update booking status" ON public.booking_requests;

-- Patients (any authenticated user) can insert their own booking
CREATE POLICY "Anyone can insert bookings"
  ON public.booking_requests FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Patients can only read their own bookings
CREATE POLICY "Users can read own bookings"
  ON public.booking_requests FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
        AND role IN ('doctor', 'admin')
    )
  );

-- Doctors and Admins can update booking status
CREATE POLICY "Doctors can update booking status"
  ON public.booking_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = auth.uid()
        AND role IN ('doctor', 'admin')
    )
  );

-- ── 2. Enhanced trigger: set profiles.role = 'doctor' on approval ────────
-- This replaces the function in migration 20260325000004_admin_approve_doctor_trigger.sql
CREATE OR REPLACE FUNCTION public.on_partner_registration_approved()
RETURNS TRIGGER AS $$
DECLARE
  v_auth_user_id UUID;
BEGIN
  -- Only fire when status changes TO 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN

    -- 1. Upsert into doctors table
    INSERT INTO public.doctors (
      full_name,
      specialization,
      division,
      phone,
      email,
      bmdc_no,
      is_verified,
      is_available,
      fee_in_person,
      fee_online,
      experience_years,
      bio,
      created_at
    )
    VALUES (
      COALESCE(NEW.name, NEW.full_name, 'Unknown'),
      COALESCE(NEW.specialty, NEW.specialization, ''),
      COALESCE(NEW.division, NEW.district, ''),
      COALESCE(NEW.phone, ''),
      COALESCE(NEW.email, ''),
      COALESCE(NEW.bmdc_no, ''),
      TRUE,
      TRUE,
      COALESCE(NEW.fee_in_person, 500),
      COALESCE(NEW.fee_online, 300),
      COALESCE(NEW.experience_years, 0),
      '',
      NOW()
    )
    ON CONFLICT (email) DO UPDATE SET
      is_verified  = TRUE,
      is_available = TRUE,
      updated_at   = NOW();

    -- 2. Look up the Supabase Auth user by email
    SELECT id INTO v_auth_user_id
      FROM auth.users
     WHERE email = NEW.email
     LIMIT 1;

    -- 3. If the doctor has an auth account, update their profile role to 'doctor'
    IF v_auth_user_id IS NOT NULL THEN
      UPDATE public.profiles
         SET role = 'doctor'
       WHERE user_id = v_auth_user_id;

      -- If no profile row exists yet, insert one
      INSERT INTO public.profiles (user_id, role)
        VALUES (v_auth_user_id, 'doctor')
        ON CONFLICT (user_id) DO UPDATE SET role = 'doctor';
    END IF;

    -- 4. Mark registration as reviewed
    NEW.reviewed_at = NOW();

  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger (safe to run multiple times due to DROP IF EXISTS)
DROP TRIGGER IF EXISTS trg_partner_registration_approved ON public.partner_registrations;
CREATE TRIGGER trg_partner_registration_approved
  AFTER UPDATE ON public.partner_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.on_partner_registration_approved();

-- ── 3. Ensure profiles table has a unique constraint on user_id ──────────
-- Needed for ON CONFLICT (user_id) in the trigger above
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'patient'
    CHECK (role IN ('patient', 'doctor', 'admin'));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'profiles_user_id_key'
       AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;
