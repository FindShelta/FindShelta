-- Disable RLS on agent_registration table temporarily
ALTER TABLE public.agent_registration DISABLE ROW LEVEL SECURITY;

-- Add missing columns if they don't exist
ALTER TABLE public.agent_registration ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE public.agent_registration ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Update existing records to have pending status
UPDATE public.agent_registration SET status = 'pending' WHERE status IS NULL;