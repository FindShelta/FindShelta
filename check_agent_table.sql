-- Check current agent_registration table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'agent_registration'
ORDER BY ordinal_position;

-- If table doesn't exist or columns are missing, create/update it
CREATE TABLE IF NOT EXISTS agent_registration (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  experience_years INTEGER DEFAULT 0,
  specialization TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id)
);

-- Disable RLS if needed
ALTER TABLE agent_registration DISABLE ROW LEVEL SECURITY;