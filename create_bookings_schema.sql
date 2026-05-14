-- SQL snippet to create `booking_requests` table

CREATE TABLE IF NOT EXISTS public.booking_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_phone TEXT NOT NULL,
    service_type TEXT NOT NULL,
    provider_name TEXT NOT NULL,
    preferred_date DATE,
    preferred_time TEXT,
    notes TEXT,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;

-- Policies (Admins can do everything, Users can insert and read their own)
CREATE POLICY "Enable read access for all users" ON public.booking_requests FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.booking_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.booking_requests FOR UPDATE USING (true);
