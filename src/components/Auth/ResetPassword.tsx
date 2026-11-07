import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, LockKeyhole } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthShell from './AuthShell';

const ResetPassword: React.FC = () => {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError('Your password must contain at least six characters.');
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      setLoading(false);
      return;
    }

    const updated = await updatePassword(password);
    if (updated) {
      setSuccess(true);
      window.setTimeout(() => { window.location.href = '/'; }, 2000);
    } else {
      setError('We could not update your password. Please request a new reset link.');
    }
    setLoading(false);
  };

  return (
    <AuthShell onBack={() => { window.location.href = '/login'; }} backLabel="Back to sign in" visualTitle="A fresh password. The same saved journey." visualCopy="Secure your account and return to the properties and conversations waiting for you.">
      {success ? (
        <div className="text-center">
          <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"><CheckCircle2 className="h-8 w-8" /></span>
          <h2 className="mt-6 text-4xl font-bold tracking-[-0.04em] text-[color:var(--text)]">Password updated</h2>
          <p className="mt-4 text-base leading-7 text-[color:var(--text-muted)]">Your account is secure. We’re taking you back to FindShelta now.</p>
          <div className="mt-8 flex items-center justify-center gap-2 text-sm font-bold text-[color:var(--brand)]"><Loader2 className="h-4 w-4 animate-spin" /> Redirecting</div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <p className="text-sm font-bold text-[color:var(--brand)]">Secure your account</p>
            <h2 className="mt-2 text-4xl font-bold leading-none tracking-[-0.045em] text-[color:var(--text)] sm:text-5xl">Choose a new password</h2>
            <p className="mt-4 text-base leading-7 text-[color:var(--text-muted)]">Use at least six characters and avoid a password you use elsewhere.</p>
          </div>

          {error && <div role="alert" className="mb-5 flex items-start gap-3 border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="new-password" className="mb-2 block text-sm font-bold text-[color:var(--text)]">New password</label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--text-muted)]" />
                <input id="new-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required className="brand-input min-h-14 w-full rounded-xl pl-12 pr-12 text-base" placeholder="At least 6 characters" />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center text-[color:var(--text-muted)]" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
              </div>
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-2 block text-sm font-bold text-[color:var(--text)]">Confirm new password</label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[color:var(--text-muted)]" />
                <input id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required className="brand-input min-h-14 w-full rounded-xl pl-12 pr-12 text-base" placeholder="Repeat your new password" />
                <button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center text-[color:var(--text-muted)]" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>{showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="brand-button inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl px-5 font-bold disabled:opacity-60">{loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Updating password…</> : 'Update password'}</button>
          </form>
        </>
      )}
    </AuthShell>
  );
};

export default ResetPassword;
