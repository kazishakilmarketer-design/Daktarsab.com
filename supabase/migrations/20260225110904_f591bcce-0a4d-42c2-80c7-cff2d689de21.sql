
-- Create hospitals table for CSV import and upazila-based filtering
CREATE TABLE public.hospitals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'সরকারি', -- সরকারি, বেসরকারি, প্রিমিয়াম
  district TEXT NOT NULL DEFAULT '',
  upazila TEXT NOT NULL DEFAULT '',
  address TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  specialties TEXT[] DEFAULT '{}',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;

-- Hospitals are publicly readable (public health data)
CREATE POLICY "Hospitals are publicly readable"
  ON public.hospitals FOR SELECT
  USING (true);

-- Create indexes for fast filtering
CREATE INDEX idx_hospitals_district ON public.hospitals(district);
CREATE INDEX idx_hospitals_upazila ON public.hospitals(upazila);
CREATE INDEX idx_hospitals_type ON public.hospitals(type);
