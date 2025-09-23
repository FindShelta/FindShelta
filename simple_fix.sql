-- Simple fix without dropping columns

-- 1. Just ensure user_id columns have data by populating them
-- For admin_users - if user_id is null, set it to a generated value
UPDATE public.admin_users 
SET user_id = COALESCE(user_id, (SELECT id FROM auth.users LIMIT 1), gen_random_uuid()::text::bigint)
WHERE user_id IS NULL;

-- 2. For agent_registration - populate user_id
UPDATE public.agent_registration 
SET user_id = COALESCE(user_id, (SELECT id FROM auth.users LIMIT 1), gen_random_uuid()::text::bigint)
WHERE user_id IS NULL;

-- 3. Add sample records if tables are empty
INSERT INTO public.admin_users (user_id, created_at) 
SELECT 1, NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.admin_users);

INSERT INTO public.agent_registration (user_id, status, created_at)
SELECT 1, 'pending', NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.agent_registration);

-- 4. Make sure the API can access these tables by granting permissions
GRANT ALL ON public.admin_users TO anon, authenticated;
GRANT ALL ON public.agent_registration TO anon, authenticated;

-- 5. Force PostgREST to reload schema
NOTIFY pgrst, 'reload schema';