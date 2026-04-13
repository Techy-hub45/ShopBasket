require("dotenv").config();
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Connect to Database
// connectDB();
// const connectDB = require("./config/db");

connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/payment', paymentRoutes);

app.get('/api/seed', async (req, res) => {
  try {
    const seedData = require('./seeder');
    const count = await seedData();
    res.send(`Database Seeded Successfully! ${count} Products Injected.`);
  } catch (error) {
    res.status(500).send(`Seeding Failed: ${error.message}`);
  }
});

app.get('/', (req, res) => {
  res.send('E-Commerce API is running...');
});

const PORT = process.env.PORT || 5000;
// Export app for serverless deployment
module.exports = app;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
