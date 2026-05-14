-- Migration: Phase 4 - Pharmacy & Vault
-- Creates tables for E-Pharmacy Orders and Health Records Vault

-- 1. Pharmacy Orders Table
CREATE TABLE IF NOT EXISTS public.pharmacy_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE SET NULL,
    delivery_address TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    total_amount NUMERIC(10, 2),
    payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Health Vault Table
CREATE TABLE IF NOT EXISTS public.health_vault (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('prescription', 'lab_report', 'xray', 'mri', 'other')),
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS for Pharmacy Orders
ALTER TABLE public.pharmacy_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pharmacy orders"
    ON public.pharmacy_orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pharmacy orders"
    ON public.pharmacy_orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS for Health Vault
ALTER TABLE public.health_vault ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vault files"
    ON public.health_vault FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can upload to their vault"
    ON public.health_vault FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their vault files"
    ON public.health_vault FOR DELETE
    USING (auth.uid() = user_id);
