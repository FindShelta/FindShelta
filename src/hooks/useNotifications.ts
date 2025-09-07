import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Notification {
  id: string;
  type: 'payment_approved' | 'payment_rejected' | 'listing_approved' | 'listing_rejected';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to real-time notifications
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'payments',
        filter: `agent_id=eq.${userId}`
      }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          const payment = payload.new;
          if (payment.status === 'approved') {
            addNotification({
              type: 'payment_approved',
              title: 'Payment Approved',
              message: `Your ${payment.plan} payment has been approved!`
            });
          } else if (payment.status === 'rejected') {
            addNotification({
              type: 'payment_rejected',
              title: 'Payment Rejected',
              message: `Your ${payment.plan} payment was rejected. Please resubmit.`
            });
          }
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'listings',
        filter: `agent_id=eq.${userId}`
      }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          const listing = payload.new;
          if (listing.is_approved) {
            addNotification({
              type: 'listing_approved',
              title: 'Listing Approved',
              message: `Your listing "${listing.title}" has been approved!`
            });
          } else if (listing.status === 'rejected') {
            addNotification({
              type: 'listing_rejected',
              title: 'Listing Rejected',
              message: `Your listing "${listing.title}" was rejected.`
            });
          }
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      created_at: new Date().toISOString()
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 10000);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications
  };
};