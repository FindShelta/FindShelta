# Database Query Fix - Vercel Deploy

## Issue
The application was not fetching listings from the database due to incorrect column names in queries.

## Root Cause
- Code was using `approved` and `rejected` columns
- Actual database uses `is_approved` column (no `rejected` column exists)
- Queries were timing out due to `SELECT *` on large datasets

## Changes Made
1. Updated all queries to use `is_approved` instead of `approved`
2. Removed references to non-existent `rejected` column
3. Changed `SELECT *` to specific field selections to prevent timeouts
4. Fixed admin access control to check `admin_users` table
5. Added DatabaseTest component for debugging

## Database Schema
- Column: `is_approved` (boolean) - indicates if listing is approved
- No `rejected` column - rejections delete the listing
- Total listings: 13 (all currently unapproved)

## Files Modified
- `src/components/Admin/AdminDashboard.tsx`
- `src/components/Dashboard/HomeSeekerDashboard.tsx`
- `src/App.tsx`
- `src/components/Debug/DatabaseTest.tsx` (new)
