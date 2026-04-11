const mongoose = require('mongoose');

const bannerSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    image: { type: String, required: true },
    color: { type: String, default: 'from-blue-900 to-indigo-800' },
    link: { type: String, default: '/' },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', bannerSchema);
