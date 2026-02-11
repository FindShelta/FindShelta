import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import AdminLogin from './components/Admin/AdminLogin';
import SubscriptionPlans from './components/Subscription/SubscriptionPlans';
import DatabaseTest from './components/Debug/DatabaseTest';
import { supabase } from './lib/supabase';
import './utils/makeAdmin';


const AdminRoute = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .single();
      setIsAdmin(!!data);
      setLoading(false);
    };
    checkAdmin();
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  if (!user) return <AdminLogin />;
  if (!isAdmin) return <Navigate to="/" />;
  return <AdminDashboard />;
};

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

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="/debug" element={<DatabaseTest />} />
        <Route path="/subscription" element={<SubscriptionPlans />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/login" element={<LoginForm onBack={() => window.location.href = '/'} onSwitchToRegister={() => window.location.href = '/register'} />} />
        <Route path="/register" element={<RegistrationFlow onBack={() => window.location.href = '/login'} />} />
        <Route path="/" element={
          user ? (
            user.role === 'agent' ? <AgentDashboard /> : (
              <ComparisonProvider>
                <AlertProvider>
                  <FavoritesProvider>
                    <HomeSeekerDashboard />
                  </FavoritesProvider>
                </AlertProvider>
              </ComparisonProvider>
            )
          ) : (
            currentView === 'login' ? (
              <LoginForm onBack={() => setCurrentView('home')} onSwitchToRegister={() => setCurrentView('register')} />
            ) : currentView === 'register' ? (
              <RegistrationFlow onBack={() => setCurrentView('login')} />
            ) : (
              <HomePage onGetStarted={() => setCurrentView('register')} onSignIn={() => setCurrentView('login')} />
            )
          )
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;