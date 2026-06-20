const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  coach: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  weight: { type: Number },
  bodyFat: { type: Number },
  measurements: {
    chest: Number,
    waist: Number,
    hips: Number,
    biceps: Number,
    thighs: Number,
    calves: Number,
  },
  bmi: { type: Number },
  notes: { type: String, default: '' },
  beforePhoto: { type: String, default: '' },
  afterPhoto: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Progress', progressSchema);
