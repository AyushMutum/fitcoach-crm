const express = require('express');
const Diet = require('../models/Diet');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const { client, isTemplate } = req.query;
    let query = { coach: req.user._id };
    if (client) query.client = client;
    if (isTemplate) query.isTemplate = isTemplate === 'true';
    const diets = await Diet.find(query).populate('client', 'fullName').sort({ createdAt: -1 });
    res.json(diets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const diet = await Diet.findOne({ _id: req.params.id, coach: req.user._id }).populate('client', 'fullName');
    if (!diet) return res.status(404).json({ message: 'Diet plan not found' });
    res.json(diet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const diet = await Diet.create({ ...req.body, coach: req.user._id });
    res.status(201).json(diet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const diet = await Diet.findOneAndUpdate(
      { _id: req.params.id, coach: req.user._id },
      req.body,
      { new: true }
    );
    if (!diet) return res.status(404).json({ message: 'Diet plan not found' });
    res.json(diet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const diet = await Diet.findOneAndDelete({ _id: req.params.id, coach: req.user._id });
    if (!diet) return res.status(404).json({ message: 'Diet plan not found' });
    res.json({ message: 'Diet plan removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
