-- Fix listings visibility for homeseekers and owners
-- This script adds RLS policies to allow users to view and manage listings

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view approved listings" ON public.listings;
DROP POLICY IF EXISTS "Agents can view their own listings" ON public.listings;
DROP POLICY IF EXISTS "Agents can insert their own listings" ON public.listings;
DROP POLICY IF EXISTS "Agents can update their own listings" ON public.listings;
DROP POLICY IF EXISTS "Agents can delete their own listings" ON public.listings;

-- Policy 1: Allow anyone (authenticated or not) to view approved listings
CREATE POLICY "Anyone can view approved listings" ON public.listings
  FOR SELECT
  USING (is_approved = true);

-- Policy 2: Allow agents to view all their own listings (approved or not)
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
