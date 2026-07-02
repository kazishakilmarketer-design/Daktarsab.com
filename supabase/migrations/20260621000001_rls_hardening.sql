-- ============================================================
-- DaktarSab — Database Security Hardening
-- Migration: 20260621000001_rls_hardening.sql
--
-- 1. Drops insecure "Service role can manage doctors" policy on `doctors`
-- 2. Restricts INSERT/UPDATE/DELETE access to authenticated 'admin' users
-- ============================================================

-- Drop the insecure policy that allowed anyone to insert/update/delete doctor data
DROP POLICY IF EXISTS "Service role can manage doctors" ON public.doctors;

-- Allow only authenticated admin users to write, update, or delete doctor profiles
CREATE POLICY "Admins can manage doctors"
  ON public.doctors FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
