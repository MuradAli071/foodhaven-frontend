const express = require('express');
const Settings = require('../models/Settings');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const upload = require('../config/multer');

const router = express.Router();

// Public route to get settings
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.find({});
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(settingsMap);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
});

// Admin route to update settings
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { key, value } = req.body;
    const settings = await Settings.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    );
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

// Admin route to upload hero background
router.post('/upload-hero', authMiddleware, adminMiddleware, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const imageUrl = `/uploads/${req.file.filename}`;
    
    try {
      await Settings.findOneAndUpdate(
        { key: 'heroBackgroundImage' },
        { value: imageUrl },
        { upsert: true }
      );
      res.json({ imageUrl });
    } catch (error) {
      res.status(500).json({ message: 'Failed to save background image' });
    }
  });
});

module.exports = router;
