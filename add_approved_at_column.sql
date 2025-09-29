-- Add approved_at column to track when agent was approved
ALTER TABLE public.agent_registration ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Update existing approved agents to have approval date as created_at
UPDATE public.agent_registration 
SET approved_at = created_at 
WHERE status = 'approved' AND approved_at IS NULL;