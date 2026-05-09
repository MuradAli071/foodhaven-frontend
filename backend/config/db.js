const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/foodhaven';
    const db = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = db.connections[0].readyState;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // Don't exit process in serverless, just throw error
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
