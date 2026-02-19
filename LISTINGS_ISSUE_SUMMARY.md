# Listings Visibility Issue - Summary

## Issue Description
Listings are not appearing on the website dashboard for both homeseekers and property owners.

## Root Cause Analysis

### The Problem
The `listings` table has Row Level Security (RLS) enabled, but lacks the necessary policies to allow:
1. Public/authenticated users (homeseekers) to view approved listings
2. Agents to view and manage their own listings

### Why This Happens
When RLS is enabled on a table without proper policies:
- All queries return 0 rows by default
- Even if data exists in the table, users cannot see it
- This is a security feature to prevent unauthorized access

### Evidence from Code
Looking at the dashboard components:

**HomeSeekerDashboard.tsx (Line 75-80):**
```typescript
const { data, error, count } = await supabase
  .from('listings')
  .select('...')
  .eq('is_approved', true)  // Trying to fetch approved listings
  .order('created_at', { ascending: false })
```
❌ This query fails because there's no RLS policy allowing SELECT on approved listings

**AgentDashboard.tsx (Line 68-72):**
```typescript
const { data: listingsData, error: listingsError } = await supabase
  .from('listings')
  .select('*')
  .eq('agent_id', user.id)  // Trying to fetch agent's own listings
  .order('created_at', { ascending: false });
```
❌ This query fails because there's no RLS policy allowing agents to SELECT their own listings

## The Solution

### Files Created
1. **fix_listings_visibility.sql** - The main fix script with 5 RLS policies
2. **FIX_LISTINGS_VISIBILITY.md** - Detailed instructions and troubleshooting
3. **diagnose_listings.sql** - Diagnostic queries to check current state

### What the Fix Does
Adds 5 RLS policies to the listings table:

| Policy | Who | What | Why |
|--------|-----|------|-----|
| Anyone can view approved listings | Everyone | SELECT approved listings | Homeseekers can browse properties |
| Agents can view their own listings | Agents | SELECT their listings | Agents can see their dashboard |
| Agents can insert their own listings | Agents | INSERT new listings | Agents can create properties |
| Agents can update their own listings | Agents | UPDATE their listings | Agents can edit properties |
| Agents can delete their own listings | Agents | DELETE their listings | Agents can remove properties |

## How to Apply the Fix

### Quick Steps:
1. Open Supabase Dashboard → SQL Editor
2. Copy content from `fix_listings_visibility.sql`
3. Paste and click "Run"
4. Refresh your website dashboards

### Verification:
- **Homeseekers**: Should see all approved listings
- **Agents**: Should see all their listings (approved + pending)

## Expected Results

### Before Fix:
- ❌ Homeseeker dashboard: "No properties available yet"
- ❌ Agent dashboard: "No properties listed yet"
- ❌ Database has listings but they're invisible due to RLS

### After Fix:
- ✅ Homeseeker dashboard: Shows all approved listings
- ✅ Agent dashboard: Shows agent's own listings
- ✅ Agents can create, edit, and delete their listings
- ✅ Admins can still manage all listings (existing policies preserved)

## Technical Details

### RLS Policy Syntax
```sql
CREATE POLICY "policy_name" ON table_name
  FOR operation          -- SELECT, INSERT, UPDATE, DELETE, or ALL
  TO role               -- authenticated, anon, or public
  USING (condition)     -- Row-level filter for SELECT/UPDATE/DELETE
  WITH CHECK (condition); -- Row-level filter for INSERT/UPDATE
```

### Why Two Policies for Agents?
1. **"Anyone can view approved listings"** - Allows agents to see approved listings as homeseekers
2. **"Agents can view their own listings"** - Allows agents to see ALL their listings (including pending)

These policies work together using OR logic - if either condition is true, the row is visible.

## Security Considerations

### What's Protected:
- ✅ Agents can only modify their own listings
- ✅ Agents cannot see other agents' pending listings
- ✅ Homeseekers can only see approved listings
- ✅ Admins retain full access (from fix_admin_access.sql)

### What's Allowed:
- ✅ Anyone can view approved listings (public browsing)
- ✅ Agents can manage their own listings
- ✅ Admins can manage all listings

## Troubleshooting

If listings still don't appear after applying the fix:

1. **Run diagnostic script**: `diagnose_listings.sql`
2. **Check for approved listings**: Ensure some listings have `is_approved = true`
3. **Verify policies**: Confirm all 5 policies were created
4. **Check agent_id format**: Must be valid UUID matching auth.uid()
5. **Clear browser cache**: Force refresh (Ctrl+Shift+R)

## Related Issues

This fix also resolves:
- Agents unable to see their listings count
- "No properties found" message despite having listings
- Property upload appearing to work but listings not showing
- Analytics showing 0 listings despite database having data

## Next Steps

After applying this fix:
1. Test homeseeker dashboard - should show approved listings
2. Test agent dashboard - should show agent's listings
3. Test creating a new listing - should appear immediately
4. Test editing a listing - should work
5. Test deleting a listing - should work

## Support

If you encounter issues:
- Check the FIX_LISTINGS_VISIBILITY.md for detailed troubleshooting
- Run diagnose_listings.sql to gather diagnostic information
- Verify your Supabase project has the correct table structure
