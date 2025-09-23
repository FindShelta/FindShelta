-- Complete fix for user profile issues

-- 1. Drop and recreate the users table with correct structure
DROP TABLE IF EXISTS public.users CASCADE;

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('agent', 'home_seeker', 'admin')) DEFAULT 'home_seeker',
  whatsapp_number TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  theme_preference TEXT DEFAULT 'light',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Create simple, permissive RLS policies
CREATE POLICY "Enable all operations for authenticated users" ON public.users
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read for anonymous users" ON public.users
  FOR SELECT USING (true);

-- 4. Create the trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id, 
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
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    whatsapp_number = EXCLUDED.whatsapp_number,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 6. Create profiles for existing auth users (if any)
INSERT INTO public.users (id, email, full_name, role, is_verified, is_active, created_at, updated_at)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', email),
  COALESCE(raw_user_meta_data->>'role', 'home_seeker'),
  false,
  true,
  created_at,
  NOW()
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 7. Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON public.users(is_active);