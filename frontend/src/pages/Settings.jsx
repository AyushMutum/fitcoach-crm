import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  UserCircleIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    businessName: user?.businessName || '',
    phone: user?.phone || '',
    specialization: user?.specialization || '',
    bio: user?.bio || '',
    certifications: user?.certifications?.join(', ') || '',
  });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        ...profile,
        certifications: profile.certifications.split(',').map(c => c.trim()).filter(Boolean),
      });
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await updateProfile({ password: passwords.new });
      setPasswords({ current: '', new: '', confirm: '' });
      toast.success('Password changed');
    } catch {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'profile', icon: UserCircleIcon, label: 'Profile' },
    { key: 'business', icon: BuildingOfficeIcon, label: 'Business' },
    { key: 'security', icon: ShieldCheckIcon, label: 'Security' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-dark-400 text-sm mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex gap-2">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.key ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25' : 'bg-dark-800/50 text-dark-400 hover:text-dark-200'
            }`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <form onSubmit={handleProfileUpdate} className="glass-card p-6 space-y-5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user?.name?.charAt(0)?.toUpperCase() || 'C'}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{user?.name}</h3>
                <p className="text-sm text-dark-400">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Full Name</label>
                <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="input-label">Phone</label>
                <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="input-label">Specialization</label>
                <input value={profile.specialization} onChange={(e) => setProfile({ ...profile, specialization: e.target.value })} className="input-field" placeholder="e.g., Strength Training, Yoga" />
              </div>
              <div>
                <label className="input-label">Certifications</label>
                <input value={profile.certifications} onChange={(e) => setProfile({ ...profile, certifications: e.target.value })} className="input-field" placeholder="Comma separated" />
              </div>
            </div>
            <div>
              <label className="input-label">Bio</label>
              <textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={3} className="input-field" placeholder="Tell clients about yourself..." />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {activeTab === 'business' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <form onSubmit={handleProfileUpdate} className="glass-card p-6 space-y-5">
            <div>
              <label className="input-label">Business Name</label>
              <input value={profile.businessName} onChange={(e) => setProfile({ ...profile, businessName: e.target.value })} className="input-field" placeholder="Your coaching business name" />
            </div>
            <div className="glass-card p-4 bg-dark-800/30">
              <h4 className="text-sm font-semibold text-white mb-3">Subscription Plans</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: 'Basic', price: '$49/mo', color: 'from-dark-600 to-dark-700' },
                  { name: 'Standard', price: '$99/mo', color: 'from-primary-600 to-primary-700' },
                  { name: 'Premium', price: '$149/mo', color: 'from-amber-600 to-amber-700' },
                  { name: 'Elite', price: '$249/mo', color: 'from-accent-600 to-accent-700' },
                ].map(plan => (
                  <div key={plan.name} className={`p-4 rounded-xl bg-gradient-to-br ${plan.color} text-center`}>
                    <p className="text-sm font-semibold text-white">{plan.name}</p>
                    <p className="text-lg font-bold text-white mt-1">{plan.price}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="btn-primary">Save Changes</button>
            </div>
          </form>
        </motion.div>
      )}

      {activeTab === 'security' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <form onSubmit={handlePasswordChange} className="glass-card p-6 space-y-5">
            <h3 className="text-lg font-semibold text-white">Change Password</h3>
            <div>
              <label className="input-label">Current Password</label>
              <input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="input-label">New Password</label>
              <input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="input-label">Confirm New Password</label>
              <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className="input-field" required />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={loading} className="btn-primary">Update Password</button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}
