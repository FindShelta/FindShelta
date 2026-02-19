-- Diagnostic script to check listings table and RLS policies
-- Run this to understand the current state before applying the fix

-- 1. Check if RLS is enabled on listings table
SELECT 
  tablename, 
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'listings';

-- 2. Check existing RLS policies on listings table
SELECT 
  policyname as "Policy Name",
  cmd as "Command",
  roles as "Roles",
  qual as "USING Expression",
  with_check as "WITH CHECK Expression"
FROM pg_policies 
WHERE tablename = 'listings'
ORDER BY policyname;

-- 3. Count total listings
SELECT COUNT(*) as "Total Listings" FROM listings;

-- 4. Count approved listings (what homeseekers should see)
SELECT COUNT(*) as "Approved Listings" FROM listings WHERE is_approved = true;

-- 5. Count pending listings
SELECT COUNT(*) as "Pending Listings" FROM listings WHERE is_approved = false OR is_approved IS NULL;

-- 6. Check listings by status
SELECT 
  status,
  is_approved,
  COUNT(*) as count
FROM listings
GROUP BY status, is_approved
ORDER BY status, is_approved;

-- 7. Sample of listings data (first 5)
SELECT 
  id,
  title,
  agent_id,
  is_approved,
  status,
  created_at
FROM listings
ORDER BY created_at DESC
LIMIT 5;

-- 8. Check if agent_id matches UUID format
SELECT 
  agent_id,
  CASE 
    WHEN agent_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
    THEN 'Valid UUID'
    ELSE 'Invalid UUID'
  END as "UUID Format Check"
FROM listings
LIMIT 5;

-- 9. Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'listings'
ORDER BY ordinal_position;
