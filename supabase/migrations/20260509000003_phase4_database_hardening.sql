-- ============================================================
-- DaktarSab — Phase 4 Database Hardening
-- Migration: 20260509000003_phase4_database_hardening.sql
--
-- 1. Drops orphaned `medical_logs` table (DB-6)
-- 2. Strictly drops any insecure lingering "Anyone can read" policies on `leads` and `booking_requests`
-- 3. Seeds realistic dummy data into `hospital_resources` (DB-5)
-- ============================================================

-- ── 1. Drop Orphaned medical_logs ──────────────────────────────────────────
DROP TABLE IF EXISTS public.medical_logs CASCADE;

-- ── 2. RLS Hardening ───────────────────────────────────────────────────────
-- Strictly drop insecure public access policies from early prototype migrations
DROP POLICY IF EXISTS "Anyone can read leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can insert booking requests" ON public.booking_requests;
DROP POLICY IF EXISTS "Anyone can read booking requests" ON public.booking_requests;
DROP POLICY IF EXISTS "Anyone can update booking requests" ON public.booking_requests;

-- ── 3. Seed Hospital Resources (DB-5) ──────────────────────────────────────
-- Insert a few major hospitals and their capacities
DO $$
DECLARE
  v_dmch_id UUID;
  v_square_id UUID;
  v_united_id UUID;
  v_evercare_id UUID;
  v_cmch_id UUID;
  v_osmani_id UUID;
BEGIN
  -- Insert dummy hospitals and capture their IDs
  INSERT INTO public.hospitals (name, type, district, upazila, address)
  VALUES 
    ('Dhaka Medical College Hospital', 'সরকারি', 'ঢাকা', 'শাহবাগ', 'Secretariat Road, Dhaka 1000')
  RETURNING id INTO v_dmch_id;

  INSERT INTO public.hospitals (name, type, district, upazila, address)
  VALUES 
    ('Square Hospital Ltd', 'প্রিমিয়াম', 'ঢাকা', 'পান্থপথ', '18/F, Bir Uttam Qazi Nuruzzaman Sarak')
  RETURNING id INTO v_square_id;

  INSERT INTO public.hospitals (name, type, district, upazila, address)
  VALUES 
    ('United Hospital Limited', 'প্রিমিয়াম', 'ঢাকা', 'গুলশান', 'Plot 15, Road 71, Gulshan')
  RETURNING id INTO v_united_id;

  INSERT INTO public.hospitals (name, type, district, upazila, address)
  VALUES 
    ('Evercare Hospital Dhaka', 'প্রিমিয়াম', 'ঢাকা', 'বসুন্ধরা', 'Plot: 81, Block: E, Bashundhara R/A')
  RETURNING id INTO v_evercare_id;

  INSERT INTO public.hospitals (name, type, district, upazila, address)
  VALUES 
    ('Chittagong Medical College Hospital', 'সরকারি', 'চট্টগ্রাম', 'চকবাজার', 'K.B. Fazlul Kader Road')
  RETURNING id INTO v_cmch_id;

  INSERT INTO public.hospitals (name, type, district, upazila, address)
  VALUES 
    ('Sylhet MAG Osmani Medical College', 'সরকারি', 'সিলেট', 'সিলেট সদর', 'Kajalshah, Sylhet')
  RETURNING id INTO v_osmani_id;

  -- Insert corresponding resource records
  INSERT INTO public.hospital_resources (hospital_id, hospital_name, beds_available, icu_beds_available, oxygen_status)
  VALUES 
    (v_dmch_id, 'Dhaka Medical College Hospital', 45, 8, 'High'),
    (v_square_id, 'Square Hospital Ltd', 12, 3, 'Medium'),
    (v_united_id, 'United Hospital Limited', 8, 2, 'Low'),
    (v_evercare_id, 'Evercare Hospital Dhaka', 22, 5, 'High'),
    (v_cmch_id, 'Chittagong Medical College Hospital', 35, 6, 'Medium'),
    (v_osmani_id, 'Sylhet MAG Osmani Medical College', 50, 10, 'High');
END $$;
