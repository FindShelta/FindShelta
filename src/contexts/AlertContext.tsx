import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PropertyAlert } from '../types/alert';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface AlertContextType {
  alerts: PropertyAlert[];
  loading: boolean;
  createAlert: (alert: Omit<PropertyAlert, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateAlert: (id: string, updates: Partial<PropertyAlert>) => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
  toggleAlert: (id: string) => Promise<void>;
  refreshAlerts: () => Promise<void>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};

interface AlertProviderProps {
  children: ReactNode;
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<PropertyAlert[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('property_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAlerts(data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async (alertData: Omit<PropertyAlert, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('property_alerts')
      .insert([{ ...alertData, user_id: user.id }])
      .select()
      .single();

    if (!error && data) {
      setAlerts(prev => [data, ...prev]);
    } else {
      throw error;
    }
  };

  const updateAlert = async (id: string, updates: Partial<PropertyAlert>) => {
    const { data, error } = await supabase
      .from('property_alerts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setAlerts(prev => prev.map(alert => alert.id === id ? data : alert));
    } else {
      throw error;
    }
  };

  const deleteAlert = async (id: string) => {
    const { error } = await supabase
      .from('property_alerts')
      .delete()
      .eq('id', id);

    if (!error) {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    } else {
      throw error;
    }
  };

  const toggleAlert = async (id: string) => {
    const alert = alerts.find(a => a.id === id);
    if (alert) {
      await updateAlert(id, { is_active: !alert.is_active });
    }
  };

  const refreshAlerts = async () => {
    await fetchAlerts();
  };

  useEffect(() => {
    fetchAlerts();
  }, [user]);

  return (
    <AlertContext.Provider value={{
      alerts,
      loading,
      createAlert,
      updateAlert,
      deleteAlert,
      toggleAlert,
      refreshAlerts
    }}>
      {children}
    </AlertContext.Provider>
  );
};