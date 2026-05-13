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

// TEST ROUTE: Public upload without auth (FOR DEBUGGING ONLY)
router.post('/test-upload', (req, res) => {
  console.log('[DEBUG] Test upload received');
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('[DEBUG Error]', err.message);
      return res.status(400).json({ message: `DEBUG: ${err.message}` });
    }
    if (!req.file) {
      console.error('[DEBUG Error] No file');
      return res.status(400).json({ message: 'DEBUG: No file received' });
    }
    console.log('[DEBUG Success]', req.file.filename);
    res.json({ imageUrl: `/uploads/${req.file.filename}` });
  });
});

router.post('/upload', authMiddleware, adminMiddleware, (req, res) => {
  console.log('[Upload] Request reached menu/upload');
  upload.single('image')(req, res, function (err) {
    if (err) {
      console.error('[Upload Error Logic]', err.message);
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      console.error('[Upload Error Logic] No file');
      return res.status(400).json({ message: 'No file received.' });
    }

    console.log('[Upload Success Logic]', req.file.filename);
    const imageUrl = `/uploads/${req.file.filename}`;
    res.status(201).json({ imageUrl });
  });
});

router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, description, price, category, imageUrl, available, prepTime } = req.body;
    if (!title || !price) {
      return res.status(400).json({ message: 'Title and price are required' });
    }
    const item = await MenuItem.create({ title, description, price, category, imageUrl, available, prepTime });
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
