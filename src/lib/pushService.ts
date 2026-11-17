import { supabase } from './supabase';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export const pushService = {
  async isSupported(): Promise<boolean> {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  },

  async getPermission(): Promise<NotificationPermission> {
    return Notification.permission;
  },

  async requestPermission(): Promise<boolean> {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  async register(userId: string): Promise<boolean> {
    try {
      if (!(await this.isSupported())) return false;
      if (!(await this.requestPermission())) return false;
      if (!VAPID_PUBLIC_KEY) {
        console.warn('VAPID public key not set — push notifications disabled');
        return false;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const { endpoint, keys } = subscription.toJSON() as any;

      await supabase.from('push_subscriptions').upsert(
        { user_id: userId, endpoint, p256dh: keys.p256dh, auth: keys.auth },
        { onConflict: 'endpoint' }
      );

      return true;
    } catch (error) {
      console.error('Push registration failed:', error);
      return false;
    }
  },

  async unregister(userId: string): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw.js');
      if (!registration) return;

      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return;

      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId)
        .eq('endpoint', subscription.endpoint);

      await subscription.unsubscribe();
    } catch (error) {
      console.error('Push unregister failed:', error);
    }
  },

  async isSubscribed(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw.js');
      if (!registration) return false;
      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch {
      return false;
    }
  },
};
