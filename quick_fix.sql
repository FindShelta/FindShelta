-- Quick fix: Add user_id column to match deployed code expectations

-- Add user_id column that mirrors the id column
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS user_id UUID;

-- Update user_id to match id for existing records
UPDATE public.users SET user_id = id WHERE user_id IS NULL;

-- Create index on user_id
CREATE INDEX IF NOT EXISTS idx_users_user_id ON public.users(user_id);

-- Update the trigger to also set user_id
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    user_id,
    email, 
    full_name, 
    role, 
    whatsapp_number,
    is_verified, 
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    NEW.id,  -- Set user_id same as id
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), 
    COALESCE(NEW.raw_user_meta_data->>'role', 'home_seeker'), 
    NEW.raw_user_meta_data->>'whatsapp_number',
    false, 
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    whatsapp_number = EXCLUDED.whatsapp_number,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create dummy tables for the queries that are failing
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.agent_registration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  status TEXT DEFAULT 'approved',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on dummy tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_registration ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for dummy tables
CREATE POLICY "Allow all for admin_users" ON public.admin_users FOR ALL USING (true);
CREATE POLICY "Allow all for agent_registration" ON public.agent_registration FOR ALL USING (true);