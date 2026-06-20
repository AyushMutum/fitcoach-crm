import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FireIcon, UserIcon, EnvelopeIcon, LockClosedIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', businessName: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.businessName);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', icon: UserIcon, placeholder: 'John Smith' },
    { key: 'email', label: 'Email Address', type: 'email', icon: EnvelopeIcon, placeholder: 'coach@example.com' },
    { key: 'businessName', label: 'Business Name', type: 'text', icon: BuildingOfficeIcon, placeholder: 'Elite Fitness Coaching' },
    { key: 'password', label: 'Password', type: 'password', icon: LockClosedIcon, placeholder: 'Min 6 characters' },
    { key: 'confirmPassword', label: 'Confirm Password', type: 'password', icon: LockClosedIcon, placeholder: 'Confirm password' },
  ];

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <FireIcon className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">FitCoach CRM</span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2 text-center">Create your account</h1>
        <p className="text-dark-400 mb-8 text-center">Start managing your coaching business</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ key, label, type, icon: Icon, placeholder }) => (
            <div key={key}>
              <label className="input-label">{label}</label>
              <div className="relative">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type={type}
                  value={form[key]}
                  onChange={update(key)}
                  className="input-field pl-12"
                  placeholder={placeholder}
                  required={key !== 'businessName'}
                />
              </div>
            </div>
          ))}
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-dark-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
