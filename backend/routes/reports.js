const express = require('express');
const Client = require('../models/Client');
const Progress = require('../models/Progress');
const Payment = require('../models/Payment');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/client/:clientId', protect, async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.clientId, coach: req.user._id });
    if (!client) return res.status(404).json({ message: 'Client not found' });

    const progress = await Progress.find({ client: req.params.clientId }).sort({ date: 1 });
    const payments = await Payment.find({ client: req.params.clientId }).sort({ createdAt: -1 });

    res.json({
      client,
      progress,
      payments,
      summary: {
        totalPayments: payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0),
        progressEntries: progress.length,
        startWeight: progress[0]?.weight || client.weight,
        currentWeight: progress[progress.length - 1]?.weight || client.weight,
        weightChange: progress.length >= 2
          ? (progress[progress.length - 1].weight - progress[0].weight).toFixed(1)
          : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/revenue', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ coach: req.user._id, status: 'Paid' })
      .populate('client', 'fullName');

    const monthlyData = {};
    payments.forEach(p => {
      const month = new Date(p.paymentDate || p.createdAt).toISOString().slice(0, 7);
      if (!monthlyData[month]) monthlyData[month] = { revenue: 0, count: 0 };
      monthlyData[month].revenue += p.amount;
      monthlyData[month].count += 1;
    });

    const planBreakdown = {};
    payments.forEach(p => {
      planBreakdown[p.plan] = (planBreakdown[p.plan] || 0) + p.amount;
    });

    res.json({
      totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
      monthlyData,
      planBreakdown,
      totalTransactions: payments.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
