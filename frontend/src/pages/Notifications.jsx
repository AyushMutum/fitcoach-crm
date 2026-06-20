import { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  BellIcon,
  BellAlertIcon,
  CheckIcon,
  ArrowPathIcon,
  CreditCardIcon,
  CalendarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const typeIcons = {
  subscription_expiry: CalendarIcon,
  payment_due: CreditCardIcon,
  check_in: UserIcon,
  general: BellIcon,
};

const typeColors = {
  subscription_expiry: 'from-amber-500 to-orange-500',
  payment_due: 'from-red-500 to-pink-500',
  check_in: 'from-primary-500 to-blue-500',
  general: 'from-dark-500 to-dark-600',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api.get('/notifications')
      .then(({ data }) => setNotifications(data))
      .catch(() => toast.error('Failed to load notifications'))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch { toast.error('Failed to update'); }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch { toast.error('Failed to update'); }
  };

  const generateAlerts = async () => {
    setGenerating(true);
    try {
      const { data } = await api.post('/notifications/generate');
      toast.success(data.message);
      const { data: refreshed } = await api.get('/notifications');
      setNotifications(refreshed);
    } catch { toast.error('Failed to generate alerts'); }
    finally { setGenerating(false); }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-dark-400 text-sm mt-1">{unreadCount} unread notifications</p>
        </div>
        <div className="flex gap-3">
          <button onClick={generateAlerts} disabled={generating} className="btn-secondary inline-flex items-center gap-2">
            <ArrowPathIcon className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} /> Generate Alerts
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-primary inline-flex items-center gap-2">
              <CheckIcon className="w-4 h-4" /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <BellAlertIcon className="w-12 h-12 text-dark-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No notifications</h3>
          <p className="text-dark-400 mb-6">Click "Generate Alerts" to check for expiring subscriptions and overdue payments</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification, i) => {
            const Icon = typeIcons[notification.type] || BellIcon;
            const color = typeColors[notification.type] || typeColors.general;
            return (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`glass-card p-4 flex items-start gap-4 transition-all ${
                  notification.read ? 'opacity-60' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0 shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{notification.title}</h3>
                      <p className="text-sm text-dark-400 mt-0.5">{notification.message}</p>
                      {notification.client && (
                        <p className="text-xs text-dark-500 mt-1">Client: {notification.client.fullName}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-lg ${
                        notification.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                        notification.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-dark-500/10 text-dark-400'
                      }`}>
                        {notification.priority}
                      </span>
                      {!notification.read && (
                        <button onClick={() => markRead(notification._id)} className="p-1.5 rounded-lg text-dark-400 hover:text-accent-400 hover:bg-accent-500/10 transition-colors">
                          <CheckIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-dark-600 mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
