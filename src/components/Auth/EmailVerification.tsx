import { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, MailCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AuthShell from './AuthShell';

interface EmailVerificationProps {
  onContinue: () => void;
  onSignIn: () => void;
  onRegister: () => void;
}

type VerificationStatus = 'verifying' | 'success' | 'error';

const hasVerifiedEmail = (user: { email_confirmed_at?: string | null; confirmed_at?: string | null } | null | undefined) =>
  Boolean(user?.email_confirmed_at || user?.confirmed_at);

const EmailVerification: React.FC<EmailVerificationProps> = ({ onContinue, onSignIn, onRegister }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<VerificationStatus>(user ? 'success' : 'verifying');
  const handledRef = useRef(false);

  useEffect(() => {
    if (user) {
      setStatus('success');
      return;
    }
    if (handledRef.current) return;
    handledRef.current = true;

    const verifyEmail = async () => {
      const query = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const callbackError = query.get('error') || hash.get('error');
      const callbackErrorCode = query.get('error_code') || hash.get('error_code');

      if (callbackError || callbackErrorCode) {
        setStatus('error');
        return;
      }

      const code = query.get('code');
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error || !hasVerifiedEmail(data.session?.user)) {
          setStatus('error');
          return;
        }
        window.history.replaceState({}, document.title, window.location.pathname);
        setStatus('success');
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      if (!error && hasVerifiedEmail(data.session?.user)) {
        window.history.replaceState({}, document.title, window.location.pathname);
        setStatus('success');
        return;
      }

      const hasImplicitCallback = hash.has('access_token') || hash.get('type') === 'signup';
      if (hasImplicitCallback) {
        window.setTimeout(async () => {
          const latest = await supabase.auth.getSession();
          if (!latest.error && hasVerifiedEmail(latest.data.session?.user)) {
            window.history.replaceState({}, document.title, window.location.pathname);
            setStatus('success');
          } else {
            setStatus('error');
          }
        }, 1200);
        return;
      }

      setStatus('error');
    };

    void verifyEmail();
  }, [user]);

  return (
    <AuthShell visualTitle="Verified access. Protected journeys." visualCopy="Email verification keeps every saved stay, host conversation, and account action tied securely to you.">
      {status === 'verifying' && (
        <div className="text-center" role="status" aria-live="polite">
          <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
            <Loader2 className="h-8 w-8 animate-spin" />
          </span>
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.14em] text-[color:var(--brand)]">Secure verification</p>
          <h1 className="mt-2 text-4xl font-bold tracking-[-0.04em] text-[color:var(--text)]">Confirming your email</h1>
          <p className="mt-4 text-base leading-7 text-[color:var(--text-muted)]">Keep this page open while we finish activating your FindShelta account.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center">
          <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">Email verified</p>
          <h1 className="mt-2 text-4xl font-bold tracking-[-0.04em] text-[color:var(--text)]">Your account is active</h1>
          <p className="mt-4 text-base leading-7 text-[color:var(--text-muted)]">Your email address is confirmed. You can now continue securely to FindShelta.</p>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left text-sm leading-6 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
            <span>Booking contact, wishlists, and account features are now available for your verified account.</span>
          </div>
          <button type="button" onClick={onContinue} className="group brand-button mt-7 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl px-5 font-bold">
            Continue to FindShelta <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center">
          <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
            <AlertCircle className="h-8 w-8" />
          </span>
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.14em] text-rose-600 dark:text-rose-300">Verification unsuccessful</p>
          <h1 className="mt-2 text-4xl font-bold tracking-[-0.04em] text-[color:var(--text)]">This link is invalid or expired</h1>
          <p className="mt-4 text-base leading-7 text-[color:var(--text-muted)]">Request a fresh verification email from the sign-in screen, or register again if the account was not completed.</p>
          <button type="button" onClick={onSignIn} className="brand-button mt-7 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl px-5 font-bold">
            Go to sign in <ArrowRight className="h-5 w-5" />
          </button>
          <button type="button" onClick={onRegister} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[color:var(--brand)] hover:underline">
            <MailCheck className="h-4 w-4" /> Create a new account
          </button>
        </div>
      )}
    </AuthShell>
  );
};

export default EmailVerification;
