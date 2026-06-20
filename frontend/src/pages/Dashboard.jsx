import { useState, useEffect } from 'react';
import { api, useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import StatsCard from '../components/StatsCard';
import {
  UsersIcon,
  UserGroupIcon,
  UserMinusIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import toast from 'react-hot-toast';

const PLAN_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        setStats(data);
      } catch (error) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const planData = [
    { name: 'Basic', value: 30 },
    { name: 'Standard', value: 35 },
    { name: 'Premium', value: 25 },
    { name: 'Elite', value: 10 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-bold text-white"
          >
            Welcome back, {user?.name?.split(' ')[0]}
          </motion.h1>
          <p className="text-dark-400 mt-1">Here's what's happening with your clients today</p>
        </div>
        <Link to="/clients/add" className="btn-primary inline-flex items-center gap-2 self-start">
          <PlusIcon className="w-5 h-5" /> Add Client
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatsCard title="Total Clients" value={stats?.totalClients || 0} icon={UsersIcon} color="primary" />
        <StatsCard title="Active" value={stats?.activeClients || 0} icon={UserGroupIcon} color="accent" />
        <StatsCard title="Inactive" value={stats?.inactiveClients || 0} icon={UserMinusIcon} color="red" />
        <StatsCard title="Expiring Soon" value={stats?.expiringSubscriptions || 0} icon={ClockIcon} color="amber" />
        <StatsCard title="Monthly Revenue" value={`$${(stats?.monthlyRevenue || 0).toLocaleString()}`} icon={CurrencyDollarIcon} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Revenue Overview</h2>
            <div className="flex items-center gap-2 text-sm text-dark-400">
              <ArrowTrendingUpIcon className="w-4 h-4 text-accent-400" />
              <span>Last 6 months</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats?.chartData || []}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#f1f5f9',
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Plan Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={planData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
              >
                {planData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PLAN_COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#f1f5f9',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-4">
            {planData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2 text-xs text-dark-300">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PLAN_COLORS[i] }} />
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">New Clients</h2>
            <span className="text-sm text-dark-400">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats?.chartData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#f1f5f9',
                }}
              />
              <Bar dataKey="clients" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Clients</h2>
            <Link to="/clients" className="text-sm text-primary-400 hover:text-primary-300">View all</Link>
          </div>
          <div className="space-y-3">
            {(stats?.recentClients || []).map((client, i) => (
              <motion.div
                key={client._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-3 rounded-xl bg-dark-800/30 hover:bg-dark-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                    {client.fullName?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{client.fullName}</p>
                    <p className="text-xs text-dark-400">{client.fitnessGoal || 'No goal set'}</p>
                  </div>
                </div>
                <span className={client.status === 'Active' ? 'badge-success' : 'badge-neutral'}>
                  {client.status}
                </span>
              </motion.div>
            ))}
            {(!stats?.recentClients || stats.recentClients.length === 0) && (
              <p className="text-center text-dark-400 py-8">No clients yet. Add your first client!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
