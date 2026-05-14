-- ১. Leads টেবিল তৈরি (পার্টনার বিলিং এবং ট্র্যাকিংয়ের জন্য)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    type TEXT,
    doctor_name TEXT,
    hospital_name TEXT,
    specialty TEXT,
    district TEXT,
    user_id UUID,
    partner_type TEXT,
    symptom TEXT,
    condition TEXT,
    source TEXT,
    patient_name TEXT,
    phone TEXT,
    status TEXT DEFAULT 'pending',
    assigned_partner TEXT,
    lead_value INTEGER DEFAULT 200,
    inquiry_details TEXT
);

-- RLS পলিসি (অ্যাডমিন এবং ইনসার্টের জন্য)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read leads" ON public.leads FOR SELECT USING (true);
CREATE POLICY "Anyone can update leads" ON public.leads FOR UPDATE USING (true);


-- ২. Booking Requests টেবিল তৈরি (অ্যাপয়েন্টমেন্ট বুকিংয়ের জন্য)
CREATE TABLE IF NOT EXISTS public.booking_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_name TEXT NOT NULL,
    user_phone TEXT NOT NULL,
    service_type TEXT NOT NULL,
    provider_name TEXT NOT NULL,
    preferred_date TEXT,
    preferred_time TEXT,
    notes TEXT,
    status TEXT DEFAULT 'new'
);

-- RLS পলিসি (বুকিং রিকোয়েস্টের জন্য)
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert booking requests" ON public.booking_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read booking requests" ON public.booking_requests FOR SELECT USING (true);
CREATE POLICY "Anyone can update booking requests" ON public.booking_requests FOR UPDATE USING (true);
