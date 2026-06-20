const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, default: 3 },
  reps: { type: Number, default: 10 },
  weight: { type: String, default: '' },
  duration: { type: String, default: '' },
  restPeriod: { type: String, default: '60s' },
  notes: { type: String, default: '' },
});

const workoutDaySchema = new mongoose.Schema({
  day: { type: String, required: true },
  focus: { type: String, default: '' },
  exercises: [exerciseSchema],
});

const workoutSchema = new mongoose.Schema({
  coach: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, enum: ['Strength', 'Cardio', 'HIIT', 'Flexibility', 'CrossFit', 'Custom'], default: 'Custom' },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  schedule: [workoutDaySchema],
  isTemplate: { type: Boolean, default: false },
  status: { type: String, enum: ['Active', 'Completed', 'Paused'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Workout', workoutSchema);
