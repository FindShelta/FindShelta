import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Home, UserCheck, CheckCircle, ArrowRight, Sun, Moon, Shield, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';
import FindSheltaLogo from '../common/FindShelterLogo';
import AgentRegistrationForm from './AgentRegistrationForm';

interface RegistrationFlowProps {
  onBack?: () => void;
}

const RegistrationFlow: React.FC<RegistrationFlowProps> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState<'role' | 'details' | 'success'>('role');
  const { isDark, toggleTheme } = useTheme();
  const [selectedRole, setSelectedRole] = useState<'agent' | 'home_seeker' | null>(null);
  const [showAgentForm, setShowAgentForm] = useState(false);
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

  if (showAgentForm) {
    return (
      <AgentRegistrationForm 
        onClose={() => {
          setShowAgentForm(false);
          setSelectedRole(null);
        }}
      />
    );
  }

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
    if (role === 'agent') {
      setShowAgentForm(true);
    } else {
      setCurrentStep('details');
    }
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

    try {
      const success = await register(
        formData.name.trim(),
        formData.email.trim(),
        formData.password,
        selectedRole!
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Theme Toggle */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={toggleTheme}
            className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>
        </div>

        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="max-w-4xl w-full">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center space-x-4 mb-6">
                <FindSheltaLogo size={64} />
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">FindShelta</h1>
              </div>
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
                Choose Your Journey
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Select how you'd like to use FindShelta to get started with the right experience for you
              </p>
            </div>

            {/* Role Cards */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Home Seeker Card */}
              <div
                onClick={() => handleRoleSelect('home_seeker')}
                className="group cursor-pointer bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-slate-700 hover:shadow-2xl transition-all duration-500 hover:scale-105"
              >
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Home className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Find Your Dream Home
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    Browse thousands of properties, save your favorites, and connect directly with agents via WhatsApp
                  </p>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-center space-x-2 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="w-5 h-5" />
                      <span>Free to use forever</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="w-5 h-5" />
                      <span>Video property tours</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle className="w-5 h-5" />
                      <span>Direct agent contact</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 px-6 rounded-xl font-medium group-hover:from-emerald-700 group-hover:to-emerald-800 transition-all duration-300">
                    Start House Hunting
                  </div>
                </div>
              </div>

              {/* Agent Card */}
              <div
                onClick={() => handleRoleSelect('agent')}
                className="group cursor-pointer bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-slate-700 hover:shadow-2xl transition-all duration-500 hover:scale-105"
              >
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <UserCheck className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Grow Your Business
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    List properties with video tours, manage clients, and grow your real estate business
                  </p>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400">
                      <CheckCircle className="w-5 h-5" />
                      <span>Professional dashboard</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400">
                      <CheckCircle className="w-5 h-5" />
                      <span>Video listing tools</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400">
                      <CheckCircle className="w-5 h-5" />
                      <span>Client management</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-medium group-hover:from-blue-700 group-hover:to-blue-800 transition-all duration-300">
                    Start Listing Properties
                  </div>
                </div>
              </div>
            </div>

            {/* Features Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">🎉 FREE RENEWAL IF NO SALES IN 30 DAYS</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-center space-x-2">
                  <span>✨</span>
                  <span>Video-enhanced listings</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span>💬</span>
                  <span>Direct WhatsApp contact</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span>🌐</span>
                  <span>Web-based platform</span>
                </div>
              </div>
            </div>

            {/* Sign In Link */}
            <div className="text-center mt-8">
              <button
                onClick={onBack}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Already have an account? <span className="text-blue-600 dark:text-blue-400 font-medium">Sign in</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'details') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Theme Toggle */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={toggleTheme}
            className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>
        </div>

        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="max-w-lg w-full">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-green-600 text-white rounded-full font-medium">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="w-16 h-1 bg-blue-600 rounded"></div>
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-medium">
                  2
                </div>
                <div className="w-16 h-1 bg-gray-300 dark:bg-slate-600 rounded"></div>
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 dark:bg-slate-600 text-gray-600 dark:text-gray-400 rounded-full font-medium">
                  3
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-slate-700">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <FindSheltaLogo size={48} />
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h1>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
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
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 underline transition-colors mt-2"
                >
                  Change role
                </button>
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 text-sm mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-4 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-all duration-300"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-4 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-all duration-300"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-4 pr-12 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-all duration-300"
                      placeholder="Create a secure password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Must be at least 6 characters long
                  </p>
                </div>



                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 ${
                    selectedRole === 'agent'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                      : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create My Account</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-12 border border-gray-200 dark:border-slate-700">
          {/* Success Animation */}
          <div className="mb-8">
            <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to FindShelta! 🎉
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Your account has been created successfully
            </p>
          </div>

          {/* Features Preview */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {selectedRole === 'agent' ? 'List Properties' : 'Browse Properties'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {selectedRole === 'agent' 
                  ? 'Upload and manage your property listings'
                  : 'Discover thousands of available properties'
                }
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Secure Platform
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Your data is protected with enterprise-grade security
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserCheck className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Direct Contact
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Connect instantly via WhatsApp with verified users
              </p>
            </div>
          </div>

          {/* Loading State */}
          <div className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-slate-700 dark:to-slate-600 rounded-2xl p-6">
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
              {selectedRole === 'agent' 
                ? 'Setting up your agent dashboard...' 
                : 'Preparing your property browser...'}
            </p>
            <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-3">
              <div className="bg-gradient-to-r from-blue-600 to-emerald-600 h-3 rounded-full animate-pulse" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationFlow;