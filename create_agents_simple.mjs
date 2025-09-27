import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vvtldnyxnqmfhlpascel.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dGxkbnl4bnFtZmhscGFzY2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMjk2MzgsImV4cCI6MjA2NzkwNTYzOH0.VQgDoVUH1n-G4prQoO-BfDWDOMpia7Xlkbk7skkcGy8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAgentsTable() {
  try {
    // First, let's try to create the table directly
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .limit(1);
    
    if (error && error.code === 'PGRST116') {
      console.log('Agents table does not exist, need to create it manually in Supabase dashboard');
      console.log('Please create the agents table with the following structure:');
      console.log(`
CREATE TABLE agents (
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
      `);
    } else {
      console.log('Agents table already exists or accessible');
    }
    
    // Try to add agent_uuid column to listings if it doesn't exist
    const { error: alterError } = await supabase
      .from('listings')
      .select('agent_uuid')
      .limit(1);
    
    if (alterError) {
      console.log('Need to add agent_uuid column to listings table');
    }
    
  } catch (err) {
    console.error('Error:', err);
  }
}

createAgentsTable();