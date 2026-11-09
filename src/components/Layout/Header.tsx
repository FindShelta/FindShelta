import React, { useState } from 'react';
import { Sun, Moon, Menu, LogOut, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import NotificationCenter from './NotificationCenter';
import FindSheltaLogo from '../common/FindShelterLogo';

interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, showMenuButton = false }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const initials = (user?.name || 'FindShelta user')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const workspaceLabel = location.pathname.startsWith('/admin')
    ? 'Admin workspace'
    : location.pathname.startsWith('/subscription')
      ? 'Subscription'
      : user?.role === 'agent'
        ? 'Host workspace'
        : 'Finds';

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
      setShowUserMenu(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--surface-solid)]/90 shadow-[0_1px_12px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div className="section-shell">
        <div className="flex h-[4.5rem] items-center justify-between gap-2 sm:gap-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {showMenuButton && (
              <button
                type="button"
                onClick={onMenuClick}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border)] text-[color:var(--text)] hover:bg-[color:var(--surface-strong)] lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <Link to={user ? '/dashboard' : '/'} className="group flex shrink-0 items-center gap-2.5" aria-label="FindShelta home">
              <FindSheltaLogo size={40} className="transition-transform duration-300 group-hover:scale-105" />
              <span className="hidden text-xl font-extrabold tracking-[-0.04em] text-[color:var(--text)] sm:inline sm:text-[1.4rem]">
                Find<span className="text-[color:var(--brand)]">Shelta</span>
              </span>
            </Link>

            {user && (
              <>
                <span className="hidden h-6 w-px bg-[color:var(--border)] md:block" aria-hidden="true" />
                <span className="hidden items-center gap-2 rounded-full bg-[color:var(--surface-strong)] px-3 py-1.5 text-xs font-bold text-[color:var(--text-muted)] md:inline-flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--brand)]" aria-hidden="true" />
                  {workspaceLabel}
                </span>
              </>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="flex items-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] p-1 shadow-sm">
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--text-muted)] hover:bg-[color:var(--surface-strong)] hover:text-[color:var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDark ? 'Light mode' : 'Dark mode'}
              >
                {isDark ? <Sun className="h-4 w-4 text-[color:var(--accent)]" /> : <Moon className="h-4 w-4" />}
              </button>

              {user && <NotificationCenter />}
            </div>

            {user && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowUserMenu((prev) => !prev)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] p-1 pr-2 shadow-sm hover:border-[color:var(--brand)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)] sm:pr-3"
                    aria-label="Open user menu"
                    aria-expanded={showUserMenu}
                    aria-haspopup="menu"
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--brand-strong)] text-xs font-extrabold text-white">
                      {initials}
                    </span>
                    <span className="hidden min-w-0 text-left lg:block">
                      <span className="block max-w-32 truncate text-sm font-bold leading-tight text-[color:var(--text)]">{user.name}</span>
                      <span className="block text-[10px] font-semibold capitalize leading-tight text-[color:var(--text-muted)]">{user.role.replace('_', ' ')}</span>
                    </span>
                    <ChevronDown className={`hidden h-4 w-4 text-[color:var(--text-muted)] transition-transform sm:block ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showUserMenu && (
                    <div className="panel absolute right-0 z-50 mt-2 w-72 rounded-2xl p-2 shadow-[0_20px_55px_rgba(15,23,42,0.18)]" role="menu">
                      <div className="flex items-center gap-3 rounded-xl bg-[color:var(--surface-strong)] p-3">
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-strong)] text-xs font-extrabold text-white">
                          {initials}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[color:var(--text)]">{user.name}</p>
                          <p className="truncate text-xs text-[color:var(--text-muted)]">{user.email}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="mt-2 flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-sm font-bold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-rose-300 dark:hover:bg-rose-900/20"
                        role="menuitem"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
                      </button>
                    </div>
                  )}
                </div>
            )}
          </div>
        </div>
      </div>

      {showUserMenu && <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />}
    </header>
  );
};

export default Header;
