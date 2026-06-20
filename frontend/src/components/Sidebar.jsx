import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CakeIcon,
  CreditCardIcon,
  DocumentChartBarIcon,
  BellIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  FireIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { path: '/', icon: HomeIcon, label: 'Dashboard' },
  { path: '/clients', icon: UsersIcon, label: 'Clients' },
  { path: '/progress', icon: ChartBarIcon, label: 'Progress' },
  { path: '/workouts', icon: ClipboardDocumentListIcon, label: 'Workouts' },
  { path: '/diets', icon: CakeIcon, label: 'Diet Plans' },
  { path: '/payments', icon: CreditCardIcon, label: 'Payments' },
  { path: '/reports', icon: DocumentChartBarIcon, label: 'Reports' },
  { path: '/notifications', icon: BellIcon, label: 'Notifications' },
  { path: '/settings', icon: Cog6ToothIcon, label: 'Settings' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-dark-900/95 backdrop-blur-xl border-r border-dark-700/50 z-50 transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-b border-dark-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <FireIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">FitCoach</h1>
              <p className="text-xs text-dark-400">CRM Platform</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-dark-700/50">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-200 truncate">{user?.name || 'Coach'}</p>
              <p className="text-xs text-dark-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 mt-1"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
