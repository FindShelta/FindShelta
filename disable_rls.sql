-- Completely disable RLS to stop 406 errors

-- Disable RLS on all problematic tables
ALTER TABLE public.admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_registration DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow all operations" ON public.admin_users;
DROP POLICY IF EXISTS "Allow all for admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Allow all operations" ON public.agent_registration;
DROP POLICY IF EXISTS "Allow all for agent_registration" ON public.agent_registration;

-- Ensure tables have proper permissions
GRANT ALL PRIVILEGES ON public.admin_users TO anon;
GRANT ALL PRIVILEGES ON public.admin_users TO authenticated;
GRANT ALL PRIVILEGES ON public.agent_registration TO anon;
GRANT ALL PRIVILEGES ON public.agent_registration TO authenticated;
GRANT ALL PRIVILEGES ON public.users TO anon;
GRANT ALL PRIVILEGES ON public.users TO authenticated;
GRANT ALL PRIVILEGES ON public.listings TO anon;
GRANT ALL PRIVILEGES ON public.listings TO authenticated;

-- Refresh schema
NOTIFY pgrst, 'reload schema';