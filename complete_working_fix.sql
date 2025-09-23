-- Complete working fix - include all required columns

DO $$
DECLARE
    existing_user_id uuid;
    existing_user_email text;
    existing_user_name text;
BEGIN
    -- Get an existing user with all data
    SELECT id, email, COALESCE(raw_user_meta_data->>'name', email) 
    INTO existing_user_id, existing_user_email, existing_user_name
    FROM auth.users LIMIT 1;
    
    -- If we have a user, use their data
    IF existing_user_id IS NOT NULL THEN
        -- Add to admin_users with all required fields
        INSERT INTO public.admin_users (user_id, email, full_name, created_at) 
        VALUES (existing_user_id, existing_user_email, existing_user_name, NOW())
        ON CONFLICT DO NOTHING;
        
        -- Add to agent_registration with all required fields
        INSERT INTO public.agent_registration (user_id, email, full_name, status, created_at)
        VALUES (existing_user_id, existing_user_email, existing_user_name, 'pending', NOW())
        ON CONFLICT DO NOTHING;
    ELSE
        -- No users exist, create with dummy data
        INSERT INTO public.admin_users (user_id, email, full_name, created_at) 
        VALUES (gen_random_uuid(), 'admin@example.com', 'Admin User', NOW())
        ON CONFLICT DO NOTHING;
        
        INSERT INTO public.agent_registration (user_id, email, full_name, status, created_at)
        VALUES (gen_random_uuid(), 'agent@example.com', 'Agent User', 'pending', NOW())
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Grant permissions
GRANT ALL ON public.admin_users TO anon, authenticated;
GRANT ALL ON public.agent_registration TO anon, authenticated;

-- Force schema reload
NOTIFY pgrst, 'reload schema';