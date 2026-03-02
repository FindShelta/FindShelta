import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Sun, Moon, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ForgotPassword from './ForgotPassword';
import FindSheltaLogo from '../common/FindShelterLogo';

interface LoginFormProps {
  onBack: () => void;
  onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onBack, onSwitchToRegister }) => {
  const { isDark, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const success = await login(formData.email, formData.password);
      if (!success) {
        setError('Invalid email or password. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (showForgotPassword) {
    return <ForgotPassword onBack={() => setShowForgotPassword(false)} />;
  }

  return (
    <div className="section-shell min-h-screen py-8 sm:py-12">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="ghost-button inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={toggleTheme}
          className="ghost-button inline-flex h-10 w-10 items-center justify-center rounded-lg"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="h-4 w-4 text-[color:var(--accent)]" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="enterprise-header">
          <div className="mb-8 flex items-center gap-3">
            <FindSheltaLogo size={52} />
            <div>
              <p className="text-xl font-bold text-[color:var(--text)]">FindShelta</p>
              <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Enterprise Property Platform</p>
            </div>
          </div>
          <h1 className="max-w-md text-3xl font-bold leading-tight text-[color:var(--text)] sm:text-4xl">Secure access to your workspace</h1>
          <p className="mt-4 max-w-md text-sm text-[color:var(--text-muted)] sm:text-base">
            Continue with your account to manage listings, follow-up with agents, and track saved searches.
          </p>

          <div className="mt-8 space-y-3 text-sm text-[color:var(--text-muted)]">
            <div className="enterprise-kpi flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[color:var(--accent)]" />
              Verified listings pipeline
            </div>
            <div className="enterprise-kpi flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[color:var(--accent)]" />
              Direct communication workflow
            </div>
            <div className="enterprise-kpi flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[color:var(--accent)]" />
              Alerts and saved searches
            </div>
          </div>
        </aside>

        <div className="panel rounded-3xl p-6 sm:p-8 lg:p-10">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Account Access</p>
            <h2 className="mt-2 text-3xl font-bold text-[color:var(--text)]">Welcome back</h2>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">Use your email and password to enter your dashboard.</p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="brand-input w-full rounded-xl px-4 py-3"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-[color:var(--text)]">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs font-semibold text-[color:var(--brand)] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="brand-input w-full rounded-xl px-4 py-3 pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--text-muted)]"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="brand-button w-full rounded-xl py-3 font-semibold disabled:opacity-60">
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
            <div className="flex items-start gap-2 text-sm text-[color:var(--text-muted)]">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-[color:var(--brand)]" />
              Password reset is available from this page if you cannot access your account.
            </div>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white"
            >
              <Mail className="h-4 w-4" />
              Reset Password
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-[color:var(--text-muted)]">
            No account yet?{' '}
            <button onClick={onSwitchToRegister} className="font-semibold text-[color:var(--brand)] hover:underline">
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
