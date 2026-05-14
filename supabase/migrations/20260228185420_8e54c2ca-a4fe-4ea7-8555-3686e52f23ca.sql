
-- Create doctors table
CREATE TABLE public.doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_name TEXT NOT NULL,
  qualification TEXT NOT NULL DEFAULT '',
  specialization TEXT NOT NULL DEFAULT '',
  designation TEXT NOT NULL DEFAULT '',
  chamber TEXT NOT NULL DEFAULT '',
  division TEXT NOT NULL DEFAULT '',
  image_url TEXT DEFAULT NULL,
  profile_url TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Doctors are publicly readable"
ON public.doctors
FOR SELECT
USING (true);

-- Create index for division-based filtering
CREATE INDEX idx_doctors_division ON public.doctors(division);
CREATE INDEX idx_doctors_specialization ON public.doctors USING GIN(to_tsvector('english', specialization));
