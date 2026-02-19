# Quick Fix Guide - Listings Not Appearing

## Problem
Listings are not showing on the dashboard for homeseekers and owners.

## Cause
Missing database permissions (RLS policies) for the listings table.

## Solution (5 minutes)

### Step 1: Diagnose (Optional)
Run `diagnose_listings.sql` in Supabase SQL Editor to see current state.

### Step 2: Apply Fix
1. Open your Supabase project dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire content of `fix_listings_visibility.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. Wait for "Success" message

### Step 3: Verify
Run `verify_listings_fix.sql` in SQL Editor to confirm all policies were created.

### Step 4: Test
1. **For Homeseekers:**
   - Open your website
   - Go to the dashboard
   - You should now see approved listings

2. **For Agents:**
   - Log in as an agent
   - Go to agent dashboard
   - You should see your listings
   - Try creating/editing a listing

## Expected Results

### Before Fix:
```
Homeseeker Dashboard: "No properties available yet"
Agent Dashboard: "No properties listed yet"
```

### After Fix:
```
Homeseeker Dashboard: Shows all approved listings
Agent Dashboard: Shows agent's own listings
```

## If It Still Doesn't Work

1. **Check if you have approved listings:**
   ```sql
   SELECT COUNT(*) FROM listings WHERE is_approved = true;
   ```
   If result is 0, you need to approve some listings first.

2. **Approve a listing manually:**
   ```sql
   UPDATE listings 
   SET is_approved = true, status = 'approved'
   WHERE id = 'your-listing-id';
   ```

3. **Clear browser cache:**
   - Press Ctrl+Shift+R (Windows/Linux)
   - Press Cmd+Shift+R (Mac)

4. **Check browser console for errors:**
   - Press F12
   - Go to Console tab
   - Look for any red error messages

## Files Reference

| File | Purpose |
|------|---------|
| `fix_listings_visibility.sql` | Main fix - adds RLS policies |
| `diagnose_listings.sql` | Check current state |
| `verify_listings_fix.sql` | Verify fix was applied |
| `FIX_LISTINGS_VISIBILITY.md` | Detailed documentation |
| `LISTINGS_ISSUE_SUMMARY.md` | Technical explanation |

## Need Help?

If you're still having issues:
1. Run `diagnose_listings.sql` and share the output
2. Run `verify_listings_fix.sql` and share the results
3. Check browser console for errors (F12)
4. Verify you're logged in with the correct user role

## What This Fix Does

Adds 5 database policies:
1. ✅ Anyone can view approved listings
2. ✅ Agents can view their own listings
3. ✅ Agents can create listings
4. ✅ Agents can edit their listings
5. ✅ Agents can delete their listings

## Security

- Agents can only modify their own listings
- Homeseekers can only see approved listings
- Admins can manage all listings (existing policies preserved)
