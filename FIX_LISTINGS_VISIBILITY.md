# Fix Listings Visibility Issue

## Problem
Listings are not appearing on the website dashboard for both homeseekers and owners.

## Root Cause
The `listings` table has Row Level Security (RLS) enabled, but there are no policies that allow:
1. **Homeseekers** to view approved listings
2. **Agents/Owners** to view and manage their own listings

## Solution
Run the `fix_listings_visibility.sql` script to add the necessary RLS policies.

## How to Apply the Fix

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `fix_listings_visibility.sql`
4. Copy and paste the entire content into the SQL Editor
5. Click **Run** to execute the script

### Option 2: Using Supabase CLI
```bash
# Make sure you're in the project directory
cd d:\FindShelta

# Run the SQL script
supabase db execute -f fix_listings_visibility.sql
```

### Option 3: Using psql (if you have direct database access)
```bash
psql -h your-db-host -U your-username -d your-database -f fix_listings_visibility.sql
```

## What the Fix Does

The script creates 5 RLS policies:

1. **"Anyone can view approved listings"**
   - Allows all users (authenticated or not) to view listings where `is_approved = true`
   - This enables homeseekers to see properties on the dashboard

2. **"Agents can view their own listings"**
   - Allows authenticated agents to view ALL their own listings (approved or pending)
   - This enables agents to see their listings in the agent dashboard

3. **"Agents can insert their own listings"**
   - Allows authenticated agents to create new listings
   - Ensures agents can only create listings for themselves

4. **"Agents can update their own listings"**
   - Allows authenticated agents to edit their own listings
   - Prevents agents from editing other agents' listings

5. **"Agents can delete their own listings"**
   - Allows authenticated agents to delete their own listings
   - Prevents agents from deleting other agents' listings

## Verification

After applying the fix, verify it works:

### For Homeseekers:
1. Open the website as a homeseeker (or logged out)
2. Navigate to the dashboard
3. You should now see all approved listings

### For Agents:
1. Log in as an agent
2. Navigate to the agent dashboard
3. You should see all your listings (both approved and pending)
4. Try creating a new listing - it should work
5. Try editing/deleting your listing - it should work

## Troubleshooting

### If listings still don't appear:

1. **Check if RLS is enabled on the listings table:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' AND tablename = 'listings';
   ```
   - If `rowsecurity` is `false`, RLS is disabled and policies won't work

2. **Check if there are any approved listings:**
   ```sql
   SELECT COUNT(*) FROM listings WHERE is_approved = true;
   ```
   - If count is 0, there are no approved listings to display

3. **Check if policies were created:**
   ```sql
   SELECT policyname, cmd, qual 
   FROM pg_policies 
   WHERE tablename = 'listings';
   ```
   - You should see 5 policies listed

4. **Check agent_id format:**
   - Ensure `agent_id` in listings table matches `auth.uid()` format (UUID)
   - Run: `SELECT agent_id, auth.uid() FROM listings LIMIT 1;`

### If you get permission errors:

Make sure you're running the script with sufficient privileges (service_role or postgres user).

## Additional Notes

- The admin policies from `fix_admin_access.sql` are still in place and work alongside these policies
- Admins can view, update, and delete ALL listings regardless of ownership
- These policies follow the principle of least privilege - users can only access what they need

## Related Files
- `fix_listings_visibility.sql` - The main fix script
- `fix_admin_access.sql` - Admin-specific policies (already applied)
- `src/components/Dashboard/HomeSeekerDashboard.tsx` - Homeseeker dashboard component
- `src/components/Dashboard/AgentDashboard.tsx` - Agent dashboard component
