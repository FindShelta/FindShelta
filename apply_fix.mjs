import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vvtldnyxnqmfhlpascel.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2dGxkbnl4bnFtZmhscGFzY2VsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzMjk2MzgsImV4cCI6MjA2NzkwNTYzOH0.VQgDoVUH1n-G4prQoO-BfDWDOMpia7Xlkbk7skkcGy8';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const sql = `
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view approved listings" ON public.listings;
DROP POLICY IF EXISTS "Agents can view their own listings" ON public.listings;
DROP POLICY IF EXISTS "Agents can insert their own listings" ON public.listings;
DROP POLICY IF EXISTS "Agents can update their own listings" ON public.listings;
DROP POLICY IF EXISTS "Agents can delete their own listings" ON public.listings;

-- Policy 1: Allow anyone to view approved listings
CREATE POLICY "Anyone can view approved listings" ON public.listings
  FOR SELECT
  USING (is_approved = true);

-- Policy 2: Allow agents to view all their own listings
CREATE POLICY "Agents can view their own listings" ON public.listings
  FOR SELECT
  TO authenticated
  USING (agent_id = auth.uid());

-- Policy 3: Allow agents to insert their own listings
CREATE POLICY "Agents can insert their own listings" ON public.listings
  FOR INSERT
  TO authenticated
  WITH CHECK (agent_id = auth.uid());

-- Policy 4: Allow agents to update their own listings
CREATE POLICY "Agents can update their own listings" ON public.listings
  FOR UPDATE
  TO authenticated
  USING (agent_id = auth.uid())
  WITH CHECK (agent_id = auth.uid());

-- Policy 5: Allow agents to delete their own listings
CREATE POLICY "Agents can delete their own listings" ON public.listings
  FOR DELETE
  TO authenticated
  USING (agent_id = auth.uid());
`;

console.log('🔧 Applying RLS policies fix...\n');

const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

if (error) {
  console.error('❌ Error:', error.message);
  console.log('\n⚠️  The anon key cannot execute DDL commands.');
  console.log('📋 Please run fix_listings_visibility.sql manually in Supabase Dashboard:\n');
  console.log('1. Go to: https://supabase.com/dashboard/project/vvtldnyxnqmfhlpascel/sql');
  console.log('2. Copy content from fix_listings_visibility.sql');
  console.log('3. Paste and click Run\n');
} else {
  console.log('✅ Success! RLS policies applied.');
  console.log('🎉 Listings should now be visible on dashboards.\n');
}
