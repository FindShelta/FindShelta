import React, { useState } from 'react';
import { AlertCircle, ArrowRight, Building2, Check, CheckCircle2, Eye, EyeOff, Home, Loader2, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AgentRegistrationForm from './AgentRegistrationForm';
import AuthShell from './AuthShell';

interface RegistrationFlowProps {
  onBack?: () => void;
}

const RegistrationFlow: React.FC<RegistrationFlowProps> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState<'role' | 'details' | 'success'>('role');
  const [selectedRole, setSelectedRole] = useState<'agent' | 'home_seeker' | null>(null);
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();

  if (showAgentForm) {
    return <AgentRegistrationForm onClose={() => { setShowAgentForm(false); setSelectedRole(null); }} />;
  }

  const chooseRole = (role: 'agent' | 'home_seeker') => {
    setSelectedRole(role);
    if (role === 'agent') setShowAgentForm(true);
    else setCurrentStep('details');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError('Complete all fields to create your account.');
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError('Your password must contain at least six characters.');
      setLoading(false);
      return;
    }

    try {
      const success = await register(formData.name.trim(), formData.email.trim(), formData.password, selectedRole!);
      if (success) setCurrentStep('success');
      else setError('An account with this email may already exist. Try signing in instead.');
    } catch {
      setError('We could not create your account right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (currentStep === 'role') {
    return (
      <AuthShell onBack={onBack} backLabel="Back to sign in" visualTitle="One account. A better way to move." visualCopy="Whether you are finding your next short stay or sharing a great property, FindShelta keeps the experience clear and direct.">
        <div className="mb-8">
          <p className="text-sm font-bold text-[color:var(--brand)]">Create your account</p>
          <h2 className="mt-2 text-4xl font-bold leading-none tracking-[-0.045em] text-[color:var(--text)] sm:text-5xl">How will you use FindShelta?</h2>
          <p className="mt-4 text-base leading-7 text-[color:var(--text-muted)]">Choose an account type. You can start in less than a minute.</p>
        </div>

        <div className="space-y-3">
          <button type="button" onClick={() => chooseRole('home_seeker')} className="group flex w-full items-center gap-4 rounded-2xl border-2 border-[color:var(--border)] p-5 text-left transition hover:border-[color:var(--brand)] hover:bg-[color:var(--surface-strong)]">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"><Home className="h-6 w-6" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-bold text-[color:var(--text)]">I’m looking for a stay</span>
              <span className="mt-1 block text-sm text-[color:var(--text-muted)]">Save apartments and contact hosts directly.</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-[color:var(--text-muted)] transition-transform group-hover:translate-x-1 group-hover:text-[color:var(--brand)]" />
          </button>

          <button type="button" onClick={() => chooseRole('agent')} className="group flex w-full items-center gap-4 rounded-2xl border-2 border-[color:var(--border)] p-5 text-left transition hover:border-[color:var(--brand)] hover:bg-[color:var(--surface-strong)]">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"><Building2 className="h-6 w-6" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-bold text-[color:var(--text)]">I list properties</span>
              <span className="mt-1 block text-sm text-[color:var(--text-muted)]">Apply as an agent and manage your listings.</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-[color:var(--text-muted)] transition-transform group-hover:translate-x-1 group-hover:text-[color:var(--brand)]" />
          </button>
        </div>

        <p className="mt-7 text-center text-sm text-[color:var(--text-muted)]">Already have an account? <button type="button" onClick={onBack} className="font-bold text-[color:var(--brand)] hover:underline">Sign in</button></p>
      </AuthShell>
    );
  }

  if (currentStep === 'success') {
    return (
      <AuthShell visualTitle="You’re ready to find your next stay." visualCopy="Your FindShelta account keeps your wishlist, host conversations, and new discoveries together.">
        <div className="text-center">
          <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"><CheckCircle2 className="h-8 w-8" /></span>
          <h2 className="mt-6 text-4xl font-bold tracking-[-0.04em] text-[color:var(--text)]">Your account is ready</h2>
          <p className="mt-4 text-base leading-7 text-[color:var(--text-muted)]">We’re preparing your dashboard now. You’ll be taken there automatically.</p>
          <div className="mt-8 flex items-center justify-center gap-2 text-sm font-bold text-[color:var(--brand)]"><Loader2 className="h-4 w-4 animate-spin" /> Opening FindShelta</div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell onBack={() => setCurrentStep('role')} backLabel="Change account type" visualTitle="Save the stays worth coming back to." visualCopy="Create your home seeker account and build a shortlist that travels with you.">
      <div className="mb-8">
        <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--brand)] text-white"><Check className="h-3.5 w-3.5" /></span>
          Account type
          <span className="h-px flex-1 bg-[color:var(--border)]" />
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--brand)] text-white">2</span>
          Your details
        </div>
        <p className="text-sm font-bold text-[color:var(--brand)]">Home seeker account</p>
        <h2 className="mt-2 text-4xl font-bold leading-none tracking-[-0.045em] text-[color:var(--text)] sm:text-5xl">Tell us about you</h2>
        <p className="mt-4 text-base leading-7 text-[color:var(--text-muted)]">A few details and your FindShelta account is ready.</p>
      </div>

      {error && (
        <div role="alert" className="mb-5 flex items-start gap-3 border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="register-name" className="mb-2 block text-sm font-bold text-[color:var(--text)]">Full name</label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--text-muted)]" />
            <input id="register-name" type="text" autoComplete="name" value={formData.name} onChange={(event) => { setFormData((current) => ({ ...current, name: event.target.value })); setError(''); }} required className="brand-input min-h-14 w-full rounded-xl pl-12 pr-4 text-base" placeholder="Your full name" />
          </div>
        </div>
        <div>
          <label htmlFor="register-email" className="mb-2 block text-sm font-bold text-[color:var(--text)]">Email address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--text-muted)]" />
            <input id="register-email" type="email" autoComplete="email" value={formData.email} onChange={(event) => { setFormData((current) => ({ ...current, email: event.target.value })); setError(''); }} required className="brand-input min-h-14 w-full rounded-xl pl-12 pr-4 text-base" placeholder="you@example.com" />
          </div>
        </div>
        <div>
          <label htmlFor="register-password" className="mb-2 block text-sm font-bold text-[color:var(--text)]">Password</label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--text-muted)]" />
            <input id="register-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={formData.password} onChange={(event) => { setFormData((current) => ({ ...current, password: event.target.value })); setError(''); }} required className="brand-input min-h-14 w-full rounded-xl pl-12 pr-12 text-base" placeholder="At least 6 characters" />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center text-[color:var(--text-muted)]" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
          </div>
        </div>

        <button type="submit" disabled={loading} className="group brand-button inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl px-5 text-base font-bold disabled:opacity-60">
          {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Creating account…</> : <>Create my account <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></>}
        </button>
      </form>

      <p className="mt-5 text-center text-xs leading-5 text-[color:var(--text-muted)]">By creating an account, you agree to FindShelta’s platform terms and privacy policy.</p>
    </AuthShell>
  );
};

export default RegistrationFlow;
