-- Create agents table
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  company_name TEXT,
  license_number TEXT,
  experience_years INTEGER,
  specialization TEXT[],
  bio TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for now to avoid policy issues
ALTER TABLE public.agents DISABLE ROW LEVEL SECURITY;

-- Add agent_uuid column to listings table
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS agent_uuid UUID REFERENCES public.agents(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON public.agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON public.agents(status);