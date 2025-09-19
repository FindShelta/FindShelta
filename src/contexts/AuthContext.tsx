import React, { createContext, useContext, useState, useEffect } from 'react';
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
    // Initialize auth state from localStorage only (mock authentication)
    const initializeAuth = () => {
      try {
        // Check for stored user data
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const logout = () => {
    // Clear local state only (mock authentication)
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
      
      // Mock authentication - in production, this would call your API
      const users: StoredUser[] = JSON.parse(localStorage.getItem('users') || '[]');
      const foundUser = users.find((u: StoredUser) => u.email === email && u.password === password);
      
      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
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
      const users: StoredUser[] = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if user already exists
      if (users.find((u: StoredUser) => u.email === email)) {
        return false;
      }

      const newUser = {
        id: crypto.randomUUID(),
        name,
        email,
        password, // Store password for mock authentication
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