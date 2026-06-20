import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon, PencilSquareIcon, EnvelopeIcon, PhoneIcon,
  MapPinIcon, CalendarIcon, HeartIcon, ScaleIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';

export default function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [clientRes, progressRes] = await Promise.all([
          api.get(`/clients/${id}`),
          api.get(`/progress/client/${id}`),
        ]);
        setClient(clientRes.data);
        setProgress(progressRes.data);
      } catch {
        toast.error('Failed to load client details');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!client) return <p className="text-dark-400 text-center py-20">Client not found</p>;

  const bmi = client.weight && client.height
    ? (client.weight / ((client.height / 100) ** 2)).toFixed(1)
    : null;

  const weightData = progress
    .slice()
    .reverse()
    .map(p => ({ date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), weight: p.weight }))
    .filter(p => p.weight);

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-dark-800/30">
      <Icon className="w-5 h-5 text-dark-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-dark-500">{label}</p>
        <p className="text-sm text-dark-200 font-medium">{value || '—'}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-dark-800/50 text-dark-400 hover:text-white transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-white">Client Details</h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary-500/25">
              {client.fullName?.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{client.fullName}</h2>
              <p className="text-dark-400 text-sm">{client.fitnessGoal || 'No goal set'}</p>
              <div className="flex gap-2 mt-1">
                <span className={client.status === 'Active' ? 'badge-success' : 'badge-neutral'}>{client.status}</span>
                <span className="badge-info">{client.subscriptionPlan}</span>
              </div>
            </div>
          </div>
          <Link to={`/clients/${id}/edit`} className="btn-secondary inline-flex items-center gap-2 self-start">
            <PencilSquareIcon className="w-4 h-4" /> Edit
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <InfoItem icon={EnvelopeIcon} label="Email" value={client.email} />
          <InfoItem icon={PhoneIcon} label="Phone" value={client.phone} />
          <InfoItem icon={MapPinIcon} label="Address" value={client.address} />
          <InfoItem icon={CalendarIcon} label="Join Date" value={client.joinDate ? new Date(client.joinDate).toLocaleDateString() : null} />
          <InfoItem icon={ScaleIcon} label="Height / Weight" value={`${client.height || '—'} cm / ${client.weight || '—'} kg`} />
          <InfoItem icon={HeartIcon} label="Medical Conditions" value={client.medicalConditions} />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Age', value: client.age ? `${client.age} yrs` : '—' },
          { label: 'Gender', value: client.gender },
          { label: 'BMI', value: bmi || '—' },
          { label: 'Payment', value: client.paymentStatus, badge: true },
        ].map(({ label, value, badge }) => (
          <div key={label} className="glass-card p-4 text-center">
            <p className="text-xs text-dark-500 mb-1">{label}</p>
            {badge ? (
              <span className={
                value === 'Paid' ? 'badge-success' : value === 'Overdue' ? 'badge-danger' : 'badge-warning'
              }>{value}</span>
            ) : (
              <p className="text-lg font-bold text-white">{value}</p>
            )}
          </div>
        ))}
      </div>

      {weightData.length > 1 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Weight Progress</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }} />
              <Line type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {client.emergencyContact?.name && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Emergency Contact</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-dark-800/30">
              <p className="text-xs text-dark-500">Name</p>
              <p className="text-sm text-dark-200 font-medium">{client.emergencyContact.name}</p>
            </div>
            <div className="p-3 rounded-xl bg-dark-800/30">
              <p className="text-xs text-dark-500">Phone</p>
              <p className="text-sm text-dark-200 font-medium">{client.emergencyContact.phone}</p>
            </div>
            <div className="p-3 rounded-xl bg-dark-800/30">
              <p className="text-xs text-dark-500">Relation</p>
              <p className="text-sm text-dark-200 font-medium">{client.emergencyContact.relation}</p>
            </div>
          </div>
        </div>
      )}

      {client.coachNotes && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-3">Coach Notes</h3>
          <p className="text-dark-300 text-sm whitespace-pre-wrap">{client.coachNotes}</p>
        </div>
      )}
    </div>
  );
}
