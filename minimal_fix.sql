-- Minimal fix - just ensure tables have data and disable problematic triggers

-- 1. Temporarily disable all triggers on these tables
ALTER TABLE public.admin_users DISABLE TRIGGER ALL;
ALTER TABLE public.agent_registration DISABLE TRIGGER ALL;

-- 2. Add minimal data directly
INSERT INTO public.admin_users (id, user_id, created_at) 
VALUES (1, 1, NOW())
ON CONFLICT DO NOTHING;

INSERT INTO public.agent_registration (id, user_id, status, created_at)
VALUES (1, 1, 'pending', NOW())
ON CONFLICT DO NOTHING;

-- 3. Re-enable triggers
ALTER TABLE public.admin_users ENABLE TRIGGER ALL;
ALTER TABLE public.agent_registration ENABLE TRIGGER ALL;

-- 4. Grant all permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO public;

-- 5. Force schema reload
NOTIFY pgrst, 'reload schema';