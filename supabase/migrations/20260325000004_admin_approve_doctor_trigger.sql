-- ============================================================
-- P2: Admin Approval → Auto-create doctor row
-- When a partner_registration is approved (status = 'approved'),
-- this trigger inserts a corresponding row into the doctors table.
-- Run in Supabase SQL Editor.
-- ============================================================

-- Ensure the trigger function exists
CREATE OR REPLACE FUNCTION public.on_partner_registration_approved()
RETURNS TRIGGER AS $$
BEGIN
  -- Only fire when status changes TO 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
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
      COALESCE(NEW.doctor_name, NEW.full_name, 'Unknown'),
      COALESCE(NEW.specialty, NEW.specialization, ''),
      COALESCE(NEW.division, NEW.district, ''),
      COALESCE(NEW.phone, ''),
      COALESCE(NEW.email, ''),
      COALESCE(NEW.bmdc_no, ''),
      TRUE,   -- mark as verified since admin approved
      TRUE,   -- mark as available by default
      COALESCE(NEW.fee_in_person, 500),
      COALESCE(NEW.fee_online, 300),
      COALESCE(NEW.experience_years, 0),
      COALESCE(NEW.bio, ''),
      NOW()
    )
    ON CONFLICT (email) DO UPDATE SET
      is_verified  = TRUE,
      is_available = TRUE,
      updated_at   = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to partner_registrations table
DROP TRIGGER IF EXISTS trg_partner_registration_approved ON public.partner_registrations;
CREATE TRIGGER trg_partner_registration_approved
  AFTER UPDATE ON public.partner_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.on_partner_registration_approved();

-- Grant execute to authenticated users (admin updates will fire this)
REVOKE EXECUTE ON FUNCTION public.on_partner_registration_approved() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.on_partner_registration_approved() TO service_role;

-- ─── Add 'status' column to partner_registrations if missing ───────────────
ALTER TABLE public.partner_registrations
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected'));

-- Index on status for fast admin queries
CREATE INDEX IF NOT EXISTS idx_partner_reg_status ON public.partner_registrations (status);
