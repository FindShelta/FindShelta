import React, { useState } from 'react';
import { Sun, Moon, Home, User, Menu, Search, LogOut, ChevronDown } from 'lucide-react';
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
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-3 sm:px-4 py-2 sm:py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left side */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {showMenuButton && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
            </button>
          )}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <FindSheltaLogo size={window.innerWidth < 640 ? 36 : 48} />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            )}
          </button>

          {/* User menu */}
          {user && (
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Notification Center */}
              <NotificationCenter />
              
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-24 lg:max-w-none">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user.role.replace('_', ' ')}
                </p>
              </div>
              {/* User Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-300" />
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 sm:w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{isLoggingOut ? 'Signing out...' : 'Sign out'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default Header;