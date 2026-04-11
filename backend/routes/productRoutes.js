const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Fetch all products
// @route   GET /api/products
router.get('/', async (req, res) => {
  try {
    const keywordStr = req.query.keyword ? req.query.keyword.trim() : '';
    const keywordQuery = keywordStr
      ? {
          $or: [
            { name: { $regex: keywordStr, $options: 'i' } },
            { category: { $regex: keywordStr, $options: 'i' } },
            { brand: { $regex: keywordStr, $options: 'i' } }
          ]
        }
      : {};

    const products = await Product.find({ ...keywordQuery });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Fetch single product
// @route   GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Like a product
// @route   PUT /api/products/:id/like
router.put('/:id/like', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.likes = (product.likes || 0) + 1;
      await product.save();
      res.json({ message: 'Product liked!', likes: product.likes });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name || 'New Premium Product',
      price: req.body.price || 0,
      user: req.user._id,
      images: req.body.images && req.body.images.length > 0 ? req.body.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
      brand: req.body.brand || 'ShopBasket Originals',
      category: req.body.category || 'Mobiles',
      countInStock: req.body.countInStock || 0,
      numReviews: 0,
      description: req.body.description || 'Amazing product quality guaranteed.',
      discount: req.body.discount || 0
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    product.name = req.body.name || product.name;
    product.price = req.body.price || product.price;
    product.description = req.body.description || product.description;
    if (req.body.images && req.body.images.length > 0) {
      product.images = req.body.images;
    }
    product.brand = req.body.brand || product.brand;
    product.category = req.body.category || product.category;
    if (req.body.countInStock !== undefined) product.countInStock = req.body.countInStock;
    if (req.body.discount !== undefined) product.discount = req.body.discount;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await product.deleteOne(); // Use deleteOne() instead of matching find().remove() for newer mongoose versions
    res.json({ message: 'Product successfully obliterated from the catalog' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
