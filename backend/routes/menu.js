const express = require('express');
const path = require('path');
const MenuItem = require('../models/MenuItem');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const upload = require('../config/multer');

const router = express.Router();

router.get('/', async (req, res) => {
  const items = await MenuItem.find({ available: true })
    .sort({ category: 1, title: 1 });
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
  try {
    const { title, description, price, category, imageUrl, available } = req.body;
    if (!title || !price) {
      return res.status(400).json({ message: 'Title and price are required' });
    }
    const item = await MenuItem.create({ title, description, price, category, imageUrl, available });
    res.status(201).json(item);
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ message: 'Failed to create menu item. Please try again.' });
  }
});

router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json(item);
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ message: 'Failed to update menu item.' });
  }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ message: 'Failed to delete menu item. It might be in use.' });
  }
});

module.exports = router;
