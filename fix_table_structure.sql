-- Fix table structure to match deployed code expectations

-- 1. Ensure admin_users table has user_id column
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS user_id UUID;

-- Update existing records to have user_id
UPDATE public.admin_users SET user_id = id WHERE user_id IS NULL;

-- 2. Ensure agent_registration table has user_id column  
ALTER TABLE public.agent_registration ADD COLUMN IF NOT EXISTS user_id UUID;

-- Update existing records to have user_id
UPDATE public.agent_registration SET user_id = id WHERE user_id IS NULL;

-- 3. Add some sample data to prevent empty table errors
INSERT INTO public.admin_users (id, user_id, created_at) 
VALUES (gen_random_uuid(), gen_random_uuid(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO public.agent_registration (id, user_id, status, created_at)
VALUES (gen_random_uuid(), gen_random_uuid(), 'pending', NOW())
ON CONFLICT DO NOTHING;

-- 4. Create indexes on user_id columns
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_registration_user_id ON public.agent_registration(user_id);

-- 5. Grant all permissions explicitly
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 6. Force schema reload
SELECT pg_notify('pgrst', 'reload schema');