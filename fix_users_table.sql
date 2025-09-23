-- Fix the users table structure and RLS policies

-- First, check if there's a user_id column and remove it if it exists
ALTER TABLE public.users DROP COLUMN IF EXISTS user_id;

-- Ensure the id column is properly set up as primary key referencing auth.users
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Add proper constraints
ALTER TABLE public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE public.users ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies to be more permissive for testing
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Anyone can read user public info" ON public.users;
DROP POLICY IF EXISTS "Enable select for all on users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for all on users" ON public.users;
DROP POLICY IF EXISTS "Users select own" ON public.users;
DROP POLICY IF EXISTS "Users insert own" ON public.users;
DROP POLICY IF EXISTS "Users update own" ON public.users;
DROP POLICY IF EXISTS "Users delete own" ON public.users;

-- Create simple, permissive policies for testing
CREATE POLICY "Allow all operations for authenticated users" ON public.users
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access for anonymous users" ON public.users
  FOR SELECT USING (true);

-- Ensure the trigger function is working correctly
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

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();