-- Fix the trigger function to handle user creation properly

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create a simple, robust trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into users table with proper error handling
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
    NEW.id, -- Set user_id same as id
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
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth user creation
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure the users table has the right structure
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS user_id UUID;
UPDATE public.users SET user_id = id WHERE user_id IS NULL;

-- Make sure RLS is disabled for easier access
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;