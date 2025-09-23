-- Working fix - use existing users and just ensure data exists

-- 1. Get an existing user ID from auth.users to use
DO $$
DECLARE
    existing_user_id uuid;
BEGIN
    -- Get any existing user ID
    SELECT id INTO existing_user_id FROM auth.users LIMIT 1;
    
    -- If we have a user, use their ID, otherwise create dummy data
    IF existing_user_id IS NOT NULL THEN
        -- Add to admin_users using existing user ID
        INSERT INTO public.admin_users (user_id, created_at) 
        VALUES (existing_user_id, NOW())
        ON CONFLICT DO NOTHING;
        
        -- Add to agent_registration using existing user ID  
        INSERT INTO public.agent_registration (user_id, status, created_at)
        VALUES (existing_user_id, 'pending', NOW())
        ON CONFLICT DO NOTHING;
    ELSE
        -- No users exist, just add dummy records that won't trigger validation
        INSERT INTO public.admin_users (created_at) 
        VALUES (NOW())
        ON CONFLICT DO NOTHING;
        
        INSERT INTO public.agent_registration (status, created_at)
        VALUES ('pending', NOW())
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 2. Make sure all tables are accessible
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_users TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_registration TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO anon, authenticated;

-- 3. Force schema reload
NOTIFY pgrst, 'reload schema';