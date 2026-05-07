const express = require('express');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  const { items, deliveryAddress, paymentMethod } = req.body;
  if (!items || !items.length || !deliveryAddress) {
    return res.status(400).json({ message: 'Order items and delivery address are required' });
  }

  const orderItems = [];
  let total = 0;

  for (const item of items) {
    const menuItem = await MenuItem.findById(item.menuItem);
    if (!menuItem) return res.status(404).json({ message: `Menu item not found: ${item.menuItem}` });
    orderItems.push({ menuItem: menuItem._id, quantity: item.quantity || 1 });
    total += menuItem.price * (item.quantity || 1);
  }

  const order = await Order.create({
    customer: req.user._id,
    items: orderItems,
    total,
    deliveryAddress,
    paymentMethod: paymentMethod || 'Cash',
  });
  res.status(201).json(order);
});

router.put('/:id/payment', authMiddleware, adminMiddleware, async (req, res) => {
  const { paymentStatus, paymentMethod } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (paymentStatus) order.paymentStatus = paymentStatus;
  if (paymentMethod) order.paymentMethod = paymentMethod;
  await order.save();
  res.json(order);
});

router.get('/', authMiddleware, async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { customer: req.user._id };
  const orders = await Order.find(filter)
    .populate('customer', 'name email')
    .populate('items.menuItem', 'title price category imageUrl')
    .sort({ createdAt: -1 });
  res.json(orders);
});

router.put('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

// Delete an order (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete order' });
  }
});

module.exports = router;
