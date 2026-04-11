const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');

// Get user profile (including wallet, coins, wishlist populated)
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist').select('-password');
    if (user) {
      // Filter out null elements (e.g. products that were deleted)
      user.wishlist = user.wishlist.filter(item => item !== null);
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Add money to wallet
router.post('/wallet/add', protect, async (req, res) => {
  const { amount } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.walletBalance = (user.walletBalance || 0) + Number(amount);
      const updatedUser = await user.save();
      res.json({ walletBalance: updatedUser.walletBalance });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error("Wallet Add Error:", error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
});

// Toggle Wishlist Item
router.post('/wishlist/toggle', protect, async (req, res) => {
  const { productId } = req.body;
  
  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (user) {
      const alreadyInWishlist = user.wishlist.find(id => id.toString() === productId);
      
      if (alreadyInWishlist) {
        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
      } else {
        user.wishlist.push(productId);
      }
      
      const updatedUser = await user.save();
      // Populate to return the updated wishlist objects
      const populatedUser = await User.findById(updatedUser._id).populate('wishlist').select('-password');
      const filteredWishlist = populatedUser.wishlist.filter(item => item !== null);
      res.json({ wishlist: filteredWishlist });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET all users (Admin only)
router.get('/', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE a user (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      if (user.isAdmin) {
        return res.status(400).json({ message: 'Cannot delete another Admin user' });
      }
      await user.deleteOne();
      res.json({ message: 'User removed successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
