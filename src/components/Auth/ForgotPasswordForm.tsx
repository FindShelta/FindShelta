import React, { useState } from 'react';
import { ArrowLeft, Mail, Key, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack }) => {
  const [step, setStep] = useState<'email' | 'verify' | 'reset' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if email exists in database
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email.trim())
        .single();

      if (userError || !user) {
        setError('No account found with this email address.');
        setLoading(false);
        return;
      }

      // Generate verification code (6-digit)
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      // Store verification code in database
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

      // In a real app, send email here
      // For demo purposes, we'll show the code
      setMessage(`Verification code sent to ${email}. Code: ${code} (Demo mode)`);
      setStep('verify');

    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Verify the code
      const { data: tokenData, error: tokenError } = await supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('email', email)
        .eq('token', verificationCode)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (tokenError || !tokenData) {
        setError('Invalid or expired verification code.');
        setLoading(false);
        return;
      }

      setStep('reset');
    } catch (err) {
      console.error('Verification error:', err);
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      // Get the token data
      const { data: tokenData } = await supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('email', email)
        .eq('token', verificationCode)
        .eq('used', false)
        .single();

      if (!tokenData) {
        setError('Invalid verification session.');
        setLoading(false);
        return;
      }

      // Update password using Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (authError) {
        // Fallback: Update in users table (for mock users)
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = users.findIndex((u: any) => u.email === email);
        
        if (userIndex !== -1) {
          users[userIndex].password = newPassword;
          localStorage.setItem('users', JSON.stringify(users));
        }
      }

      // Mark token as used
      await supabase
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('id', tokenData.id);

      // Log password reset attempt
      await supabase
        .from('security_logs')
        .insert({
          user_email: email,
          action: 'password_reset',
          ip_address: 'unknown', // In real app, get from request
          timestamp: new Date().toISOString(),
          success: true
        });

      setStep('success');
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleEmailSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full w-fit mx-auto mb-4">
          <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Forgot Password?
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Enter your email address and we'll send you a verification code to reset your password.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          placeholder="Enter your email address"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
      >
        {loading ? 'Sending...' : 'Send Verification Code'}
      </button>
    </form>
  );

  const renderVerifyStep = () => (
    <form onSubmit={handleVerificationSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full w-fit mx-auto mb-4">
          <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Check Your Email
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          We've sent a 6-digit verification code to {email}
        </p>
        {import.meta.env.DEV && (
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
            Development Mode: Check browser console for the verification code
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Verification Code
        </label>
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          required
          maxLength={6}
          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-center text-2xl tracking-widest"
          placeholder="000000"
        />
      </div>

      <button
        type="submit"
        disabled={loading || verificationCode.length !== 6}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
      >
        {loading ? 'Verifying...' : 'Verify Code'}
      </button>

      <button
        type="button"
        onClick={() => setStep('email')}
        className="w-full py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        Use different email
      </button>
    </form>
  );

  const renderResetStep = () => (
    <form onSubmit={handlePasswordReset} className="space-y-4">
      <div className="text-center mb-6">
        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full w-fit mx-auto mb-4">
          <Key className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Create New Password
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Enter your new password below
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          New Password
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          placeholder="Enter new password"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Confirm New Password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          placeholder="Confirm new password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
      >
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-6">
      <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full w-fit mx-auto">
        <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Password Updated!
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Your password has been successfully updated. You can now sign in with your new password.
        </p>
      </div>
      <button
        onClick={onBack}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        Back to Sign In
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Back Button */}
        {step !== 'success' && (
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </button>
        )}

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-slate-700">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
              <span className="text-green-700 dark:text-green-300 text-sm">{message}</span>
            </div>
          )}

          {/* Step Content */}
          {step === 'email' && renderEmailStep()}
          {step === 'verify' && renderVerifyStep()}
          {step === 'reset' && renderResetStep()}
          {step === 'success' && renderSuccessStep()}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;