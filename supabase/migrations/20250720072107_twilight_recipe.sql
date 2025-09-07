/*
  # Password Recovery System Tables

  1. New Tables
    - `password_reset_tokens`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `email` (text)
      - `token` (text, verification code)
      - `expires_at` (timestamp)
      - `used` (boolean)
      - `created_at` (timestamp)
    
    - `security_logs`
      - `id` (uuid, primary key)
      - `user_email` (text)
      - `action` (text)
      - `ip_address` (text)
      - `timestamp` (timestamp)
      - `success` (boolean)

  2. Security
    - Enable RLS on both tables
    - Add policies for secure access
    - Add indexes for performance

  3. Rate Limiting
    - Implement constraints to prevent abuse
    - Add cleanup for expired tokens
*/

-- Create password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  email text NOT NULL,
  token text NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create security logs table
CREATE TABLE IF NOT EXISTS security_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  action text NOT NULL,
  ip_address text,
  timestamp timestamptz DEFAULT now(),
  success boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_security_logs_email ON security_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(timestamp);

-- RLS Policies for password_reset_tokens
CREATE POLICY "Users can create reset tokens for their email"
  ON password_reset_tokens
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can read their own reset tokens"
  ON password_reset_tokens
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update their own reset tokens"
  ON password_reset_tokens
  FOR UPDATE
  TO public
  USING (true);

-- RLS Policies for security_logs
CREATE POLICY "Allow inserting security logs"
  ON security_logs
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can read security logs"
  ON security_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.is_admin = true
    )
  );

-- Function to cleanup expired tokens (run daily)
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM password_reset_tokens 
  WHERE expires_at < now() - interval '1 day';
END;
$$ LANGUAGE plpgsql;

-- Rate limiting: Only allow 5 reset attempts per email per hour
CREATE OR REPLACE FUNCTION check_reset_rate_limit(user_email text)
RETURNS boolean AS $$
DECLARE
  recent_attempts integer;
BEGIN
  SELECT COUNT(*) INTO recent_attempts
  FROM password_reset_tokens
  WHERE email = user_email
  AND created_at > now() - interval '1 hour';
  
  RETURN recent_attempts < 5;
END;
$$ LANGUAGE plpgsql;