-- Disable Row Level Security on agent_registration table
ALTER TABLE agent_registration DISABLE ROW LEVEL SECURITY;

-- Drop any existing RLS policies
DROP POLICY IF EXISTS "Users can view own agent registration" ON agent_registration;
DROP POLICY IF EXISTS "Users can insert own agent registration" ON agent_registration;
DROP POLICY IF EXISTS "Users can update own agent registration" ON agent_registration;
DROP POLICY IF EXISTS "Enable read access for all users" ON agent_registration;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON agent_registration;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON agent_registration;