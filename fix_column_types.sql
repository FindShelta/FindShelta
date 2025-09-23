-- Fix column type mismatches

-- 1. Check what type the id columns actually are and fix admin_users
-- Drop the user_id column and recreate it with the correct type
ALTER TABLE public.admin_users DROP COLUMN IF EXISTS user_id;

-- Add user_id column with the same type as id column
ALTER TABLE public.admin_users ADD COLUMN user_id BIGINT;

-- Update existing records
UPDATE public.admin_users SET user_id = id WHERE user_id IS NULL;

-- 2. Fix agent_registration table similarly
ALTER TABLE public.agent_registration DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.agent_registration ADD COLUMN user_id BIGINT;
UPDATE public.agent_registration SET user_id = id WHERE user_id IS NULL;

-- 3. Also check users table and ensure it has user_id with correct type
-- First check what type the id column is in users table
DO $$
DECLARE
    users_id_type text;
BEGIN
    SELECT data_type INTO users_id_type 
    FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'id' AND table_schema = 'public';
    
    -- Drop and recreate user_id column in users table with correct type
    ALTER TABLE public.users DROP COLUMN IF EXISTS user_id;
    
    IF users_id_type = 'uuid' THEN
        ALTER TABLE public.users ADD COLUMN user_id UUID;
        UPDATE public.users SET user_id = id WHERE user_id IS NULL;
    ELSE
        ALTER TABLE public.users ADD COLUMN user_id BIGINT;
        UPDATE public.users SET user_id = id WHERE user_id IS NULL;
    END IF;
END $$;

-- 4. Add some sample data with correct types
INSERT INTO public.admin_users (user_id, created_at) 
VALUES (1, NOW()), (2, NOW()), (3, NOW())
ON CONFLICT DO NOTHING;

INSERT INTO public.agent_registration (user_id, status, created_at)
VALUES (1, 'pending', NOW()), (2, 'approved', NOW())
ON CONFLICT DO NOTHING;

-- 5. Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON public.admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_registration_user_id ON public.agent_registration(user_id);

-- 6. Force schema reload
SELECT pg_notify('pgrst', 'reload schema');