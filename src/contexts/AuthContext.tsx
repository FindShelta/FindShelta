import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: 'agent' | 'home_seeker', whatsappNumber?: string) => Promise<boolean>;
  registerAgent: (agentData: any) => Promise<boolean>;
  logout: () => Promise<void>;
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
        console.error('Error checking agent status:', error);
        setAgentStatus('pending');
        return;
      }

      setAgentStatus(agent?.status || 'pending');
    } catch (error) {
      console.error('Error checking agent status:', error);
      setAgentStatus('pending');
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

  const register = async (name: string, email: string, password: string, role: 'agent' | 'home_seeker', whatsappNumber?: string): Promise<boolean> => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
            whatsapp_number: whatsappNumber
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
          whatsappNumber,
          isSubscribed: role === 'home_seeker' ? true : false,
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
      // First create auth user
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
        console.error('Agent auth registration failed:', authError.message);
        return false;
      }

      if (authData.user) {
        // Create agent record
        const { error: agentError } = await supabase
          .from('agent_registration')
          .insert({
            user_id: authData.user.id,
            full_name: agentData.fullName,
            email: agentData.email,
            phone: agentData.phone,
            company_name: agentData.companyName,
            license_number: agentData.licenseNumber,
            experience_years: agentData.experienceYears,
            specialization: agentData.specialization,
            bio: agentData.bio,
            status: 'pending'
          });

        if (agentError) {
          if (agentError.code === '42P01') {
            console.error('Agent registration table does not exist. Please create it manually.');
            alert('Agent registration table not found. Please contact administrator.');
            return false;
          }
          console.error('Agent record creation failed:', agentError.message);
          return false;
        }

        setAgentStatus('pending');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Agent registration error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, registerAgent, logout, loading, agentStatus }}>
      {children}
    </AuthContext.Provider>
  );
};