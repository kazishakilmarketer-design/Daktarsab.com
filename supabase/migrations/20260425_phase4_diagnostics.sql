-- Migration: Phase 4 - Diagnostic Test Bookings
-- Creates table for Diagnostic Booking Orders

CREATE TABLE IF NOT EXISTS public.diagnostic_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    test_name TEXT NOT NULL,
    preferred_date DATE NOT NULL,
    preferred_time TEXT NOT NULL,
    sample_collection_type TEXT NOT NULL CHECK (sample_collection_type IN ('home_collection', 'hospital_visit')),
    delivery_address TEXT,
    contact_phone TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'collected', 'reports_ready', 'cancelled')),
    total_amount NUMERIC(10, 2),
    payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS for Diagnostic Bookings
ALTER TABLE public.diagnostic_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own diagnostic bookings"
    ON public.diagnostic_bookings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own diagnostic bookings"
    ON public.diagnostic_bookings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diagnostic bookings"
    ON public.diagnostic_bookings FOR UPDATE
    USING (auth.uid() = user_id);
