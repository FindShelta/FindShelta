-- Disable RLS on all problematic tables
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agent_registration DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.listings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_users DISABLE ROW LEVEL SECURITY;

-- Add missing columns to agent_registration if needed
ALTER TABLE public.agent_registration ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.agent_registration ADD COLUMN IF NOT EXISTS user_id UUID;

-- Update existing records
UPDATE public.agent_registration SET status = 'pending' WHERE status IS NULL;