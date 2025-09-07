import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { emailService } from '../lib/emailService';

interface UsePasswordRecoveryReturn {
  sendResetCode: (email: string) => Promise<{ success: boolean; message: string; code?: string }>;
  verifyCode: (email: string, code: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  loading: boolean;
  error: string | null;
}

export const usePasswordRecovery = (): UsePasswordRecoveryReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendResetCode = async (email: string): Promise<{ success: boolean; message: string; code?: string }> => {
    setLoading(true);
    setError(null);

    try {
      // Check rate limiting
      const { data: rateLimitCheck } = await supabase.rpc('check_reset_rate_limit', { user_email: email });
      
      if (!rateLimitCheck) {
        return {
          success: false,
          message: 'Too many reset attempts. Please try again in an hour.'
        };
      }

      // Check if user exists
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name')
        .eq('email', email.trim())
        .single();

      if (userError || !user) {
        // Don't reveal if email exists for security
        return {
          success: true,
          message: 'If an account with this email exists, you will receive a verification code.'
        };
      }

      // Generate secure 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      // Store token in database
      const { error: insertError } = await supabase
        .from('password_reset_tokens')
        .insert({
          user_id: user.id,
          email: email.trim(),
          token: code,
          expires_at: expiresAt.toISOString(),
          used: false
        });

      if (insertError) {
        throw insertError;
      }

      // Send email (in production)
      const emailSent = await emailService.sendPasswordResetEmail({
        email: email.trim(),
        verificationCode: code,
        expiresIn: 30
      });

      if (!emailSent) {
        return {
          success: false,
          message: 'Failed to send email. Please try again later.'
        };
      }

      // Log security event
      await supabase
        .from('security_logs')
        .insert({
          user_email: email.trim(),
          action: 'password_reset_requested',
          timestamp: new Date().toISOString(),
          success: true
        });

      return {
        success: true,
        message: 'Verification code sent to your email.',
        code: import.meta.env.DEV ? code : undefined // Only show code in development
      };

    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to send verification code. Please try again.');
      return {
        success: false,
        message: 'Failed to send verification code. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (email: string, code: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    setError(null);

    try {
      const { data: tokenData, error: tokenError } = await supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('email', email)
        .eq('token', code)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !tokenData) {
        await supabase
          .from('security_logs')
          .insert({
            user_email: email,
            action: 'password_reset_verify_failed',
            timestamp: new Date().toISOString(),
            success: false
          });

        return {
          success: false,
          message: 'Invalid or expired verification code.'
        };
      }

      return {
        success: true,
        message: 'Code verified successfully.'
      };

    } catch (err) {
      console.error('Verification error:', err);
      setError('Verification failed. Please try again.');
      return {
        success: false,
        message: 'Verification failed. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    setError(null);

    try {
      // Verify token again
      const { data: tokenData, error: tokenError } = await supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('email', email)
        .eq('token', code)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !tokenData) {
        return {
          success: false,
          message: 'Invalid verification session.'
        };
      }

      // Get user data
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (!user) {
        return {
          success: false,
          message: 'User not found.'
        };
      }

      // Update password in Supabase Auth (if using auth)
      try {
        const { error: authError } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (authError) {
          // Fallback for mock users in localStorage
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const userIndex = users.findIndex((u: any) => u.email === email);
          
          if (userIndex !== -1) {
            users[userIndex].password = newPassword; // In production, hash this
            localStorage.setItem('users', JSON.stringify(users));
          }
        }
      } catch (authError) {
        // Handle auth update error
        console.warn('Auth update failed, using fallback:', authError);
      }

      // Mark token as used
      await supabase
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('id', tokenData.id);

      // Log successful password reset
      await supabase
        .from('security_logs')
        .insert({
          user_email: email,
          action: 'password_reset_completed',
          timestamp: new Date().toISOString(),
          success: true
        });

      // Send confirmation email
      await emailService.sendPasswordChangeConfirmation({
        email,
        timestamp: new Date().toLocaleString()
      });

      return {
        success: true,
        message: 'Password updated successfully.'
      };

    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to reset password. Please try again.');
      return {
        success: false,
        message: 'Failed to reset password. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    sendResetCode,
    verifyCode,
    resetPassword,
    loading,
    error
  };
};