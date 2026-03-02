import React, { useState } from 'react';
import { Sun, Moon, User, Menu, LogOut, ChevronDown } from 'lucide-react';
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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
    <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[color:var(--surface)]/95 backdrop-blur-xl">
      <div className="section-shell">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            {showMenuButton && (
              <button
                onClick={onMenuClick}
                className="ghost-button inline-flex items-center justify-center rounded-lg p-2 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <div className="flex items-center gap-2 sm:gap-3">
              <FindSheltaLogo size={44} />
              <div className="hidden sm:block">
                <p className="text-sm font-semibold tracking-[0.14em] text-[color:var(--text-muted)]">FINDSHELTA</p>
                <p className="text-xs text-[color:var(--text-muted)]">Property Marketplace</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className="ghost-button inline-flex h-10 w-10 items-center justify-center rounded-lg"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="h-4 w-4 text-[color:var(--accent)]" /> : <Moon className="h-4 w-4" />}
            </button>

            {user && (
              <>
                <NotificationCenter />
                <div className="hidden text-right md:block">
                  <p className="max-w-40 truncate text-sm font-semibold text-[color:var(--text)]">{user.name}</p>
                  <p className="text-xs capitalize text-[color:var(--text-muted)]">{user.role.replace('_', ' ')}</p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu((prev) => !prev)}
                    className="ghost-button inline-flex items-center gap-1 rounded-lg px-3 py-2"
                    aria-label="Open user menu"
                  >
                    <User className="h-4 w-4" />
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {showUserMenu && (
                    <div className="panel absolute right-0 mt-2 w-56 rounded-xl p-2 z-50">
                      <div className="border-b border-[color:var(--border)] px-2 pb-3">
                        <p className="truncate text-sm font-semibold text-[color:var(--text)]">{user.name}</p>
                        <p className="truncate text-xs text-[color:var(--text-muted)]">{user.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="mt-2 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-rose-300 dark:hover:bg-rose-900/20"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showUserMenu && <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />}
    </header>
  );
};

export default Header;
