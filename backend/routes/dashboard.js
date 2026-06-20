const express = require('express');
const Client = require('../models/Client');
const Payment = require('../models/Payment');
const Progress = require('../models/Progress');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/stats', protect, async (req, res) => {
  try {
    const coachId = req.user._id;
    const totalClients = await Client.countDocuments({ coach: coachId });
    const activeClients = await Client.countDocuments({ coach: coachId, status: 'Active' });
    const inactiveClients = await Client.countDocuments({ coach: coachId, status: 'Inactive' });

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringSubscriptions = await Client.countDocuments({
      coach: coachId,
      subscriptionEndDate: { $gte: now, $lte: thirtyDaysFromNow },
    });

    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const monthlyPayments = await Payment.find({
      coach: coachId,
      status: 'Paid',
      $or: [
        { paymentDate: { $gte: currentMonth, $lt: nextMonth } },
        { createdAt: { $gte: currentMonth, $lt: nextMonth } },
      ],
    });
    const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);

    const recentClients = await Client.find({ coach: coachId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName status joinDate subscriptionPlan fitnessGoal');

    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = await Client.countDocuments({
        coach: coachId,
        joinDate: { $gte: d, $lt: end },
      });
      const revenue = await Payment.aggregate([
        {
          $match: {
            coach: coachId,
            status: 'Paid',
            createdAt: { $gte: d, $lt: end },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      last6Months.push({
        month: d.toLocaleString('default', { month: 'short' }),
        clients: count,
        revenue: revenue[0]?.total || 0,
      });
    }

    res.json({
      totalClients,
      activeClients,
      inactiveClients,
      expiringSubscriptions,
      monthlyRevenue,
      recentClients,
      chartData: last6Months,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
