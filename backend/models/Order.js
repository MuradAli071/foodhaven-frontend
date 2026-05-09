const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
      quantity: { type: Number, required: true, default: 1 },
    },
  ],
  total: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Preparing', 'Ready', 'On The Way', 'Delivered', 'Cancelled'], default: 'Pending' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  paymentMethod: { type: String, enum: ['Cash', 'Card', 'Online'], default: 'Cash' },
  deliveryAddress: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
