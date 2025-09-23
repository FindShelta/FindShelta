import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import HomePage from './components/Landing/HomePage';
import RegistrationFlow from './components/Auth/RegistrationFlow';
import LoginForm from './components/Auth/LoginForm';
import HomeSeekerDashboard from './components/Dashboard/HomeSeekerDashboard';
import AgentDashboard from './components/Dashboard/AgentDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';

function App() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'login' | 'register'>('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show appropriate dashboard
  if (user) {
    if (user.role === 'admin') {
      return <AdminDashboard />;
    }
    return user.role === 'agent' ? <AgentDashboard /> : <HomeSeekerDashboard />;
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

  // Default: Show homepage
  return (
    <HomePage
      onGetStarted={() => setCurrentView('register')}
      onSignIn={() => setCurrentView('login')}
    />
  );
}

export default App;