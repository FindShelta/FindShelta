import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: 'agent' | 'home_seeker', whatsappNumber?: string) => Promise<boolean>;
  registerAgent: (agentData: any) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAgentStatus: () => Promise<void>;
  loading: boolean;
  agentStatus: 'pending' | 'approved' | 'rejected' | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    // Initialize auth state with timeout to prevent infinite loading
    const initializeAuth = async () => {
      const timeout = setTimeout(() => {
        console.log('Auth initialization timeout');
        setLoading(false);
      }, 3000); // 3 second timeout

      try {
        const { data: { session } } = await supabase.auth.getSession();
        clearTimeout(timeout);
        
        if (session?.user) {
          const userData = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email!,
            role: session.user.user_metadata?.role || 'home_seeker',
            whatsappNumber: session.user.user_metadata?.whatsapp_number,
            isSubscribed: true,
            createdAt: new Date(session.user.created_at)
          };
          setUser(userData);
          
          // Check agent status if user is an agent
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

    // Listen for auth state changes with error handling
    let subscription;
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_OUT' || !session) {
            setUser(null);
          } else if (session?.user) {
            const userData = {
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email!,
              role: session.user.user_metadata?.role || 'home_seeker',
              whatsappNumber: session.user.user_metadata?.whatsapp_number,
              isSubscribed: true,
              createdAt: new Date(session.user.created_at)
            };
            setUser(userData);
            
            // Check agent status if user is an agent
            if (userData.role === 'agent') {
              checkAgentStatus(session.user.id);
            }
          }
        }
      );
      subscription = data.subscription;
    } catch (error) {
      console.error('Auth listener setup failed:', error);
      setLoading(false);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
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
        if (error.code === '42P01') {
          // Table doesn't exist, set status to null
          setAgentStatus(null);
          return;
        }
        if (error.code === 'PGRST116') {
          // No agent record found, set status to null
          setAgentStatus(null);
          return;
        }
        console.error('Error checking agent status:', error);
        setAgentStatus(null);
        return;
      }

      console.log('Agent status from DB:', agent?.status); // Debug log
      setAgentStatus(agent?.status || 'pending');
    } catch (error) {
      console.error('Error checking agent status:', error);
      setAgentStatus('pending');
    }
  };

  const refreshAgentStatus = async () => {
    if (user?.id) {
      await checkAgentStatus(user.id);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase logout error:', error.message);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear user state regardless of Supabase response
      setUser(null);
      setAgentStatus(null);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error('Supabase login failed:', authError.message);
        return false;
      }

      // Supabase login successful
      if (authData.user) {
        const userData = {
          id: authData.user.id,
          name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || 'User',
          email: authData.user.email!,
          role: authData.user.user_metadata?.role || 'home_seeker',
          whatsappNumber: authData.user.user_metadata?.whatsapp_number,
          isSubscribed: true,
          createdAt: new Date(authData.user.created_at)
        };

        setUser(userData);
        
        // Check agent status if user is an agent
        if (userData.role === 'agent') {
          await checkAgentStatus(authData.user.id);
        }
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, role: 'agent' | 'home_seeker'): Promise<boolean> => {
    // Block agent registration through this function
    if (role === 'agent') {
      console.error('Agents must register through AgentRegistrationForm');
      return false;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });

      if (authError) {
        console.error('Supabase registration failed:', authError.message);
        return false;
      }

      // Supabase registration successful
      if (authData.user) {
        const newUser = {
          id: authData.user.id,
          name,
          email,
          role,
          isSubscribed: true,
          createdAt: new Date(authData.user.created_at),
        };

        setUser(newUser);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const registerAgent = async (agentData: any): Promise<boolean> => {
    try {
      // Sign out first to prevent auto-login
      await supabase.auth.signOut();
      
      // Create auth user without auto-login
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: agentData.email,
        password: agentData.password,
        options: {
          data: {
            name: agentData.fullName,
            role: 'agent'
          }
        }
      });

      if (authError) {
        console.error('Auth user creation failed:', authError.message);
        return false;
      }

      if (!authData.user) {
        console.error('No user returned from auth signup');
        return false;
      }

      // Immediately sign out to prevent auto-login
      await supabase.auth.signOut();

      // Then create agent record with user_id
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
        return false;
      }

      return true;
    } catch (error) {
      console.error('Agent registration error:', error);
      return false;
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        console.error('Password reset failed:', error.message);
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

  return (
    <AuthContext.Provider value={{ user, login, register, registerAgent, resetPassword, updatePassword, logout, refreshAgentStatus, loading, agentStatus }}>
      {children}
    </AuthContext.Provider>
  );
};