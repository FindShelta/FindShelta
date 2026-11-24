import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, MailCheck, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface VerificationPendingProps {
  email: string;
  title?: string;
  description?: string;
  note?: string;
  onBack: () => void;
  backLabel?: string;
}

const VerificationPending: React.FC<VerificationPendingProps> = ({
  email,
  title = 'Check your inbox',
  description = 'We sent a verification link to your email address. Open it to activate your FindShelta account.',
  note,
  onBack,
  backLabel = 'Back to sign in',
}) => {
  const { resendVerificationEmail } = useAuth();
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState('');
  const [resendFailed, setResendFailed] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    setResending(true);
    setMessage('');
    setResendFailed(false);

    const sent = await resendVerificationEmail(email);
    if (sent) {
      setMessage('A new verification email is on its way.');
      setCooldown(60);
    } else {
      setMessage('We could not resend the email right now. Please wait a moment and try again.');
      setResendFailed(true);
    }
    setResending(false);
  };

  return (
    <div className="text-center">
      <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
        <MailCheck className="h-8 w-8" />
      </span>
      <p className="mt-6 text-sm font-bold uppercase tracking-[0.14em] text-[color:var(--brand)]">One last step</p>
      <h2 className="mt-2 text-4xl font-bold tracking-[-0.04em] text-[color:var(--text)]">{title}</h2>
      <p className="mt-4 text-base leading-7 text-[color:var(--text-muted)]">{description}</p>

      <div className="mt-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-4">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">Verification sent to</p>
        <p className="mt-1 break-all font-bold text-[color:var(--text)]">{email}</p>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-left text-sm leading-6 text-blue-950 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-700 dark:text-blue-300" />
        <span>{note || 'The link expires for your security. If you do not see the email, check your spam or promotions folder.'}</span>
      </div>

      <button
        type="button"
        onClick={handleResend}
        disabled={resending || cooldown > 0}
        className="brand-button mt-6 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl px-5 font-bold disabled:cursor-not-allowed disabled:opacity-60"
      >
        {resending ? <Loader2 className="h-5 w-5 animate-spin" /> : cooldown > 0 ? <CheckCircle2 className="h-5 w-5" /> : <RefreshCw className="h-5 w-5" />}
        {resending ? 'Sending...' : cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend verification email'}
      </button>

      {message && (
        <p role="status" aria-live="polite" className={`mt-3 text-sm font-semibold ${resendFailed ? 'text-rose-600 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
          {message}
        </p>
      )}

      <button type="button" onClick={onBack} className="mt-6 text-sm font-bold text-[color:var(--brand)] hover:underline">
        {backLabel}
      </button>
    </div>
  );
};

export default VerificationPending;
