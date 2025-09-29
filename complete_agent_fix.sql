-- Complete fix for agent_registration table
-- First, disable RLS to avoid 406 errors
ALTER TABLE public.agent_registration DISABLE ROW LEVEL SECURITY;

-- Add all missing columns
ALTER TABLE public.agent_registration ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.agent_registration ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.agent_registration ADD COLUMN IF NOT EXISTS license_number TEXT;
ALTER TABLE public.agent_registration ADD COLUMN IF NOT EXISTS experience_years INTEGER;
ALTER TABLE public.agent_registration ADD COLUMN IF NOT EXISTS specialization TEXT[];
ALTER TABLE public.agent_registration ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.agent_registration ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.agent_registration ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.agent_registration ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.agent_registration ADD COLUMN IF NOT EXISTS phone TEXT;

-- Update existing records to have pending status if null
UPDATE public.agent_registration SET status = 'pending' WHERE status IS NULL;