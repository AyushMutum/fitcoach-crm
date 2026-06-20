import { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';
import {
  PlusIcon,
  ChartBarIcon,
  ScaleIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';

const defaultEntry = {
  client: '', weight: '', bodyFat: '', notes: '',
  measurements: { chest: '', waist: '', hips: '', biceps: '', thighs: '', calves: '' },
};

export default function ProgressTracking() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(defaultEntry);

  useEffect(() => {
    api.get('/clients').then(({ data }) => setClients(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedClient) {
      setLoading(true);
      api.get(`/progress/client/${selectedClient}`)
        .then(({ data }) => setProgress(data))
        .catch(() => toast.error('Failed to load progress'))
        .finally(() => setLoading(false));
    }
  }, [selectedClient]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        weight: form.weight ? Number(form.weight) : undefined,
        bodyFat: form.bodyFat ? Number(form.bodyFat) : undefined,
        measurements: Object.fromEntries(
          Object.entries(form.measurements).map(([k, v]) => [k, v ? Number(v) : undefined])
        ),
      };
      const { data } = await api.post('/progress', payload);
      setProgress([data, ...progress]);
      setShowModal(false);
      setForm(defaultEntry);
      toast.success('Progress entry added');
    } catch (error) {
      toast.error('Failed to add progress entry');
    }
  };

  const updateMeasurement = (field) => (e) => {
    setForm({ ...form, measurements: { ...form.measurements, [field]: e.target.value } });
  };

  const chartData = progress
    .slice()
    .reverse()
    .map(p => ({
      date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: p.weight,
      bodyFat: p.bodyFat,
      bmi: p.bmi,
    }))
    .filter(p => p.weight);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Progress Tracking</h1>
          <p className="text-dark-400 text-sm mt-1">Track client fitness progress over time</p>
        </div>
        <button
          onClick={() => {
            setForm({ ...defaultEntry, client: selectedClient });
            setShowModal(true);
          }}
          disabled={!selectedClient}
          className="btn-primary inline-flex items-center gap-2 self-start disabled:opacity-50"
        >
          <PlusIcon className="w-5 h-5" /> Log Progress
        </button>
      </div>

      <div className="glass-card p-4">
        <label className="input-label">Select Client</label>
        <select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="input-field"
        >
          <option value="">Choose a client...</option>
          {clients.map(c => (
            <option key={c._id} value={c._id}>{c.fullName}</option>
          ))}
        </select>
      </div>

      {selectedClient && !loading && chartData.length > 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ScaleIcon className="w-5 h-5 text-primary-400" /> Weight Trend
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }} />
                <Line type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-accent-400" /> BMI Trend
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }} />
                <Line type="monotone" dataKey="bmi" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {selectedClient && !loading && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary-400" /> Progress Timeline
          </h3>
          {progress.length === 0 ? (
            <p className="text-dark-400 text-center py-8">No progress entries yet. Start by logging the first entry.</p>
          ) : (
            <div className="space-y-4">
              {progress.map((entry, i) => (
                <motion.div
                  key={entry._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-4 p-4 rounded-xl bg-dark-800/30 hover:bg-dark-800/50 transition-colors"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-primary-500" />
                    {i < progress.length - 1 && <div className="w-0.5 flex-1 bg-dark-700 mt-2" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-dark-400 mb-1">{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <div className="flex flex-wrap gap-4">
                      {entry.weight && <span className="text-sm text-dark-200"><span className="text-dark-500">Weight:</span> {entry.weight} kg</span>}
                      {entry.bmi && <span className="text-sm text-dark-200"><span className="text-dark-500">BMI:</span> {entry.bmi}</span>}
                      {entry.bodyFat && <span className="text-sm text-dark-200"><span className="text-dark-500">Body Fat:</span> {entry.bodyFat}%</span>}
                    </div>
                    {entry.measurements && Object.values(entry.measurements).some(v => v) && (
                      <div className="flex flex-wrap gap-3 mt-2">
                        {Object.entries(entry.measurements).map(([k, v]) => v ? (
                          <span key={k} className="text-xs text-dark-400 bg-dark-800/50 px-2 py-1 rounded-lg">
                            {k}: {v} cm
                          </span>
                        ) : null)}
                      </div>
                    )}
                    {entry.notes && <p className="text-sm text-dark-300 mt-2">{entry.notes}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Log Progress" size="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="input-label">Weight (kg)</label>
              <input type="number" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="input-label">Body Fat (%)</label>
              <input type="number" step="0.1" value={form.bodyFat} onChange={(e) => setForm({ ...form, bodyFat: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Body Measurements (cm)</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.keys(form.measurements).map(key => (
                <div key={key}>
                  <label className="input-label capitalize">{key}</label>
                  <input type="number" step="0.1" value={form.measurements[key]} onChange={updateMeasurement(key)} className="input-field" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="input-label">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="input-field" placeholder="Progress notes..." />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Entry</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
