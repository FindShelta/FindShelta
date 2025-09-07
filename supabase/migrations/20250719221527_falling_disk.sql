/*
  # Create admin_users table for role management

  1. New Tables
    - `admin_users`
      - `id` (bigint, primary key)
      - `user_id` (uuid, references auth.users)
      - `email` (text, unique)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `admin_users` table
    - Add policy for admin access only
*/

CREATE TABLE IF NOT EXISTS admin_users (
  id bigserial PRIMARY KEY,
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy to allow admins to read admin_users table
CREATE POLICY "Admins can read admin_users table"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT user_id FROM admin_users
    )
  );

-- Policy to allow service role to insert admin users
CREATE POLICY "Service role can manage admin_users"
  ON admin_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert the specific admin user
INSERT INTO admin_users (user_id, email) 
VALUES ('91be2e50-c55a-47ff-8239-d949191ea0df', 'agantiembennett@gmail.com')
ON CONFLICT (user_id) DO NOTHING;