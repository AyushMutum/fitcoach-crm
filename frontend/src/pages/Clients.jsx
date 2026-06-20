import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [view, setView] = useState('grid');

  const fetchClients = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (planFilter) params.plan = planFilter;
      const { data } = await api.get('/clients', { params });
      setClients(data);
    } catch (error) {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(fetchClients, 300);
    return () => clearTimeout(debounce);
  }, [search, statusFilter, planFilter]);

  const handleDelete = async () => {
    try {
      await api.delete(`/clients/${deleteModal}`);
      setClients(clients.filter(c => c._id !== deleteModal));
      toast.success('Client removed');
      setDeleteModal(null);
    } catch (error) {
      toast.error('Failed to delete client');
    }
  };

  const planBadge = (plan) => {
    const styles = {
      Basic: 'badge-neutral',
      Standard: 'badge-info',
      Premium: 'badge-warning',
      Elite: 'badge-success',
    };
    return styles[plan] || 'badge-neutral';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-dark-400 text-sm mt-1">{clients.length} total clients</p>
        </div>
        <Link to="/clients/add" className="btn-primary inline-flex items-center gap-2 self-start">
          <PlusIcon className="w-5 h-5" /> Add Client
        </Link>
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients by name or email..."
              className="input-field pl-12"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field w-auto"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="input-field w-auto"
            >
              <option value="">All Plans</option>
              <option value="Basic">Basic</option>
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
              <option value="Elite">Elite</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : clients.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center mx-auto mb-4">
            <FunnelIcon className="w-8 h-8 text-dark-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No clients found</h3>
          <p className="text-dark-400 mb-6">Get started by adding your first client</p>
          <Link to="/clients/add" className="btn-primary inline-flex items-center gap-2">
            <PlusIcon className="w-5 h-5" /> Add Client
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map((client, i) => (
            <motion.div
              key={client._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card-hover p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg">
                    {client.fullName?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{client.fullName}</h3>
                    <p className="text-xs text-dark-400">{client.fitnessGoal || 'No goal set'}</p>
                  </div>
                </div>
                <span className={client.status === 'Active' ? 'badge-success' : 'badge-neutral'}>
                  {client.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-dark-300">
                  <EnvelopeIcon className="w-4 h-4 text-dark-500" />
                  <span className="truncate">{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm text-dark-300">
                    <PhoneIcon className="w-4 h-4 text-dark-500" />
                    {client.phone}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-dark-700/50">
                <div className="flex items-center gap-2">
                  <span className={planBadge(client.subscriptionPlan)}>{client.subscriptionPlan}</span>
                  <span className={
                    client.paymentStatus === 'Paid' ? 'badge-success' :
                    client.paymentStatus === 'Overdue' ? 'badge-danger' : 'badge-warning'
                  }>
                    {client.paymentStatus}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    to={`/clients/${client._id}`}
                    className="p-2 rounded-lg text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/clients/${client._id}/edit`}
                    className="p-2 rounded-lg text-dark-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setDeleteModal(client._id)}
                    className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Client" size="sm">
        <p className="text-dark-300 mb-6">Are you sure you want to delete this client? This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteModal(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} className="btn-danger">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
