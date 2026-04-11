const express = require('express');
const router = express.Router();
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/authMiddleware');
const { sendWelcomeEmail } = require('../utils/emailService');

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  const emailInput = req.body.email?.trim() || '';
  const password = req.body.password; // Do not trim password

  try {
    const user = await User.findOne({ email: { $regex: new RegExp(`^\\s*${emailInput}\\s*$`, 'i') } });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Register a new user
// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  const name = req.body.name;
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;
  const phoneNumber = req.body.phoneNumber || '';
  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phoneNumber,
      isAdmin: false // First user would usually be manually made admin via DB
    });

    if (user) {
      // Send welcome email asynchronously
      sendWelcomeEmail(user.email, user.name);
      
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/profile
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc    Generate password reset token (Mock Email sending)
// @route   POST /api/auth/forgotpassword
router.post('/forgotpassword', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a temporary 15min JWT token for password reset
    const jwt = require('jsonwebtoken');
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'supersecretkey', { expiresIn: '15m' });

    // In a real app, send this via email. We'll return it representing the "mock email sent" action.
    res.json({ 
      message: 'Password reset link sent to email',
      mockResetUrl: `/reset-password/${resetToken}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword
router.put('/resetpassword', async (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Please provide token and new password' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password
    user.password = newPassword;
    await user.save(); // Will automatically hash via the pre-save hook

    res.json({ message: 'Password has been elegantly reset. You can now log in.' });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired reset token' });
  }
});

module.exports = router;
