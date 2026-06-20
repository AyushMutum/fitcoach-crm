import { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';
import StatsCard from '../components/StatsCard';
import {
  PlusIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';

const PLANS = { Basic: 49, Standard: 99, Premium: 149, Elite: 249 };

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({
    client: '', amount: '', plan: 'Basic', status: 'Pending',
    dueDate: '', paymentDate: '', paymentMethod: 'Cash', notes: '',
  });

  useEffect(() => {
    Promise.all([api.get('/payments'), api.get('/clients')])
      .then(([p, c]) => { setPayments(p.data); setClients(c.data); })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter ? payments.filter(p => p.status === filter) : payments;

  const totalRevenue = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
  const pendingAmount = payments.filter(p => p.status === 'Pending').reduce((s, p) => s + p.amount, 0);
  const overdueAmount = payments.filter(p => p.status === 'Overdue').reduce((s, p) => s + p.amount, 0);

  const monthlyData = {};
  payments.filter(p => p.status === 'Paid').forEach(p => {
    const month = new Date(p.paymentDate || p.createdAt).toLocaleDateString('en-US', { month: 'short' });
    monthlyData[month] = (monthlyData[month] || 0) + p.amount;
  });
  const chartData = Object.entries(monthlyData).map(([month, revenue]) => ({ month, revenue }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/payments', { ...form, amount: Number(form.amount) });
      setPayments([data, ...payments]);
      setShowModal(false);
      setForm({ client: '', amount: '', plan: 'Basic', status: 'Pending', dueDate: '', paymentDate: '', paymentMethod: 'Cash', notes: '' });
      toast.success('Payment recorded');
    } catch { toast.error('Failed to record payment'); }
  };

  const markPaid = async (id) => {
    try {
      const { data } = await api.put(`/payments/${id}`, { status: 'Paid', paymentDate: new Date().toISOString() });
      setPayments(payments.map(p => p._id === id ? data : p));
      toast.success('Payment marked as paid');
    } catch { toast.error('Failed to update payment'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Payments</h1>
          <p className="text-dark-400 text-sm mt-1">Track and manage client payments</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary inline-flex items-center gap-2 self-start">
          <PlusIcon className="w-5 h-5" /> Record Payment
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={CurrencyDollarIcon} color="accent" />
        <StatsCard title="Pending" value={`$${pendingAmount.toLocaleString()}`} icon={ClockIcon} color="amber" />
        <StatsCard title="Overdue" value={`$${overdueAmount.toLocaleString()}`} icon={ExclamationTriangleIcon} color="red" />
      </div>

      {chartData.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue by Month</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }} />
              <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-dark-700/50 flex flex-wrap gap-2">
          {['', 'Paid', 'Pending', 'Overdue'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === s ? 'bg-primary-600 text-white' : 'bg-dark-800/50 text-dark-400 hover:text-dark-200'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-dark-500 uppercase tracking-wider">
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((payment) => (
                <tr key={payment._id} className="table-row">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-white">{payment.client?.fullName || '—'}</p>
                    <p className="text-xs text-dark-500">{payment.client?.email}</p>
                  </td>
                  <td className="px-6 py-4"><span className="badge-info">{payment.plan}</span></td>
                  <td className="px-6 py-4 text-sm font-semibold text-white">${payment.amount}</td>
                  <td className="px-6 py-4">
                    <span className={payment.status === 'Paid' ? 'badge-success' : payment.status === 'Overdue' ? 'badge-danger' : 'badge-warning'}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-300">{payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-4 text-sm text-dark-300">{payment.paymentMethod}</td>
                  <td className="px-6 py-4">
                    {payment.status !== 'Paid' && (
                      <button onClick={() => markPaid(payment._id)} className="text-accent-400 hover:text-accent-300 transition-colors">
                        <CheckCircleIcon className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-dark-400 py-8">No payments found</p>}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Payment">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Client *</label>
              <select value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} className="input-field" required>
                <option value="">Select client</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.fullName}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Plan</label>
              <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value, amount: PLANS[e.target.value] })} className="input-field">
                {Object.entries(PLANS).map(([plan, price]) => (
                  <option key={plan} value={plan}>{plan} - ${price}/mo</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Amount ($) *</label>
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="input-label">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
                {['Paid', 'Pending', 'Overdue'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Due Date *</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="input-label">Payment Method</label>
              <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="input-field">
                {['Cash', 'Card', 'Bank Transfer', 'UPI', 'Other'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="input-label">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="input-field" />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Record Payment</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
