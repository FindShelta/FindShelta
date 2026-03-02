import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, UserCheck, CheckCircle, ArrowRight, Sun, Moon, Shield, Search, Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import FindSheltaLogo from '../common/FindShelterLogo';
import AgentRegistrationForm from './AgentRegistrationForm';

interface RegistrationFlowProps {
  onBack?: () => void;
}

const RegistrationFlow: React.FC<RegistrationFlowProps> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState<'role' | 'details' | 'success'>('role');
  const { isDark, toggleTheme } = useTheme();
  const [selectedRole, setSelectedRole] = useState<'agent' | 'home_seeker' | null>(null);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    whatsappNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();

  if (showAgentForm) {
    return (
      <AgentRegistrationForm
        onClose={() => {
          setShowAgentForm(false);
          setSelectedRole(null);
        }}
      />
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) {
      setError('');
    }
  };

  const handleRoleSelect = (role: 'agent' | 'home_seeker') => {
    setSelectedRole(role);
    if (role === 'agent') {
      setShowAgentForm(true);
    } else {
      setCurrentStep('details');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const success = await register(formData.name.trim(), formData.email.trim(), formData.password, selectedRole!);

      if (success) {
        setCurrentStep('success');
      } else {
        setError('Registration failed. An account with this email already exists.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (currentStep === 'role') {
    return (
      <div className="section-shell min-h-screen py-8 sm:py-12">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="ghost-button inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </button>
          <button
            onClick={toggleTheme}
            className="ghost-button inline-flex h-10 w-10 items-center justify-center rounded-lg"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="h-4 w-4 text-[color:var(--accent)]" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        <div className="enterprise-header">
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-3">
              <FindSheltaLogo size={56} />
              <div className="text-left">
                <h1 className="text-2xl font-bold text-[color:var(--text)]">Create your account</h1>
                <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Choose your role</p>
              </div>
            </div>
            <p className="mx-auto max-w-xl text-sm text-[color:var(--text-muted)] sm:text-base">
              Pick the experience that fits your goals. Home seekers browse and connect. Agents publish and manage listings.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <button
              onClick={() => handleRoleSelect('home_seeker')}
              className="enterprise-kpi group rounded-xl p-6 text-left transition hover:border-[color:var(--brand)]"
            >
              <div className="mb-4 inline-flex rounded-xl bg-emerald-500/15 p-3 text-emerald-600 dark:text-emerald-300">
                <Home className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-[color:var(--text)]">Home Seeker</h2>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">Browse listings, save properties, and chat with verified agents.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-300">
                Start browsing
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>

            <button
              onClick={() => handleRoleSelect('agent')}
              className="enterprise-kpi group rounded-xl p-6 text-left transition hover:border-[color:var(--brand)]"
            >
              <div className="mb-4 inline-flex rounded-xl bg-sky-500/15 p-3 text-sky-600 dark:text-sky-300">
                <UserCheck className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-[color:var(--text)]">Agent</h2>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">Submit your profile, list properties, and manage leads in one workspace.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-600 dark:text-sky-300">
                Register as agent
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
          </div>

          <div className="enterprise-kpi mt-6 rounded-xl p-6">
            <h3 className="text-lg font-bold text-[color:var(--text)]">Agent offer</h3>
            <p className="mt-1 text-sm text-[color:var(--text-muted)]">Free renewal if no sales are closed in 30 days.</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'details') {
    return (
      <div className="section-shell min-h-screen py-8 sm:py-12">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep('role')}
            className="ghost-button inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Change role
          </button>
          <button
            onClick={toggleTheme}
            className="ghost-button inline-flex h-10 w-10 items-center justify-center rounded-lg"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="h-4 w-4 text-[color:var(--accent)]" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        <div className="enterprise-header mx-auto max-w-2xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Home Seeker Signup</p>
              <h2 className="mt-1 text-3xl font-bold text-[color:var(--text)]">Create your account</h2>
            </div>
            <FindSheltaLogo size={48} />
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="brand-input w-full rounded-xl px-4 py-3"
                  placeholder="Your name"
                />
              </div>
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
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[color:var(--text)]">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="brand-input w-full rounded-xl px-4 py-3 pr-12"
                  placeholder="At least 6 characters"
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-[color:var(--text-muted)]">By creating an account, you agree to the platform terms.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="section-shell min-h-screen py-8 sm:py-12">
      <div className="enterprise-header mx-auto max-w-3xl text-center">
        <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
          <CheckCircle className="h-9 w-9" />
        </div>
        <h2 className="text-3xl font-bold text-[color:var(--text)]">Account created successfully</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-[color:var(--text-muted)] sm:text-base">Your dashboard will load automatically in a moment.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
            <Search className="mx-auto h-5 w-5 text-[color:var(--brand)]" />
            <p className="mt-2 text-sm font-semibold text-[color:var(--text)]">Browse Listings</p>
          </div>
          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
            <Shield className="mx-auto h-5 w-5 text-[color:var(--brand)]" />
            <p className="mt-2 text-sm font-semibold text-[color:var(--text)]">Verified Agents</p>
          </div>
          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4">
            <UserCheck className="mx-auto h-5 w-5 text-[color:var(--brand)]" />
            <p className="mt-2 text-sm font-semibold text-[color:var(--text)]">Direct Contact</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationFlow;
