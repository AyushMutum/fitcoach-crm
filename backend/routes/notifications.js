const express = require('express');
const Notification = require('../models/Notification');
const Client = require('../models/Client');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ coach: req.user._id })
      .populate('client', 'fullName')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, coach: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ coach: req.user._id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/generate', protect, async (req, res) => {
  try {
    const coachId = req.user._id;
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const expiringClients = await Client.find({
      coach: coachId,
      subscriptionEndDate: { $gte: now, $lte: sevenDaysFromNow },
      status: 'Active',
    });

    const overdueClients = await Client.find({
      coach: coachId,
      paymentStatus: 'Overdue',
      status: 'Active',
    });

    const notifications = [];
    for (const client of expiringClients) {
      notifications.push({
        coach: coachId,
        client: client._id,
        type: 'subscription_expiry',
        title: 'Subscription Expiring Soon',
        message: `${client.fullName}'s subscription expires on ${new Date(client.subscriptionEndDate).toLocaleDateString()}`,
        priority: 'high',
      });
    }
    for (const client of overdueClients) {
      notifications.push({
        coach: coachId,
        client: client._id,
        type: 'payment_due',
        title: 'Payment Overdue',
        message: `${client.fullName} has an overdue payment`,
        priority: 'high',
      });
    }

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.json({ message: `Generated ${notifications.length} notifications` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
