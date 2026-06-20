const express = require('express');
const Payment = require('../models/Payment');
const Client = require('../models/Client');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const { status, client } = req.query;
    let query = { coach: req.user._id };
    if (status) query.status = status;
    if (client) query.client = client;
    const payments = await Payment.find(query).populate('client', 'fullName email').sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const payment = await Payment.create({ ...req.body, coach: req.user._id });
    if (req.body.status === 'Paid') {
      await Client.findByIdAndUpdate(req.body.client, { paymentStatus: 'Paid' });
    }
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const payment = await Payment.findOneAndUpdate(
      { _id: req.params.id, coach: req.user._id },
      req.body,
      { new: true }
    );
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    if (req.body.status === 'Paid') {
      await Client.findByIdAndUpdate(payment.client, { paymentStatus: 'Paid' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const payment = await Payment.findOneAndDelete({ _id: req.params.id, coach: req.user._id });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ message: 'Payment removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/revenue', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ coach: req.user._id, status: 'Paid' });
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const monthlyRevenue = {};
    payments.forEach(p => {
      const month = new Date(p.paymentDate || p.createdAt).toISOString().slice(0, 7);
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + p.amount;
    });
    res.json({ totalRevenue, monthlyRevenue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
