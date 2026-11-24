import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';

interface RegistrationResult {
  success: boolean;
  requiresEmailVerification: boolean;
}

interface AgentRegistrationData {
  fullName: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: 'agent' | 'home_seeker') => Promise<RegistrationResult>;
  registerAgent: (agentData: AgentRegistrationData) => Promise<RegistrationResult>;
  resendVerificationEmail: (email: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
  updateWhatsappNumber: (whatsappNumber: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAgentStatus: () => Promise<void>;
  loading: boolean;
  agentStatus: 'pending' | 'approved' | 'rejected' | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getPublicSiteUrl = () => {
  const configuredSiteUrl = import.meta.env.VITE_PUBLIC_SITE_URL?.trim();
  return configuredSiteUrl || (import.meta.env.PROD ? 'https://findshelta.com' : window.location.origin);
};

const getPasswordResetRedirectUrl = () => new URL('/reset-password', getPublicSiteUrl()).toString();
const getEmailVerificationRedirectUrl = () => new URL('/verify-email', getPublicSiteUrl()).toString();

const isVerifiedAuthUser = (authUser: SupabaseAuthUser) => Boolean(authUser.email_confirmed_at || authUser.confirmed_at);

const mapAuthUser = (authUser: SupabaseAuthUser): User => ({
  id: authUser.id,
  name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
  email: authUser.email!,
  role: (authUser.user_metadata?.role || 'home_seeker') as User['role'],
  whatsappNumber: authUser.user_metadata?.whatsapp_number,
  isSubscribed: true,
  createdAt: new Date(authUser.created_at),
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [agentStatus, setAgentStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 3000);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        clearTimeout(timeout);

        if (session?.user && isVerifiedAuthUser(session.user)) {
          const userData = mapAuthUser(session.user);
          setUser(userData);

          if (userData.role === 'agent') {
            checkAgentStatus(session.user.id);
          }
        }
      } catch (error) {
        clearTimeout(timeout);
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    let subscription: { unsubscribe: () => void } | undefined;
    try {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
        } else if (session?.user && isVerifiedAuthUser(session.user)) {
          const userData = mapAuthUser(session.user);
          setUser(userData);

          if (userData.role === 'agent') {
            checkAgentStatus(session.user.id);
          }
        } else {
          setUser(null);
        }
      });
      subscription = data.subscription;
    } catch (error) {
      console.error('Auth listener setup failed:', error);
      setLoading(false);
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const checkAgentStatus = async (userId: string) => {
    try {
      const { data: agent, error } = await supabase
        .from('agent_registration')
        .select('status')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === '42P01' || error.code === 'PGRST116') {
          setAgentStatus(null);
          return;
        }
        console.error('Error checking agent status:', error);
        setAgentStatus(null);
        return;
      }

      setAgentStatus(agent?.status || 'pending');
    } catch (error) {
      console.error('Error checking agent status:', error);
      setAgentStatus('pending');
    }
  };

  const refreshAgentStatus = async () => {
    if (user?.id) await checkAgentStatus(user.id);
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error('Supabase logout error:', error.message);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setAgentStatus(null);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      if (authError) {
        console.error('Supabase login failed:', authError.message);
        return false;
      }

      if (authData.user && isVerifiedAuthUser(authData.user)) {
        const userData = mapAuthUser(authData.user);
        setUser(userData);

        if (userData.role === 'agent') await checkAgentStatus(authData.user.id);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, role: 'agent' | 'home_seeker'): Promise<RegistrationResult> => {
    if (role === 'agent') {
      console.error('Agents must register through AgentRegistrationForm');
      return { success: false, requiresEmailVerification: false };
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role },
          emailRedirectTo: getEmailVerificationRedirectUrl(),
        }
      });

      if (authError) {
        console.error('Supabase registration failed:', authError.message);
        return { success: false, requiresEmailVerification: false };
      }

      if (authData.user) {
        const requiresEmailVerification = !authData.session || !isVerifiedAuthUser(authData.user);
        if (!requiresEmailVerification) setUser(mapAuthUser(authData.user));
        else setUser(null);
        return { success: true, requiresEmailVerification };
      }

      return { success: false, requiresEmailVerification: false };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, requiresEmailVerification: false };
    }
  };

  const registerAgent = async (agentData: AgentRegistrationData): Promise<RegistrationResult> => {
    try {
      await supabase.auth.signOut();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: agentData.email,
        password: agentData.password,
        options: {
          data: { name: agentData.fullName, role: 'agent' },
          emailRedirectTo: getEmailVerificationRedirectUrl(),
        }
      });

      if (authError) {
        console.error('Auth user creation failed:', authError.message);
        return { success: false, requiresEmailVerification: false };
      }

      if (!authData.user) {
        console.error('No user returned from auth signup');
        return { success: false, requiresEmailVerification: false };
      }

      await supabase.auth.signOut();

      const { error: agentError } = await supabase
        .from('agent_registration')
        .insert({
          full_name: agentData.fullName,
          email: agentData.email,
          user_id: authData.user.id,
          status: 'pending'
        });

      if (agentError) {
        console.error('Agent record creation failed:', agentError.message);
        return { success: false, requiresEmailVerification: false };
      }

      return { success: true, requiresEmailVerification: !authData.session || !isVerifiedAuthUser(authData.user) };
    } catch (error) {
      console.error('Agent registration error:', error);
      return { success: false, requiresEmailVerification: false };
    }
  };

  const resendVerificationEmail = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: { emailRedirectTo: getEmailVerificationRedirectUrl() },
      });

      if (error) {
        console.error('Verification email resend failed:', error.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Verification email resend error:', error);
      return false;
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const redirectTo = getPasswordResetRedirectUrl();
      console.log('Password reset redirectTo:', redirectTo);

      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

      if (error) {
        console.error('Password reset failed:', error.message, error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      return false;
    }
  };

  const updatePassword = async (password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.error('Password update failed:', error.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Password update error:', error);
      return false;
    }
  };

  const updateWhatsappNumber = async (whatsappNumber: string): Promise<boolean> => {
    const normalizedWhatsapp = whatsappNumber.trim();

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { whatsapp_number: normalizedWhatsapp }
      });

      if (error) {
        console.error('WhatsApp update failed:', error.message);
        return false;
      }

      if (user?.id) {
        const { error: listingsError } = await supabase
          .from('listings')
          .update({ agent_whatsapp: normalizedWhatsapp })
          .eq('agent_id', user.id);

        if (listingsError) {
          if (listingsError.code === '42703') {
            setUser((prev) => prev ? { ...prev, whatsappNumber: data.user.user_metadata?.whatsapp_number || normalizedWhatsapp } : prev);
            return true;
          }
          console.error('Listing WhatsApp sync failed:', listingsError.message);
          return false;
        }
      }

      setUser((prev) => prev ? { ...prev, whatsappNumber: data.user.user_metadata?.whatsapp_number || normalizedWhatsapp } : prev);
      return true;
    } catch (error) {
      console.error('WhatsApp update error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, registerAgent, resendVerificationEmail, resetPassword, updatePassword, updateWhatsappNumber, logout, refreshAgentStatus, loading, agentStatus }}>
      {children}
    </AuthContext.Provider>
  );
};
