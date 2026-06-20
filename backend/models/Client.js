const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  coach: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  profilePhoto: { type: String, default: '' },
  age: { type: Number },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
  height: { type: Number },
  weight: { type: Number },
  address: { type: String, default: '' },
  joinDate: { type: Date, default: Date.now },
  fitnessGoal: { type: String, default: '' },
  medicalConditions: { type: String, default: '' },
  subscriptionPlan: { type: String, enum: ['Basic', 'Standard', 'Premium', 'Elite'], default: 'Basic' },
  subscriptionStartDate: { type: Date },
  subscriptionEndDate: { type: Date },
  paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending' },
  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relation: { type: String, default: '' },
  },
  coachNotes: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
