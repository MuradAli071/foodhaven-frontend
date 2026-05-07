const express = require('express');
const path = require('path');
const MenuItem = require('../models/MenuItem');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const upload = require('../config/multer');

const router = express.Router();

router.get('/', async (req, res) => {
  const items = await MenuItem.find({ available: true }).sort({ category: 1, title: 1 });
  res.json(items);
});

router.get('/:id', async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Menu item not found' });
  res.json(item);
});

router.post('/upload', authMiddleware, adminMiddleware, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({ imageUrl });
});

router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { title, description, price, category, imageUrl, available } = req.body;
  const item = await MenuItem.create({ title, description, price, category, imageUrl, available });
  res.status(201).json(item);
});

router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) return res.status(404).json({ message: 'Menu item not found' });
  res.json(item);
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const item = await MenuItem.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Menu item not found' });
  res.json({ message: 'Menu item deleted' });
});

module.exports = router;
