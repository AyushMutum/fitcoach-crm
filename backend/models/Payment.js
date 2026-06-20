const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  coach: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  plan: { type: String, enum: ['Basic', 'Standard', 'Premium', 'Elite'], required: true },
  status: { type: String, enum: ['Paid', 'Pending', 'Overdue', 'Refunded'], default: 'Pending' },
  paymentDate: { type: Date },
  dueDate: { type: Date, required: true },
  paymentMethod: { type: String, enum: ['Cash', 'Card', 'Bank Transfer', 'UPI', 'Other'], default: 'Cash' },
  notes: { type: String, default: '' },
  invoiceNumber: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
