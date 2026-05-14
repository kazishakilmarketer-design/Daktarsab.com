-- Migration: 20260424000000_normalized_locations.sql
-- LOC-1 Fix: Creates normalized locations table to replace free-text district/upazila.

CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    division TEXT NOT NULL,
    district TEXT NOT NULL,
    upazila TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(district, upazila)
);

-- RLS
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locations are viewable by everyone."
ON public.locations FOR SELECT
USING (true);

CREATE POLICY "Only admins can modify locations."
ON public.locations FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Note: Seeding is meant to be done via an API or Edge Function 
-- mapping src/lib/locations.ts to this table.
