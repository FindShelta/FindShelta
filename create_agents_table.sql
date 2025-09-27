-- Create agents table with approval system
CREATE TABLE IF NOT EXISTS agents (
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
  profile_image TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for agents table
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Agents can view their own record
CREATE POLICY "Agents can view own record" ON agents
  FOR SELECT USING (user_id = auth.uid());

-- Agents can update their own record (except status)
CREATE POLICY "Agents can update own record" ON agents
  FOR UPDATE USING (user_id = auth.uid());

-- Admins can view all agents
CREATE POLICY "Admins can view all agents" ON agents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Admins can update agent status
CREATE POLICY "Admins can update agents" ON agents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Anyone can insert (for registration)
CREATE POLICY "Anyone can register as agent" ON agents
  FOR INSERT WITH CHECK (true);

-- Update listings table to reference agents table
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS agent_uuid UUID REFERENCES agents(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_listings_agent_uuid ON listings(agent_uuid);

-- Function to update agent updated_at timestamp
CREATE OR REPLACE FUNCTION update_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_agents_updated_at_trigger ON agents;
CREATE TRIGGER update_agents_updated_at_trigger
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_agents_updated_at();