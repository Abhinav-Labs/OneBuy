const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // fail fast if Atlas is unreachable
    });
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    console.error('Check your MONGO_URI in .env and ensure your IP is whitelisted in Atlas.');
    process.exit(1); // stop the server — don't silently fall back to memory
  }
};

module.exports = connectDB;
