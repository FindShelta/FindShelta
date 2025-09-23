-- Type-safe fix for user_id columns

-- 1. Check what type user_id actually is and populate accordingly
DO $$
DECLARE
    admin_user_id_type text;
    agent_user_id_type text;
BEGIN
    -- Get the actual data type of user_id in admin_users
    SELECT data_type INTO admin_user_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'admin_users' AND column_name = 'user_id' AND table_schema = 'public';
    
    -- Get the actual data type of user_id in agent_registration
    SELECT data_type INTO agent_user_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'agent_registration' AND column_name = 'user_id' AND table_schema = 'public';
    
    -- Fix admin_users based on its actual type
    IF admin_user_id_type = 'uuid' THEN
        UPDATE public.admin_users 
        SET user_id = COALESCE(user_id, gen_random_uuid())
        WHERE user_id IS NULL;
        
        INSERT INTO public.admin_users (user_id, created_at) 
        SELECT gen_random_uuid(), NOW()
        WHERE NOT EXISTS (SELECT 1 FROM public.admin_users);
    ELSE
        UPDATE public.admin_users 
        SET user_id = COALESCE(user_id, 1)
        WHERE user_id IS NULL;
        
        INSERT INTO public.admin_users (user_id, created_at) 
        SELECT 1, NOW()
        WHERE NOT EXISTS (SELECT 1 FROM public.admin_users);
    END IF;
    
    -- Fix agent_registration based on its actual type
    IF agent_user_id_type = 'uuid' THEN
        UPDATE public.agent_registration 
        SET user_id = COALESCE(user_id, gen_random_uuid())
        WHERE user_id IS NULL;
        
        INSERT INTO public.agent_registration (user_id, status, created_at)
        SELECT gen_random_uuid(), 'pending', NOW()
        WHERE NOT EXISTS (SELECT 1 FROM public.agent_registration);
    ELSE
        UPDATE public.agent_registration 
        SET user_id = COALESCE(user_id, 1)
        WHERE user_id IS NULL;
        
        INSERT INTO public.agent_registration (user_id, status, created_at)
        SELECT 1, 'pending', NOW()
        WHERE NOT EXISTS (SELECT 1 FROM public.agent_registration);
    END IF;
END $$;

-- 2. Grant permissions
GRANT ALL ON public.admin_users TO anon, authenticated;
GRANT ALL ON public.agent_registration TO anon, authenticated;

-- 3. Force schema reload
NOTIFY pgrst, 'reload schema';