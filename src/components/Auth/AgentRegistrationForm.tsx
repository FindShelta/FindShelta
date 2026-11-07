import React, { useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthShell from './AuthShell';

interface AgentRegistrationFormProps {
  onClose: () => void;
}

const AgentRegistrationForm: React.FC<AgentRegistrationFormProps> = ({ onClose }) => {
  const { registerAgent } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const ok = await registerAgent(formData);
      if (ok) setSuccess(true);
      else setError('We could not submit your application. Check your details and try again.');
    } catch {
      setError('We could not submit your application right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell onBack={onClose} backLabel="Change account type" visualTitle="List with clarity. Connect directly." visualCopy="Join FindShelta as an approved agent and put quality properties in front of serious home seekers.">
      {success ? (
        <div className="text-center">
          <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"><CheckCircle2 className="h-8 w-8" /></span>
          <h2 className="mt-6 text-4xl font-bold tracking-[-0.04em] text-[color:var(--text)]">Application received</h2>
          <p className="mt-4 text-base leading-7 text-[color:var(--text-muted)]">Our team will review your agent profile within one to two business days and send an update by email.</p>
          <button type="button" onClick={onClose} className="brand-button mt-8 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl px-5 font-bold">Back to account options <ArrowRight className="h-5 w-5" /></button>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <p className="text-sm font-bold text-[color:var(--brand)]">Agent application</p>
            <h2 className="mt-2 text-4xl font-bold leading-none tracking-[-0.045em] text-[color:var(--text)] sm:text-5xl">Build your agent profile</h2>
            <p className="mt-4 text-base leading-7 text-[color:var(--text-muted)]">Submit your details for review before listing access is enabled.</p>
          </div>

          {error && <div role="alert" className="mb-5 flex items-start gap-3 border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="agent-name" className="mb-2 block text-sm font-bold text-[color:var(--text)]">Full name</label>
              <div className="relative"><UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--text-muted)]" /><input id="agent-name" type="text" autoComplete="name" required value={formData.fullName} onChange={(event) => setFormData((current) => ({ ...current, fullName: event.target.value }))} className="brand-input min-h-14 w-full rounded-xl pl-12 pr-4 text-base" placeholder="Your full name" /></div>
            </div>
            <div>
              <label htmlFor="agent-email" className="mb-2 block text-sm font-bold text-[color:var(--text)]">Email address</label>
              <div className="relative"><Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--text-muted)]" /><input id="agent-email" type="email" autoComplete="email" required value={formData.email} onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))} className="brand-input min-h-14 w-full rounded-xl pl-12 pr-4 text-base" placeholder="you@example.com" /></div>
            </div>
            <div>
              <label htmlFor="agent-password" className="mb-2 block text-sm font-bold text-[color:var(--text)]">Password</label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--text-muted)]" />
                <input id="agent-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required value={formData.password} onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))} className="brand-input min-h-14 w-full rounded-xl pl-12 pr-12 text-base" placeholder="Create a secure password" />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center text-[color:var(--text-muted)]" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-[color:var(--surface-strong)] p-4 text-sm leading-6 text-[color:var(--text-muted)]"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--brand)]" /><span><strong className="text-[color:var(--text)]">Approval required.</strong> Listing access is enabled after our team verifies your application.</span></div>

            <button type="submit" disabled={loading} className="brand-button inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl px-5 font-bold disabled:opacity-60">{loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Submitting…</> : <>Submit application <ArrowRight className="h-5 w-5" /></>}</button>
          </form>
        </>
      )}
    </AuthShell>
  );
};

export default AgentRegistrationForm;
