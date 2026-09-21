import { useEffect, useState } from 'react';
import { notificationApi } from '../services/api';
import {
  Bell,
  Package,
  TrendingUp,
  Info,
  CheckCheck,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import type { Notification, NotificationType } from '../types';

const typeConfig: Record<NotificationType, { icon: typeof Package; color: string; label: string }> = {
  LOW_STOCK: { icon: AlertTriangle, color: 'text-accent-red bg-accent-red/10', label: 'Low Stock' },
  NEW_LEAD: { icon: TrendingUp, color: 'text-accent-orange bg-accent-orange/10', label: 'New Lead' },
  SYSTEM: { icon: Info, color: 'text-jenga-700 bg-jenga-100', label: 'System' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await notificationApi.getMine();
        setNotifications(res.data);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const markRead = async (id: number) => {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // silently fail
    }
  };

  const markAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // silently fail
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="btn-secondary text-sm inline-flex items-center gap-1.5"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-jenga-600 animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-1">No notifications</h3>
          <p className="text-sm text-gray-500">We'll alert you here for low stock and new leads.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
          {notifications.map((n) => {
            const config = typeConfig[n.type];
            const Icon = config.icon;
            return (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`p-4 flex gap-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !n.isRead ? 'bg-jenga-50/50' : ''
                }`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-medium text-gray-500">{config.label}</span>
                      <p className="text-sm text-gray-900 mt-0.5">{n.message}</p>
                    </div>
                    {!n.isRead && (
                      <span className="flex-shrink-0 w-2 h-2 bg-jenga-600 rounded-full mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
