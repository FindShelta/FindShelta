import React, { useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthShell from './AuthShell';

interface ForgotPasswordProps {
  onBack: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (!email.trim()) {
      setError('Enter the email address connected to your account.');
      setLoading(false);
      return;
    }

    const success = await resetPassword(email.trim());
    if (success) setSent(true);
    else setError('We could not send the reset email. Check the address and try again.');
    setLoading(false);
  };

  return (
    <AuthShell onBack={onBack} backLabel="Back to sign in" visualTitle="Your account stays protected." visualCopy="Recover access securely and get back to the properties, hosts, and searches you care about.">
      {sent ? (
        <div className="text-center">
          <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h2 className="mt-6 text-4xl font-bold tracking-[-0.04em] text-[color:var(--text)]">Check your inbox</h2>
          <p className="mt-4 text-base leading-7 text-[color:var(--text-muted)]">We sent a password reset link to <strong className="text-[color:var(--text)]">{email}</strong>. The link expires in one hour.</p>
          <button type="button" onClick={onBack} className="brand-button mt-8 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl px-5 font-bold">
            Return to sign in <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <>
          <div className="mb-9">
            <p className="text-sm font-bold text-[color:var(--brand)]">Account recovery</p>
            <h2 className="mt-2 text-4xl font-bold leading-none tracking-[-0.045em] text-[color:var(--text)] sm:text-5xl">Reset your password</h2>
            <p className="mt-4 text-base leading-7 text-[color:var(--text-muted)]">Enter your account email and we’ll send you a secure reset link.</p>
          </div>

          {error && (
            <div role="alert" className="mb-5 flex items-start gap-3 border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="reset-email" className="mb-2 block text-sm font-bold text-[color:var(--text)]">Email address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--text-muted)]" />
                <input id="reset-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="brand-input min-h-14 w-full rounded-xl pl-12 pr-4 text-base" placeholder="you@example.com" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="brand-button inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl px-5 font-bold disabled:opacity-60">
              {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Sending link…</> : <>Send reset link <ArrowRight className="h-5 w-5" /></>}
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
};

export default ForgotPassword;
