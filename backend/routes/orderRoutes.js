const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');
const { sendSMS } = require('../utils/smsService');

// @desc    Create new order
// @route   POST /api/orders
router.post('/', protect, async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      coinsUsed = 0,
      walletAmountUsed = 0,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400).json({ message: 'No order items' });
      return;
    }

    const user = await User.findById(req.user._id);
    
    // Verify capacities
    if (coinsUsed > (user.rewardCoins || 0)) {
        return res.status(400).json({ message: 'Insufficient reward coins' });
    }
    if (walletAmountUsed > (user.walletBalance || 0)) {
        return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Process logic
    const coinsEarned = Math.floor(totalPrice * 0.05); // Earn 5% back as coins
    const expectedDeliveryDate = new Date();
    expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 3); // Delivery in 3 days

    // Deduct and Reward
    user.rewardCoins = (user.rewardCoins || 0) - coinsUsed + coinsEarned;
    user.walletBalance = (user.walletBalance || 0) - walletAmountUsed;
    await user.save();

    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      coinsUsed,
      walletAmountUsed,
      coinsEarned,
      expectedDeliveryDate,
      trackingHistory: [
        {
          status: 'ORDER_PLACED',
          timestamp: Date.now(),
          location: 'ShopBasket Systems',
          message: 'Your order has been placed successfully and logged in our systems.',
        }
      ],
      isPaid: (walletAmountUsed + Math.floor((coinsUsed || 0) / 10)) >= (totalPrice - 0.01)
    });

    if (order.isPaid) {
        order.paidAt = Date.now();
        order.paymentResult = {
            id: 'wallet_' + Date.now(),
            status: 'COMPLETED',
            update_time: new Date().toISOString(),
            email_address: user.email,
        };
        order.trackingHistory.push({
            status: 'PAYMENT_CONFIRMED',
            timestamp: Date.now(),
            location: 'Internal Wallet Gateway',
            message: 'Payment verified automatically via ShopBasket Wallet/Coins.'
        });
        order.trackingHistory.push({
            status: 'PROCESSING',
            timestamp: Date.now() + 1000, // 1 sec later synthetic
            location: 'Fulfillment Center Queue',
            message: 'Your order has been routed to our nearest fulfillment center and is pending packing.'
        });
    }

    const createdOrder = await order.save();
    
    // Trigger SMS notification
    if (user.phoneNumber) {
      sendSMS(user.phoneNumber, `Hello ${user.name}, your ShopBasket order #${createdOrder._id} has been placed. Track it here: http://localhost:5173/order/${createdOrder._id}`);
    }

    res.status(201).json(createdOrder);
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders/all
router.get('/myorders/all', protect, async (req, res) => {
  try {
    // Sort by newest first
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
router.put('/:id/pay', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'phoneNumber name');
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id || 'mock_payment_id',
        status: req.body.status || 'COMPLETED',
        update_time: req.body.update_time || new Date().toISOString(),
        email_address: req.body.email_address || 'mock@example.com',
      };
      
      order.trackingHistory.push({
        status: 'PAYMENT_CONFIRMED',
        timestamp: Date.now(),
        location: 'Secure Payment Gateway',
        message: `Payment verified automatically via ${order.paymentMethod || 'Gateway'}.`
      });
      order.trackingHistory.push({
        status: 'PROCESSING',
        timestamp: Date.now() + 1000,
        location: 'Fulfillment Center Queue',
        message: 'Your order is currently being packed for imminent dispatch.'
      });

      const updatedOrder = await order.save();
      
      if (order.user && order.user.phoneNumber) {
        sendSMS(order.user.phoneNumber, `Payment confirmed! Your ShopBasket order #${order._id} is processing. Track it: http://localhost:5173/order/${order._id}`);
      }

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
router.put('/:id/deliver', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'phoneNumber name');
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      
      order.trackingHistory.push({
        status: 'DELIVERED',
        timestamp: Date.now(),
        location: order.shippingAddress.city || 'Destination',
        message: 'Package delivered successfully to the recipient.'
      });
      
      const updatedOrder = await order.save();
      
      if (order.user && order.user.phoneNumber) {
        sendSMS(order.user.phoneNumber, `Good news! Your ShopBasket order #${order._id} has been delivered. Thank you for shopping with us!`);
      }

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
