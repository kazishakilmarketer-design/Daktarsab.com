-- Migration: 20260429_cleanup_integrity.sql
-- Description: Consolidates profiles.role to TEXT, drops ENUM user_role, and fixes FK constraints.

-- 1. DB-1: Fix profiles.role duplication and type mismatch
DO $$ 
BEGIN
    -- If the role column is of type user_role (ENUM), we need to change it to TEXT
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'profiles' 
          AND column_name = 'role' 
          AND udt_name = 'user_role'
    ) THEN
        -- Temporarily remove the default to avoid cast issues
        ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;
        
        -- Change type to TEXT
        ALTER TABLE public.profiles ALTER COLUMN role TYPE TEXT USING role::text;
        
        -- Restore default
        ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'patient';
    END IF;
END $$;

-- Drop the enum type if it exists (now that no column uses it)
DROP TYPE IF EXISTS public.user_role;

-- Ensure the TEXT column has the correct check constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS valid_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT valid_role_check 
    CHECK (role IN ('patient', 'doctor', 'admin', 'kazi', 'partner'));

-- 2. DB-3: booking_requests.user_id FK constraint
-- Ensure it's a UUID and linked to auth.users
ALTER TABLE public.booking_requests 
    ALTER COLUMN user_id TYPE UUID USING user_id::uuid;

ALTER TABLE public.booking_requests
    DROP CONSTRAINT IF EXISTS booking_requests_user_id_fkey,
    ADD CONSTRAINT booking_requests_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. DB-4: leads.user_id FK constraint
ALTER TABLE public.leads 
    ALTER COLUMN user_id TYPE UUID USING user_id::uuid;

ALTER TABLE public.leads
    DROP CONSTRAINT IF EXISTS leads_user_id_fkey,
    ADD CONSTRAINT leads_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Enable RLS on leads if not already enabled
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 5. Add Policy for users to see their own leads
DROP POLICY IF EXISTS "Users can view own leads" ON public.leads;
CREATE POLICY "Users can view own leads" 
ON public.leads FOR SELECT 
USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
));
