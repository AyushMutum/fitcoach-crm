import { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';
import { PlusIcon, TrashIcon, PencilSquareIcon, CakeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const GOALS = ['Weight Loss', 'Muscle Gain', 'Maintenance', 'Cutting', 'Bulking', 'Custom'];
const defaultMeal = { name: '', time: '', foods: [''], calories: 0, protein: 0, carbs: 0, fats: 0, notes: '' };
const defaultForm = {
  name: '', description: '', goal: 'Custom', dailyCalorieTarget: 2000,
  client: '', isTemplate: false, nutritionNotes: '',
  schedule: DAYS.map(day => ({ day, meals: [], totalCalories: 0 })),
};

export default function DietPlans() {
  const [diets, setDiets] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [activeDay, setActiveDay] = useState(0);

  useEffect(() => {
    Promise.all([api.get('/diets'), api.get('/clients')])
      .then(([d, c]) => { setDiets(d.data); setClients(c.data); })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setForm(defaultForm); setEditId(null); setActiveDay(0); setShowModal(true); };

  const openEdit = (diet) => {
    setForm({
      ...diet, client: diet.client?._id || '',
      schedule: DAYS.map(day => {
        const existing = diet.schedule?.find(s => s.day === day);
        return existing || { day, meals: [], totalCalories: 0 };
      }),
    });
    setEditId(diet._id);
    setActiveDay(0);
    setShowModal(true);
  };

  const addMeal = () => {
    const updated = [...form.schedule];
    updated[activeDay].meals.push({ ...defaultMeal, foods: [''] });
    setForm({ ...form, schedule: updated });
  };

  const updateMeal = (mealIdx, field, value) => {
    const updated = [...form.schedule];
    updated[activeDay].meals[mealIdx][field] = value;
    setForm({ ...form, schedule: updated });
  };

  const removeMeal = (mealIdx) => {
    const updated = [...form.schedule];
    updated[activeDay].meals.splice(mealIdx, 1);
    setForm({ ...form, schedule: updated });
  };

  const addFood = (mealIdx) => {
    const updated = [...form.schedule];
    updated[activeDay].meals[mealIdx].foods.push('');
    setForm({ ...form, schedule: updated });
  };

  const updateFood = (mealIdx, foodIdx, value) => {
    const updated = [...form.schedule];
    updated[activeDay].meals[mealIdx].foods[foodIdx] = value;
    setForm({ ...form, schedule: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.client) delete payload.client;
      if (editId) {
        const { data } = await api.put(`/diets/${editId}`, payload);
        setDiets(diets.map(d => d._id === editId ? data : d));
        toast.success('Diet plan updated');
      } else {
        const { data } = await api.post('/diets', payload);
        setDiets([data, ...diets]);
        toast.success('Diet plan created');
      }
      setShowModal(false);
    } catch { toast.error('Failed to save diet plan'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this diet plan?')) return;
    try {
      await api.delete(`/diets/${id}`);
      setDiets(diets.filter(d => d._id !== id));
      toast.success('Diet plan deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const goalColors = {
    'Weight Loss': 'badge-danger', 'Muscle Gain': 'badge-success', 'Maintenance': 'badge-info',
    'Cutting': 'badge-warning', 'Bulking': 'badge-success', 'Custom': 'badge-neutral',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Diet Plans</h1>
          <p className="text-dark-400 text-sm mt-1">{diets.length} plans created</p>
        </div>
        <button onClick={openCreate} className="btn-primary inline-flex items-center gap-2 self-start">
          <PlusIcon className="w-5 h-5" /> Create Plan
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : diets.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <CakeIcon className="w-12 h-12 text-dark-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No diet plans yet</h3>
          <p className="text-dark-400 mb-6">Create your first diet plan</p>
          <button onClick={openCreate} className="btn-primary inline-flex items-center gap-2">
            <PlusIcon className="w-5 h-5" /> Create Plan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {diets.map((diet, i) => (
            <motion.div key={diet._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card-hover p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                    <CakeIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{diet.name}</h3>
                    <p className="text-xs text-dark-400">{diet.client?.fullName || 'Template'}</p>
                  </div>
                </div>
              </div>
              {diet.description && <p className="text-sm text-dark-400 mb-3 line-clamp-2">{diet.description}</p>}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={goalColors[diet.goal]}>{diet.goal}</span>
                <span className="badge-info">{diet.dailyCalorieTarget} cal/day</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-dark-700/50">
                <p className="text-xs text-dark-500">{diet.schedule?.filter(s => s.meals?.length > 0).length || 0} meal days</p>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(diet)} className="p-2 rounded-lg text-dark-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors">
                    <PencilSquareIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(diet._id)} className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Diet Plan' : 'Create Diet Plan'} size="xl">
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
              <label className="input-label">Goal</label>
              <select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} className="input-field">
                {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Daily Calorie Target</label>
              <input type="number" value={form.dailyCalorieTarget} onChange={(e) => setForm({ ...form, dailyCalorieTarget: Number(e.target.value) })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="input-field" />
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Weekly Meal Plan</h4>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {DAYS.map((day, idx) => (
                <button key={day} type="button" onClick={() => setActiveDay(idx)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    activeDay === idx ? 'bg-accent-600 text-white shadow-lg shadow-accent-500/25' : 'bg-dark-800/50 text-dark-400 hover:text-dark-200'
                  }`}>
                  {day.slice(0, 3)}
                  {form.schedule[idx]?.meals?.length > 0 && <span className="ml-1.5 w-2 h-2 inline-block rounded-full bg-white" />}
                </button>
              ))}
            </div>

            <div className="bg-dark-800/30 rounded-xl p-4 space-y-4">
              {form.schedule[activeDay]?.meals?.map((meal, mealIdx) => (
                <div key={mealIdx} className="p-4 bg-dark-900/50 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-semibold text-white">Meal {mealIdx + 1}</h5>
                    <button type="button" onClick={() => removeMeal(mealIdx)} className="text-red-400 hover:text-red-300">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <input value={meal.name} onChange={(e) => updateMeal(mealIdx, 'name', e.target.value)} className="input-field text-sm" placeholder="Meal name" />
                    <input value={meal.time} onChange={(e) => updateMeal(mealIdx, 'time', e.target.value)} className="input-field text-sm" placeholder="Time (e.g., 8:00 AM)" />
                    <input type="number" value={meal.calories} onChange={(e) => updateMeal(mealIdx, 'calories', Number(e.target.value))} className="input-field text-sm" placeholder="Calories" />
                    <input type="number" value={meal.protein} onChange={(e) => updateMeal(mealIdx, 'protein', Number(e.target.value))} className="input-field text-sm" placeholder="Protein (g)" />
                    <input type="number" value={meal.carbs} onChange={(e) => updateMeal(mealIdx, 'carbs', Number(e.target.value))} className="input-field text-sm" placeholder="Carbs (g)" />
                    <input type="number" value={meal.fats} onChange={(e) => updateMeal(mealIdx, 'fats', Number(e.target.value))} className="input-field text-sm" placeholder="Fats (g)" />
                  </div>
                  <div>
                    <p className="text-xs text-dark-500 mb-1">Foods</p>
                    {meal.foods.map((food, foodIdx) => (
                      <input key={foodIdx} value={food} onChange={(e) => updateFood(mealIdx, foodIdx, e.target.value)}
                        className="input-field text-sm mb-1" placeholder={`Food item ${foodIdx + 1}`} />
                    ))}
                    <button type="button" onClick={() => addFood(mealIdx)} className="text-xs text-primary-400 hover:text-primary-300 mt-1">+ Add food item</button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addMeal} className="btn-secondary text-sm w-full flex items-center justify-center gap-2">
                <PlusIcon className="w-4 h-4" /> Add Meal
              </button>
            </div>
          </div>

          <div>
            <label className="input-label">Nutrition Notes</label>
            <textarea value={form.nutritionNotes} onChange={(e) => setForm({ ...form, nutritionNotes: e.target.value })} rows={2} className="input-field" />
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
