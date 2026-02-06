import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { ComparisonProvider } from './contexts/ComparisonContext';
import { AlertProvider } from './contexts/AlertContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import HomePage from './components/Landing/HomePage';
import RegistrationFlow from './components/Auth/RegistrationFlow';
import LoginForm from './components/Auth/LoginForm';
import ResetPassword from './components/Auth/ResetPassword';
import HomeSeekerDashboard from './components/Dashboard/HomeSeekerDashboard';
import AgentDashboard from './components/Dashboard/AgentDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import SubscriptionPlans from './components/Subscription/SubscriptionPlans';
import DatabaseTest from './components/Debug/DatabaseTest';
import { supabase } from './lib/supabase';
import './utils/makeAdmin';


function App() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'login' | 'register' | 'reset-password' | 'subscription' | 'debug'>('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    // Check URL path for routing
    const path = window.location.pathname;
    if (path === '/subscription') {
      setCurrentView('subscription');
      return;
    }
    if (path === '/debug') {
      setCurrentView('debug');
      return;
    }
    
    // Check if this is a password reset redirect
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const type = urlParams.get('type');
    
    if (accessToken && type === 'recovery') {
      setCurrentView('reset-password');
    }
  }, []);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('id')
          .eq('user_id', user.id)
          .single();

        setIsAdmin(!error && !!data);
      } catch (err) {
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  if (loading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow debug view without authentication
  if (currentView === 'debug') {
    return <DatabaseTest />;
  }

  // If user is authenticated, show appropriate dashboard
  if (user) {
    if (isAdmin) {
      return <AdminDashboard />;
    }
    return user.role === 'agent' ? <AgentDashboard /> : (
      <ComparisonProvider>
        <AlertProvider>
          <FavoritesProvider>
            <HomeSeekerDashboard />
          </FavoritesProvider>
        </AlertProvider>
      </ComparisonProvider>
    );
  }

  // Show different views based on currentView state
  if (currentView === 'login') {
    return (
      <LoginForm
        onBack={() => setCurrentView('home')}
        onSwitchToRegister={() => setCurrentView('register')}
      />
    );
  }

  if (currentView === 'register') {
    return (
      <RegistrationFlow
        onBack={() => setCurrentView('login')}
      />
    );
  }

  if (currentView === 'reset-password') {
    return <ResetPassword />;
  }

  if (currentView === 'subscription') {
    return <SubscriptionPlans />;
  }



  // Default: Show homepage
  return (
    <HomePage
      onGetStarted={() => setCurrentView('register')}
      onSignIn={() => setCurrentView('login')}
    />
  );
}

export default App;