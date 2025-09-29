-- Add missing columns to agent_registration table
ALTER TABLE public.agent_registration ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.agent_registration ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.agent_registration ADD COLUMN IF NOT EXISTS license_number TEXT;
ALTER TABLE public.agent_registration ADD COLUMN IF NOT EXISTS experience_years INTEGER;
ALTER TABLE public.agent_registration ADD COLUMN IF NOT EXISTS specialization TEXT[];
ALTER TABLE public.agent_registration ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.agent_registration ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;