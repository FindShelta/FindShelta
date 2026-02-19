-- Verification script to test if the fix was applied successfully
-- Run this AFTER applying fix_listings_visibility.sql

-- Test 1: Check if all 5 policies exist
SELECT 
  CASE 
    WHEN COUNT(*) = 5 THEN '✅ PASS: All 5 policies exist'
    ELSE '❌ FAIL: Expected 5 policies, found ' || COUNT(*)::text
  END as "Test 1: Policy Count"
FROM pg_policies 
WHERE tablename = 'listings'
  AND policyname IN (
    'Anyone can view approved listings',
    'Agents can view their own listings',
    'Agents can insert their own listings',
    'Agents can update their own listings',
    'Agents can delete their own listings'
  );

-- Test 2: Check if SELECT policy for approved listings exists
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ PASS: Public can view approved listings'
    ELSE '❌ FAIL: Missing policy for viewing approved listings'
  END as "Test 2: Public View Policy"
FROM pg_policies 
WHERE tablename = 'listings'
  AND policyname = 'Anyone can view approved listings'
  AND cmd = 'SELECT';

-- Test 3: Check if agents can view their own listings
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ PASS: Agents can view their own listings'
    ELSE '❌ FAIL: Missing policy for agents to view own listings'
  END as "Test 3: Agent View Policy"
FROM pg_policies 
WHERE tablename = 'listings'
  AND policyname = 'Agents can view their own listings'
  AND cmd = 'SELECT';

-- Test 4: Check if agents can insert listings
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ PASS: Agents can insert listings'
    ELSE '❌ FAIL: Missing policy for agents to insert listings'
  END as "Test 4: Agent Insert Policy"
FROM pg_policies 
WHERE tablename = 'listings'
  AND policyname = 'Agents can insert their own listings'
  AND cmd = 'INSERT';

-- Test 5: Check if agents can update their listings
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ PASS: Agents can update their listings'
    ELSE '❌ FAIL: Missing policy for agents to update listings'
  END as "Test 5: Agent Update Policy"
FROM pg_policies 
WHERE tablename = 'listings'
  AND policyname = 'Agents can update their own listings'
  AND cmd = 'UPDATE';

-- Test 6: Check if agents can delete their listings
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ PASS: Agents can delete their listings'
    ELSE '❌ FAIL: Missing policy for agents to delete listings'
  END as "Test 6: Agent Delete Policy"
FROM pg_policies 
WHERE tablename = 'listings'
  AND policyname = 'Agents can delete their own listings'
  AND cmd = 'DELETE';

-- Test 7: Check if there are approved listings to display
SELECT 
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ PASS: ' || COUNT(*)::text || ' approved listings available'
    ELSE '⚠️  WARNING: No approved listings found (homeseekers will see empty dashboard)'
  END as "Test 7: Approved Listings"
FROM listings 
WHERE is_approved = true;

-- Test 8: Summary of all policies
SELECT 
  '📋 Policy Summary' as "Summary",
  COUNT(*) as "Total Policies"
FROM pg_policies 
WHERE tablename = 'listings';

-- Test 9: List all policies for review
SELECT 
  policyname as "Policy Name",
  cmd as "Operation",
  CASE 
    WHEN roles = '{public}' THEN 'Public'
    WHEN roles = '{authenticated}' THEN 'Authenticated Users'
    ELSE roles::text
  END as "Applies To"
FROM pg_policies 
WHERE tablename = 'listings'
ORDER BY cmd, policyname;

-- Final Result
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'listings' 
          AND policyname IN (
            'Anyone can view approved listings',
            'Agents can view their own listings',
            'Agents can insert their own listings',
            'Agents can update their own listings',
            'Agents can delete their own listings'
          )) = 5 
    THEN '🎉 SUCCESS: All policies are in place! Listings should now be visible.'
    ELSE '❌ INCOMPLETE: Some policies are missing. Please re-run fix_listings_visibility.sql'
  END as "Final Result";
