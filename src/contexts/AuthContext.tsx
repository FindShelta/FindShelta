import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

// Interface for stored user data (includes password for authentication)
interface StoredUser extends User {
  password: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: 'agent' | 'home_seeker', whatsappNumber?: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
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

  useEffect(() => {
    // Initialize auth state with timeout to prevent infinite loading
    const initializeAuth = async () => {
      const timeoutId = setTimeout(() => {
        console.log('Auth initialization timeout, using localStorage fallback');
        // Fallback to localStorage if Supabase takes too long
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
          }
        } catch (localError) {
          console.error('localStorage error:', localError);
        }
        setLoading(false);
      }, 3000); // 3 second timeout

      try {
        // Try Supabase session check with timeout
        const sessionPromise = supabase.auth.getSession();
        const { data: { session } } = await Promise.race([
          sessionPromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 2000)
          )
        ]);
        
        clearTimeout(timeoutId);
        
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
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          // No Supabase session, check localStorage
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
          }
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.log('Supabase session check failed, using localStorage:', error.message);
        // Fallback to localStorage
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
          }
        } catch (localError) {
          console.error('localStorage error:', localError);
          localStorage.removeItem('user');
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for Supabase auth state changes (with error handling)
    let subscription;
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_OUT' || !session) {
            setUser(null);
            localStorage.removeItem('user');
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
            localStorage.setItem('user', JSON.stringify(userData));
          }
        }
      );
      subscription = data.subscription;
    } catch (error) {
      console.log('Auth state listener setup failed:', error.message);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const logout = async () => {
    // Sign out from Supabase (will fail silently if not using Supabase)
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.log('Supabase signout failed (expected if using local auth)');
    }
    
    // Clear local state
    setUser(null);
    localStorage.removeItem('user');
    // DON'T clear 'users' - this contains all registered users
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Special handling for hardcoded admin credentials
      if (email === 'agantiembennett@gmail.com' && password === 'Benneth@200101') {
        const adminUser = {
          id: '91be2e50-c55a-47ff-8239-d949191ea0df',
          name: 'Admin User',
          email: 'agantiembennett@gmail.com',
          role: 'admin' as const,
          isSubscribed: true,
          createdAt: new Date()
        };
        
        setUser(adminUser);
        localStorage.setItem('user', JSON.stringify(adminUser));
        return true;
      }
      
      // Try Supabase auth first
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.log('Supabase login failed, using fallback:', authError.message);
        // Fallback to local storage
        const users: StoredUser[] = JSON.parse(localStorage.getItem('users') || '[]');
        const foundUser = users.find((u: StoredUser) => u.email === email && u.password === password);
        
        if (foundUser) {
          const { password: _, ...userWithoutPassword } = foundUser;
          setUser(userWithoutPassword);
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          return true;
        }
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
        localStorage.setItem('user', JSON.stringify(userData));
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
      // Try Supabase auth first
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
        console.log('Supabase registration failed, using fallback:', authError.message);
        
        // If user already exists in Supabase, don't create in localStorage
        if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
          return false;
        }
        
        // Fallback to local storage for other errors
        const users: StoredUser[] = JSON.parse(localStorage.getItem('users') || '[]');
        
        if (users.find((u: StoredUser) => u.email === email)) {
          return false;
        }

        const newUser = {
          id: crypto.randomUUID(),
          name,
          email,
          password,
          role,
          whatsappNumber,
          isSubscribed: role === 'home_seeker' ? true : false,
          createdAt: new Date(),
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        const { password: _, ...userWithoutPassword } = newUser;
        setUser(userWithoutPassword);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        return true;
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
          createdAt: new Date(),
        };

        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};