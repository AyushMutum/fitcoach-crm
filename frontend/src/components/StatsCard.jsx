import { motion } from 'framer-motion';

export default function StatsCard({ title, value, icon: Icon, trend, trendValue, color = 'primary' }) {
  const colors = {
    primary: 'from-primary-500 to-primary-600 shadow-primary-500/25',
    accent: 'from-accent-500 to-accent-600 shadow-accent-500/25',
    amber: 'from-amber-500 to-amber-600 shadow-amber-500/25',
    red: 'from-red-500 to-red-600 shadow-red-500/25',
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/25',
  };

  const bgColors = {
    primary: 'bg-primary-500/5',
    accent: 'bg-accent-500/5',
    amber: 'bg-amber-500/5',
    red: 'bg-red-500/5',
    blue: 'bg-blue-500/5',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`stat-card ${bgColors[color]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-dark-400 font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {trendValue && (
            <p className={`text-sm mt-2 font-medium ${trend === 'up' ? 'text-accent-400' : 'text-red-400'}`}>
              {trend === 'up' ? '+' : ''}{trendValue}
              <span className="text-dark-500 ml-1">vs last month</span>
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} shadow-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}
