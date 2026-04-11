const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const productSchema = mongoose.Schema(
  {
    user: { // Admin who created it
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    images: { type: [String], default: [] }, // Multiple angles
    brand: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    specs: { type: Map, of: String }, // Flexible specs for filters (e.g., material, voltage)
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 }, // Discount percentage
    countInStock: { type: Number, required: true, default: 0 },
    likes: { type: Number, default: 0 } // Extra feature for 'liking' products
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
