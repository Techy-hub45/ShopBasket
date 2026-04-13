// const mongoose = require('mongoose');
// //mongodb://127.0.0.1:27017/ecommerce

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://shopbasketUser:shopbasket123@shopbasket-cluster.umfnijv.mongodb.net/?', {
//       // Mongoose 6+ no longer requires useNewUrlParser and useUnifiedTopology, but we include them for compatibility if on an older version
//     });
//     console.log(`MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error(`Error: ${error.message}`);
//     process.exit(1);
//   }
// };
// //mongoose.connect(process.env.MONGO_URI);
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected ✅"))
//   .catch(err => console.log(err));
// module.exports = connectDB;
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;
    
    // Automatically use Atlas on Vercel unless overridden
    if (!uri) {
      if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
        uri = "mongodb+srv://shopbasketUser:Shop12345@shopbasket-cluster.umfnijv.mongodb.net/shopbasket?retryWrites=true&w=majority";
      } else {
        // Run in local host and mongodb compass
        uri = "mongodb://127.0.0.1:27017/shopbasket";
      }
    }

    await mongoose.connect(uri, {
      family: 4
    });
    console.log(`MongoDB connected ✅ (${uri.includes('127.0.0.1') ? 'Local Compass' : 'Atlas/Cloud'})`);
  } catch (error) {
    console.error("MongoDB connection error ❌", error.message);
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    } else {
      throw error;
    }
  }
};

module.exports = connectDB;