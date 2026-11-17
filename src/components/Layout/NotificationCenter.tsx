import React, { useState, useEffect } from 'react';
import { Bell, BellOff, CreditCard, Home, Loader2 } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../contexts/AuthContext';
import { pushService } from '../../lib/pushService';

const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, clearNotifications } = useNotifications(user?.id);
  const [isOpen, setIsOpen] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    pushService.isSubscribed().then(setPushEnabled);
  }, []);

  const togglePush = async () => {
    if (!user?.id) return;
    setPushLoading(true);
    if (pushEnabled) {
      await pushService.unregister(user.id);
      setPushEnabled(false);
    } else {
      const ok = await pushService.register(user.id);
      setPushEnabled(ok);
    }
    setPushLoading(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment_approved':
      case 'payment_rejected':
        return <CreditCard className="w-4 h-4" />;
      case 'listing_approved':
      case 'listing_rejected':
        return <Home className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'payment_approved':
      case 'listing_approved':
        return 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30';
      case 'payment_rejected':
      case 'listing_rejected':
        return 'text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30';
      default:
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
    }
  };

  const formatTime = (dateString: string) => {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--text-muted)] hover:bg-[color:var(--surface-strong)] hover:text-[color:var(--text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-expanded={isOpen}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-[color:var(--surface)]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="panel fixed left-4 right-4 top-[4.75rem] z-50 overflow-hidden rounded-2xl shadow-[0_20px_55px_rgba(15,23,42,0.18)] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[min(22rem,calc(100vw-2rem))]">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-[color:var(--border)] px-4 py-3">
              <h3 className="text-sm font-bold text-[color:var(--text)]">Notifications</h3>
              <div className="flex items-center gap-3">
                {/* Push toggle */}
                <button
                  type="button"
                  onClick={togglePush}
                  disabled={pushLoading}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--text-muted)] hover:text-[color:var(--text)] disabled:opacity-50"
                  title={pushEnabled ? 'Disable push notifications' : 'Enable push notifications'}
                >
                  {pushLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : pushEnabled ? (
                    <BellOff className="h-3.5 w-3.5" />
                  ) : (
                    <Bell className="h-3.5 w-3.5" />
                  )}
                  {pushEnabled ? 'Mute' : 'Enable alerts'}
                </button>

                {notifications.length > 0 && (
                  <>
                    <button onClick={markAllAsRead} className="text-xs font-semibold text-[color:var(--brand)] hover:underline">
                      Mark all read
                    </button>
                    <button onClick={clearNotifications} className="text-xs font-semibold text-[color:var(--text-muted)] hover:text-[color:var(--text)]">
                      Clear
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-5 w-5 animate-spin text-[color:var(--text-muted)]" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell className="mx-auto mb-3 h-10 w-10 text-[color:var(--text-muted)] opacity-40" />
                  <p className="text-sm text-[color:var(--text-muted)]">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-[color:var(--border)]">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => markAsRead(n.id)}
                      className={`w-full px-4 py-3 text-left transition-colors hover:bg-[color:var(--surface-strong)] ${!n.read ? 'bg-blue-50/60 dark:bg-blue-900/10' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${getColor(n.type)}`}>
                          {getIcon(n.type)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold text-[color:var(--text)]">{n.title}</p>
                            <div className="flex shrink-0 items-center gap-1.5">
                              {!n.read && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                              <span className="text-[11px] text-[color:var(--text-muted)]">{formatTime(n.created_at)}</span>
                            </div>
                          </div>
                          <p className="mt-0.5 text-xs leading-relaxed text-[color:var(--text-muted)]">{n.message}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
