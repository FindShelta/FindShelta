import React, { useState } from 'react';
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthShell from './AuthShell';
import ForgotPassword from './ForgotPassword';

interface LoginFormProps {
  onBack: () => void;
  onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onBack, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email.trim() || !formData.password) {
      setError('Enter your email address and password to continue.');
      setLoading(false);
      return;
    }

    try {
      const success = await login(formData.email.trim(), formData.password);
      if (!success) setError('That email and password combination is not recognised.');
    } catch {
      setError('We could not sign you in right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return <ForgotPassword onBack={() => setShowForgotPassword(false)} />;
  }

  return (
    <AuthShell onBack={onBack} visualTitle="Welcome back to better stays." visualCopy="Return to saved apartments, active conversations, and every detail you need for your next trip.">
      <div className="mb-9">
        <p className="text-sm font-bold text-[color:var(--brand)]">Welcome back</p>
        <h2 className="mt-2 text-4xl font-bold leading-none tracking-[-0.045em] text-[color:var(--text)] sm:text-5xl">Sign in to FindShelta</h2>
        <p className="mt-4 text-base leading-7 text-[color:var(--text-muted)]">Access your saved stays and continue where you left off.</p>
      </div>

      {error && (
        <div role="alert" aria-live="polite" className="mb-5 flex items-start gap-3 border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="login-email" className="mb-2 block text-sm font-bold text-[color:var(--text)]">Email address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--text-muted)]" />
            <input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
              required
              className="brand-input min-h-14 w-full rounded-xl pl-12 pr-4 text-base"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-4">
            <label htmlFor="login-password" className="block text-sm font-bold text-[color:var(--text)]">Password</label>
            <button type="button" onClick={() => setShowForgotPassword(true)} className="text-sm font-bold text-[color:var(--brand)] hover:underline">Forgot password?</button>
          </div>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--text-muted)]" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
              required
              className="brand-input min-h-14 w-full rounded-xl pl-12 pr-12 text-base"
              placeholder="Enter your password"
            />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center text-[color:var(--text-muted)] hover:text-[color:var(--text)]" aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="group brand-button inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl px-5 text-base font-bold disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Signing in…</> : <>Sign in <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></>}
        </button>
      </form>

      <div className="mt-8 border-t border-[color:var(--border)] pt-6 text-center">
        <p className="text-sm text-[color:var(--text-muted)]">
          New to FindShelta?{' '}
          <button type="button" onClick={onSwitchToRegister} className="font-bold text-[color:var(--brand)] hover:underline">Create an account</button>
        </p>
      </div>
    </AuthShell>
  );
};

export default LoginForm;
