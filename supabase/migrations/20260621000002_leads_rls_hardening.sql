-- ============================================================
-- DaktarSab — Database Security Hardening (Leads)
-- Migration: 20260621000002_leads_rls_hardening.sql
--
-- 1. Drops insecure "Anyone can insert leads" and "Anyone can update leads"
-- 2. Restricts INSERT to authenticated/anon roles
-- 3. Restricts UPDATE to authenticated 'admin' users
-- ============================================================

-- Drop the insecure prototype policies
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can update leads" ON public.leads;

-- Allow authenticated and anonymous users to insert leads (e.g. from symptom checks)
CREATE POLICY "Anyone can insert leads"
  ON public.leads FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Restrict update of leads to admins only
CREATE POLICY "Admins can update leads"
  ON public.leads FOR UPDATE
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
