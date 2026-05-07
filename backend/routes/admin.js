const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const router = express.Router();
router.use(authMiddleware, adminMiddleware);

router.get('/stats', async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalOrders = await Order.countDocuments();
  const totalMenuItems = await MenuItem.countDocuments();
  const revenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]);
  res.json({ totalUsers, totalOrders, totalMenuItems, revenue: revenue[0]?.total || 0 });
});

router.get('/users', async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// Delete a user (admin only)
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete an admin user' });
    }
    await User.findByIdAndDelete(req.params.id);
    // Also delete their orders
    await Order.deleteMany({ customer: req.params.id });
    res.json({ message: 'User and their orders deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

router.get('/orders', async (req, res) => {
  const orders = await Order.find()
    .populate('customer', 'name email')
    .populate('items.menuItem', 'title price imageUrl category')
    .sort({ createdAt: -1 });
  res.json(orders);
});

// Delete an order (admin only)
router.delete('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete order' });
  }
});

router.get('/menu', async (req, res) => {
  const items = await MenuItem.find().sort({ category: 1, title: 1 });
  res.json(items);
});

module.exports = router;
