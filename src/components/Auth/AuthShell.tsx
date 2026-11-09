import React from 'react';
import { ArrowLeft, Check, Moon, ShieldCheck, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import FindSheltaLogo from '../common/FindShelterLogo';

interface AuthShellProps {
  children: React.ReactNode;
  onBack?: () => void;
  backLabel?: string;
  visualTitle?: string;
  visualCopy?: string;
}

const AuthShell: React.FC<AuthShellProps> = ({
  children,
  onBack,
  backLabel = 'Back home',
  visualTitle = 'Your next stay is closer than you think.',
  visualCopy = 'Save standout spaces, speak directly with hosts, and keep every detail of your search in one place.',
}) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="grid min-h-[100dvh] overflow-hidden bg-[color:var(--surface-solid)] lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="auth-visual relative hidden min-h-[100dvh] overflow-hidden bg-slate-950 text-white lg:flex lg:flex-col lg:justify-between">
        <img
          src="https://images.pexels.com/photos/1571459/pexels-photo-1571459.jpeg?auto=compress&cs=tinysrgb&w=1800"
          alt="Beautifully furnished short stay apartment"
          className="auth-visual-image absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/55 via-blue-950/20 to-slate-950/95" />

        <div className="relative z-10 flex items-center gap-3 p-10 xl:p-12">
          <span className="inline-flex h-12 w-12 items-center justify-center bg-white shadow-lg">
            <FindSheltaLogo size={38} />
          </span>
          <div>
            <p className="text-xl font-bold tracking-tight">FindShelta</p>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Short stays, simplified</p>
          </div>
        </div>

        <div className="relative z-10 max-w-2xl p-10 xl:p-12">
          <div className="mb-6 inline-flex items-center gap-2 border border-white/25 bg-white/10 px-3 py-2 text-xs font-bold backdrop-blur-md">
            <ShieldCheck className="h-4 w-4 text-blue-200" />
            A safer way to find your stay
          </div>
          <h1 className="max-w-xl text-5xl font-bold leading-[0.94] tracking-[-0.055em] xl:text-6xl">{visualTitle}</h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-white/75">{visualCopy}</p>
          <div className="mt-8 flex flex-wrap gap-5 text-sm font-semibold text-white/80">
            <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-blue-200" /> Clear listing details</span>
            <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-blue-200" /> Direct host contact</span>
          </div>
        </div>
      </aside>

      <main className="flex min-h-[100dvh] min-w-0 flex-col bg-[color:var(--surface-solid)] text-[color:var(--text)]">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[color:var(--border)] px-4 sm:h-20 sm:px-8 lg:border-b-0 lg:px-10 xl:px-14">
          <button
            type="button"
            onClick={onBack}
            className={`inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[color:var(--text)] transition hover:text-[color:var(--brand)] ${onBack ? '' : 'invisible'}`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{backLabel}</span>
          </button>

          <div className="flex items-center gap-2 lg:hidden">
            <FindSheltaLogo size={34} />
            <span className="hidden font-bold sm:inline">FindShelta</span>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-11 w-11 items-center justify-center text-[color:var(--text)] transition hover:bg-[color:var(--surface-strong)]"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        <div className="flex flex-1 items-center px-5 py-10 sm:px-10 sm:py-14 lg:px-14 xl:px-20">
          <div className="auth-form-enter mx-auto w-full max-w-[31rem]">{children}</div>
        </div>

        <p className="px-5 pb-6 text-center text-xs text-[color:var(--text-muted)] sm:px-10">
          Protected access · FindShelta Nigeria
        </p>
      </main>
    </div>
  );
};

export default AuthShell;
