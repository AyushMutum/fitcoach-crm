import { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';
import {
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  ClipboardDocumentListIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const CATEGORIES = ['Strength', 'Cardio', 'HIIT', 'Flexibility', 'CrossFit', 'Custom'];

const defaultForm = {
  name: '', description: '', category: 'Custom', difficulty: 'Intermediate',
  client: '', isTemplate: false,
  schedule: DAYS.map(day => ({ day, focus: '', exercises: [] })),
};

const defaultExercise = { name: '', sets: 3, reps: 10, weight: '', duration: '', restPeriod: '60s', notes: '' };

export default function WorkoutPlans() {
  const [workouts, setWorkouts] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [activeDay, setActiveDay] = useState(0);

  useEffect(() => {
    Promise.all([
      api.get('/workouts'),
      api.get('/clients'),
    ]).then(([w, c]) => {
      setWorkouts(w.data);
      setClients(c.data);
    }).catch(() => toast.error('Failed to load data')).finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setForm(defaultForm);
    setEditId(null);
    setActiveDay(0);
    setShowModal(true);
  };

  const openEdit = (workout) => {
    setForm({
      ...workout,
      client: workout.client?._id || '',
      schedule: DAYS.map(day => {
        const existing = workout.schedule?.find(s => s.day === day);
        return existing || { day, focus: '', exercises: [] };
      }),
    });
    setEditId(workout._id);
    setActiveDay(0);
    setShowModal(true);
  };

  const addExercise = () => {
    const updated = [...form.schedule];
    updated[activeDay].exercises.push({ ...defaultExercise });
    setForm({ ...form, schedule: updated });
  };

  const updateExercise = (exIdx, field, value) => {
    const updated = [...form.schedule];
    updated[activeDay].exercises[exIdx][field] = value;
    setForm({ ...form, schedule: updated });
  };

  const removeExercise = (exIdx) => {
    const updated = [...form.schedule];
    updated[activeDay].exercises.splice(exIdx, 1);
    setForm({ ...form, schedule: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.client) delete payload.client;
      if (editId) {
        const { data } = await api.put(`/workouts/${editId}`, payload);
        setWorkouts(workouts.map(w => w._id === editId ? data : w));
        toast.success('Workout updated');
      } else {
        const { data } = await api.post('/workouts', payload);
        setWorkouts([data, ...workouts]);
        toast.success('Workout created');
      }
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to save workout');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this workout plan?')) return;
    try {
      await api.delete(`/workouts/${id}`);
      setWorkouts(workouts.filter(w => w._id !== id));
      toast.success('Workout deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const categoryColors = {
    Strength: 'badge-danger', Cardio: 'badge-success', HIIT: 'badge-warning',
    Flexibility: 'badge-info', CrossFit: 'badge-neutral', Custom: 'badge-neutral',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Workout Plans</h1>
          <p className="text-dark-400 text-sm mt-1">{workouts.length} plans created</p>
        </div>
        <button onClick={openCreate} className="btn-primary inline-flex items-center gap-2 self-start">
          <PlusIcon className="w-5 h-5" /> Create Plan
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : workouts.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <ClipboardDocumentListIcon className="w-12 h-12 text-dark-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No workout plans yet</h3>
          <p className="text-dark-400 mb-6">Create your first workout plan to assign to clients</p>
          <button onClick={openCreate} className="btn-primary inline-flex items-center gap-2">
            <PlusIcon className="w-5 h-5" /> Create Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {workouts.map((workout, i) => (
            <motion.div
              key={workout._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card-hover p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <FireIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{workout.name}</h3>
                    <p className="text-xs text-dark-400">{workout.client?.fullName || 'Template'}</p>
                  </div>
                </div>
              </div>
              {workout.description && <p className="text-sm text-dark-400 mb-3 line-clamp-2">{workout.description}</p>}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={categoryColors[workout.category]}>{workout.category}</span>
                <span className="badge-info">{workout.difficulty}</span>
                <span className={workout.status === 'Active' ? 'badge-success' : 'badge-neutral'}>{workout.status}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-dark-700/50">
                <p className="text-xs text-dark-500">{workout.schedule?.filter(s => s.exercises?.length > 0).length || 0} active days</p>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(workout)} className="p-2 rounded-lg text-dark-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors">
                    <PencilSquareIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(workout._id)} className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Workout Plan' : 'Create Workout Plan'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">Plan Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="input-label">Assign to Client</label>
              <select value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} className="input-field">
                <option value="">None (Template)</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.fullName}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Difficulty</label>
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="input-field">
                {['Beginner', 'Intermediate', 'Advanced'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="input-field" />
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Weekly Schedule</h4>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {DAYS.map((day, idx) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setActiveDay(idx)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    activeDay === idx
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                      : 'bg-dark-800/50 text-dark-400 hover:text-dark-200'
                  }`}
                >
                  {day.slice(0, 3)}
                  {form.schedule[idx]?.exercises?.length > 0 && (
                    <span className="ml-1.5 w-2 h-2 inline-block rounded-full bg-accent-400" />
                  )}
                </button>
              ))}
            </div>

            <div className="bg-dark-800/30 rounded-xl p-4">
              <div className="mb-4">
                <label className="input-label">Focus Area</label>
                <input
                  value={form.schedule[activeDay]?.focus || ''}
                  onChange={(e) => {
                    const updated = [...form.schedule];
                    updated[activeDay].focus = e.target.value;
                    setForm({ ...form, schedule: updated });
                  }}
                  className="input-field"
                  placeholder="e.g., Chest & Triceps"
                />
              </div>

              {form.schedule[activeDay]?.exercises?.map((ex, exIdx) => (
                <div key={exIdx} className="grid grid-cols-2 md:grid-cols-7 gap-2 mb-3 p-3 bg-dark-900/50 rounded-xl">
                  <div className="col-span-2">
                    <input value={ex.name} onChange={(e) => updateExercise(exIdx, 'name', e.target.value)} className="input-field text-sm" placeholder="Exercise name" />
                  </div>
                  <input type="number" value={ex.sets} onChange={(e) => updateExercise(exIdx, 'sets', e.target.value)} className="input-field text-sm" placeholder="Sets" />
                  <input type="number" value={ex.reps} onChange={(e) => updateExercise(exIdx, 'reps', e.target.value)} className="input-field text-sm" placeholder="Reps" />
                  <input value={ex.weight} onChange={(e) => updateExercise(exIdx, 'weight', e.target.value)} className="input-field text-sm" placeholder="Weight" />
                  <input value={ex.restPeriod} onChange={(e) => updateExercise(exIdx, 'restPeriod', e.target.value)} className="input-field text-sm" placeholder="Rest" />
                  <button type="button" onClick={() => removeExercise(exIdx)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center justify-center">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button type="button" onClick={addExercise} className="btn-secondary text-sm w-full mt-2 flex items-center justify-center gap-2">
                <PlusIcon className="w-4 h-4" /> Add Exercise
              </button>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editId ? 'Update' : 'Create'} Plan</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
