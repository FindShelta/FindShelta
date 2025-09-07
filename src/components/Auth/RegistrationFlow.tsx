import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Home, UserCheck, CheckCircle, ArrowRight, Sun, Moon, Shield, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import FindSheltaLogo from '../common/FindShelterLogo';

interface RegistrationFlowProps {
  onBack?: () => void;
}

const RegistrationFlow: React.FC<RegistrationFlowProps> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState<'role' | 'details' | 'success'>('role');
  const { isDark, toggleTheme } = useTheme();
  const [selectedRole, setSelectedRole] = useState<'agent' | 'home_seeker' | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    whatsappNumber: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) {
      setError('');
    }
  };

  const handleRoleSelect = (role: 'agent' | 'home_seeker') => {
    setSelectedRole(role);
    setCurrentStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (selectedRole === 'agent' && !formData.whatsappNumber.trim()) {
      setError('WhatsApp number is required for agents');
      setLoading(false);
      return;
    }

    try {
      const success = await register(
        formData.name.trim(),
        formData.email.trim(),
        formData.password,
        selectedRole!,
        selectedRole === 'agent' ? formData.whatsappNumber.trim() : undefined
      );

      if (success) {
        setCurrentStep('success');
        setTimeout(() => {
          // Auto-redirect handled by AuthContext
        }, 2000);
      } else {
        setError('Registration failed. An account with this email already exists.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (currentStep === 'role') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
        {/* Theme Toggle - Top Right */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={toggleTheme}
            className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:scale-105"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>

        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-slate-700 transition-all duration-300">
            {/* Login Link */}
            <div className="text-center mb-6">
              <button
                onClick={onBack}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
              >
                Already have an account? Sign in
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <FindSheltaLogo size={160} className="transition-transform duration-300 hover:scale-105" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">WELCOME TO FINDSHELTA</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">let's get started!!!</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Agent Card */}
                <button
                  onClick={() => handleRoleSelect('agent')}
                  className="w-full p-6 bg-white dark:bg-slate-700 rounded-2xl border-2 border-gray-200 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all duration-300 group hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors duration-300">
                        <UserCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                          I'm a Property Agent
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                          List properties and connect with clients
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
                  </div>
                </button>

                {/* Home Seeker Card */}
                <button
                  onClick={() => handleRoleSelect('home_seeker')}
                  className="w-full p-6 bg-white dark:bg-slate-700 rounded-2xl border-2 border-gray-200 dark:border-slate-600 hover:border-emerald-500 dark:hover:border-emerald-400 hover:shadow-lg transition-all duration-300 group hover:scale-[1.02]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/50 transition-colors duration-300">
                        <Home className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                          I'm Looking for a Home
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                          Find your perfect home or rental
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300" />
                  </div>
                </button>
              </div>

              <div className="pt-4 space-y-3 text-sm text-gray-500 dark:text-gray-400 text-center transition-colors duration-300">
                <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">🎉 FREE RENEWAL IF NO SALES IN 30DAYS ON FINDSHELTA</p>
                <p>✨ Video-enhanced listings</p>
                <p>💬 Direct WhatsApp contact</p>
                <p>🌐 Web-based platform</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'details') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
        {/* Theme Toggle - Top Right */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={toggleTheme}
            className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:scale-105"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>

        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-slate-700 transition-all duration-300">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="flex justify-center mb-4">
                  <FindSheltaLogo size={96} className="transition-transform duration-300 hover:scale-105" />
                </div>
                <div className="mb-4">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">WELCOME TO FINDSHELTA</h1>
                  <p className="text-xs text-gray-600 dark:text-gray-400">let's get started!!!</p>
                </div>
                <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                  You're signing up as a{' '}
                  <span className={`font-semibold ${
                    selectedRole === 'agent' ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {selectedRole === 'agent' ? 'Property Agent' : 'Home Seeker'}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentStep('role')}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline transition-colors duration-200"
                >
                  Change role
                </button>
              </div>

              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm transition-all duration-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    autoComplete="name"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    autoComplete="email"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-all duration-300"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      autoComplete="new-password"
                      className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-all duration-300"
                      placeholder="Create a secure password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                    Must be at least 6 characters long
                  </p>
                </div>

                {selectedRole === 'agent' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      name="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={handleInputChange}
                      required
                      autoComplete="tel"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-all duration-300"
                      placeholder="+234 XXX XXX XXXX"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300">
                      Clients will contact you via WhatsApp
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 text-white font-medium rounded-lg transition-all duration-300 hover:scale-[1.02] ${
                    selectedRole === 'agent'
                      ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
                      : 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400'
                  }`}
                >
                  {loading ? 'Creating Account...' : 'Create Account & Get Started'}
                </button>
              </form>

              <div className="text-center text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success step
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-slate-700 transition-all duration-300">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full transition-colors duration-300">
                <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                Welcome to FindShelta.com!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">
                Your account has been created successfully.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 transition-colors duration-300">
              <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                {selectedRole === 'agent' 
                  ? 'Redirecting to your agent dashboard...' 
                  : 'Redirecting to browse properties...'}
              </p>
              <div className="mt-2 w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2 transition-colors duration-300">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse transition-colors duration-300" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationFlow;