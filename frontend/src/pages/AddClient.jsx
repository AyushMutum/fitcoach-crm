import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const defaultForm = {
  fullName: '', email: '', phone: '', age: '', gender: 'Male',
  height: '', weight: '', address: '', fitnessGoal: '', medicalConditions: '',
  subscriptionPlan: 'Basic', subscriptionStartDate: '', subscriptionEndDate: '',
  paymentStatus: 'Pending', emergencyContact: { name: '', phone: '', relation: '' },
  coachNotes: '', status: 'Active',
};

export default function AddClient() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.get(`/clients/${id}`).then(({ data }) => {
        setForm({
          ...data,
          subscriptionStartDate: data.subscriptionStartDate?.slice(0, 10) || '',
          subscriptionEndDate: data.subscriptionEndDate?.slice(0, 10) || '',
          emergencyContact: data.emergencyContact || { name: '', phone: '', relation: '' },
        });
      }).catch(() => toast.error('Failed to load client'));
    }
  }, [id, isEdit]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const updateEmergency = (field) => (e) => setForm({
    ...form, emergencyContact: { ...form.emergencyContact, [field]: e.target.value },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        age: form.age ? Number(form.age) : undefined,
        height: form.height ? Number(form.height) : undefined,
        weight: form.weight ? Number(form.weight) : undefined,
      };
      if (isEdit) {
        await api.put(`/clients/${id}`, payload);
        toast.success('Client updated');
      } else {
        await api.post('/clients', payload);
        toast.success('Client added');
      }
      navigate('/clients');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save client');
    } finally {
      setLoading(false);
    }
  };

  const Section = ({ title, children }) => (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-dark-800/50 text-dark-400 hover:text-white transition-colors">
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{isEdit ? 'Edit Client' : 'Add New Client'}</h1>
          <p className="text-sm text-dark-400 mt-1">{isEdit ? 'Update client information' : 'Fill in the client details below'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="Personal Information">
          <div>
            <label className="input-label">Full Name *</label>
            <input value={form.fullName} onChange={update('fullName')} className="input-field" required />
          </div>
          <div>
            <label className="input-label">Email *</label>
            <input type="email" value={form.email} onChange={update('email')} className="input-field" required />
          </div>
          <div>
            <label className="input-label">Phone</label>
            <input value={form.phone} onChange={update('phone')} className="input-field" />
          </div>
          <div>
            <label className="input-label">Age</label>
            <input type="number" value={form.age} onChange={update('age')} className="input-field" />
          </div>
          <div>
            <label className="input-label">Gender</label>
            <select value={form.gender} onChange={update('gender')} className="input-field">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="input-label">Address</label>
            <input value={form.address} onChange={update('address')} className="input-field" />
          </div>
        </Section>

        <Section title="Fitness Details">
          <div>
            <label className="input-label">Height (cm)</label>
            <input type="number" value={form.height} onChange={update('height')} className="input-field" />
          </div>
          <div>
            <label className="input-label">Weight (kg)</label>
            <input type="number" value={form.weight} onChange={update('weight')} className="input-field" />
          </div>
          <div>
            <label className="input-label">Fitness Goal</label>
            <input value={form.fitnessGoal} onChange={update('fitnessGoal')} className="input-field" placeholder="e.g., Weight Loss, Muscle Gain" />
          </div>
          <div>
            <label className="input-label">Medical Conditions</label>
            <input value={form.medicalConditions} onChange={update('medicalConditions')} className="input-field" placeholder="Any known conditions" />
          </div>
        </Section>

        <Section title="Subscription Details">
          <div>
            <label className="input-label">Subscription Plan</label>
            <select value={form.subscriptionPlan} onChange={update('subscriptionPlan')} className="input-field">
              <option value="Basic">Basic - $49/mo</option>
              <option value="Standard">Standard - $99/mo</option>
              <option value="Premium">Premium - $149/mo</option>
              <option value="Elite">Elite - $249/mo</option>
            </select>
          </div>
          <div>
            <label className="input-label">Payment Status</label>
            <select value={form.paymentStatus} onChange={update('paymentStatus')} className="input-field">
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
          <div>
            <label className="input-label">Start Date</label>
            <input type="date" value={form.subscriptionStartDate} onChange={update('subscriptionStartDate')} className="input-field" />
          </div>
          <div>
            <label className="input-label">End Date</label>
            <input type="date" value={form.subscriptionEndDate} onChange={update('subscriptionEndDate')} className="input-field" />
          </div>
          <div>
            <label className="input-label">Status</label>
            <select value={form.status} onChange={update('status')} className="input-field">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </Section>

        <Section title="Emergency Contact">
          <div>
            <label className="input-label">Contact Name</label>
            <input value={form.emergencyContact.name} onChange={updateEmergency('name')} className="input-field" />
          </div>
          <div>
            <label className="input-label">Contact Phone</label>
            <input value={form.emergencyContact.phone} onChange={updateEmergency('phone')} className="input-field" />
          </div>
          <div>
            <label className="input-label">Relation</label>
            <input value={form.emergencyContact.relation} onChange={updateEmergency('relation')} className="input-field" />
          </div>
        </Section>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Coach Notes</h3>
          <textarea
            value={form.coachNotes}
            onChange={update('coachNotes')}
            rows={4}
            className="input-field"
            placeholder="Add any notes about this client..."
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            {isEdit ? 'Update Client' : 'Add Client'}
          </button>
        </div>
      </form>
    </div>
  );
}
