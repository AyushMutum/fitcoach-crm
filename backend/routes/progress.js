const express = require('express');
const Progress = require('../models/Progress');
const Client = require('../models/Client');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/client/:clientId', protect, async (req, res) => {
  try {
    const progress = await Progress.find({
      client: req.params.clientId,
      coach: req.user._id,
    }).sort({ date: -1 });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { client: clientId, weight, height } = req.body;
    const client = await Client.findOne({ _id: clientId, coach: req.user._id });
    if (!client) return res.status(404).json({ message: 'Client not found' });

    let bmi;
    const h = height || client.height;
    if (weight && h) {
      bmi = parseFloat((weight / ((h / 100) ** 2)).toFixed(1));
    }

    const progress = await Progress.create({
      ...req.body,
      coach: req.user._id,
      bmi,
    });

    if (weight) {
      client.weight = weight;
      await client.save();
    }

    res.status(201).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const progress = await Progress.findOneAndUpdate(
      { _id: req.params.id, coach: req.user._id },
      req.body,
      { new: true }
    );
    if (!progress) return res.status(404).json({ message: 'Progress entry not found' });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const progress = await Progress.findOneAndDelete({ _id: req.params.id, coach: req.user._id });
    if (!progress) return res.status(404).json({ message: 'Progress entry not found' });
    res.json({ message: 'Progress entry removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
