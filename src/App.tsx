import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
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
import AdminPortal from './components/Admin/AdminPortal';
import SubscriptionPlans from './components/Subscription/SubscriptionPlans';
import DatabaseTest from './components/Debug/DatabaseTest';
import './utils/makeAdmin';

const FullScreenLoader: React.FC<{ label?: string }> = ({ label = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center p-6">
    <div className="glass-card rounded-2xl px-8 py-7 text-center">
      <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-[color:var(--text-muted)]">{label}</p>
    </div>
  </div>
);

const DashboardRoute: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'agent') {
    return <AgentDashboard />;
  }

  return (
    <ComparisonProvider>
      <AlertProvider>
        <FavoritesProvider>
          <HomeSeekerDashboard />
        </FavoritesProvider>
      </AlertProvider>
    </ComparisonProvider>
  );
};

const LandingRoute: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <HomePage
      onGetStarted={() => navigate('/register')}
      onSignIn={() => navigate('/login')}
    />
  );
};

const LoginRoute: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <LoginForm
      onBack={() => navigate('/')}
      onSwitchToRegister={() => navigate('/register')}
    />
  );
};

const RegisterRoute: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <RegistrationFlow onBack={() => navigate('/login')} />;
};

const NotFoundRoute: React.FC = () => <Navigate to="/" replace />;

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingRoute />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/register" element={<RegisterRoute />} />
      <Route path="/dashboard" element={<DashboardRoute />} />
      <Route path="/admin" element={<AdminPortal />} />
      <Route path="/subscription" element={<SubscriptionPlans />} />
      <Route path="/debug" element={<DatabaseTest />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="*" element={<NotFoundRoute />} />
    </Routes>
  );
}

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
