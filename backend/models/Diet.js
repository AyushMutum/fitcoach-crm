const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  time: { type: String, default: '' },
  foods: [{ type: String }],
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fats: { type: Number, default: 0 },
  notes: { type: String, default: '' },
});

const dietDaySchema = new mongoose.Schema({
  day: { type: String, required: true },
  meals: [mealSchema],
  totalCalories: { type: Number, default: 0 },
});

const dietSchema = new mongoose.Schema({
  coach: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  goal: { type: String, enum: ['Weight Loss', 'Muscle Gain', 'Maintenance', 'Cutting', 'Bulking', 'Custom'], default: 'Custom' },
  dailyCalorieTarget: { type: Number, default: 2000 },
  schedule: [dietDaySchema],
  isTemplate: { type: Boolean, default: false },
  nutritionNotes: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Completed', 'Paused'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Diet', dietSchema);
