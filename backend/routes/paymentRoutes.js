const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { protect } = require('../middleware/authMiddleware');

// Initialize Razorpay
// If secrets aren't provided in .env, it won't crash here but will fail when calling Razorpay API.
// We'll manage fallbacks in the route handlers.
const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// @desc    Get Razorpay Key ID
// @route   GET /api/payment/config
router.get('/config', (req, res) => {
  res.json({ razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'mock_key' });
});

// @desc    Create Razorpay Order
// @route   POST /api/payment/order
router.post('/order', protect, async (req, res) => {
  try {
    const { amount } = req.body;
    
    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      // Fallback for mock payment if no keys
      return res.json({
        id: 'order_mock_' + Date.now(),
        amount: amount * 100, // Amount in paise
        currency: 'INR',
        isMock: true
      });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ message: 'Error creating Razorpay order', error: error.message });
  }
});

// @desc    Verify Razorpay Signature
// @route   POST /api/payment/verify
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, isMock } = req.body;
    
    // Auto-verify mock payments
    if (isMock) {
        return res.json({ verified: true, message: 'Mock payment verified successfully' });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ message: 'Missing payment details' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    
    const expectedSign = crypto
      .createHmac("sha256", secret)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      res.json({ verified: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ verified: false, message: 'Invalid signature sent!' });
    }
  } catch (error) {
    console.error('Razorpay Verify Error:', error);
    res.status(500).json({ message: 'Error verifying Razorpay payment', error: error.message });
  }
});

module.exports = router;
