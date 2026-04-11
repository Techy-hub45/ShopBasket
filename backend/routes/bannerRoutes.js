const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Fetch all banners that are active
// @route   GET /api/banners
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({ active: true });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Fetch all banners (admin)
// @route   GET /api/banners/all
router.get('/all', protect, admin, async (req, res) => {
  try {
    const banners = await Banner.find({});
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a new banner
// @route   POST /api/banners
router.post('/', protect, admin, async (req, res) => {
  const { title, subtitle, image, color, link } = req.body;
  try {
    const banner = new Banner({ title, subtitle, image, color, link });
    const createdBanner = await banner.save();
    res.status(201).json(createdBanner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a banner
// @route   PUT /api/banners/:id
router.put('/:id', protect, admin, async (req, res) => {
  const { title, subtitle, image, color, link, active } = req.body;
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    banner.title = title || banner.title;
    banner.subtitle = subtitle || banner.subtitle;
    banner.image = image || banner.image;
    banner.color = color || banner.color;
    banner.link = link || banner.link;
    if (active !== undefined) banner.active = active;

    const updatedBanner = await banner.save();
    res.json(updatedBanner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a banner
// @route   DELETE /api/banners/:id
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    await banner.deleteOne();
    res.json({ message: 'Banner removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
