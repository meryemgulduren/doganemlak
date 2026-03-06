const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doganemlak', {
      // Mongoose 6+ default: no need for useNewUrlParser, useUnifiedTopology
    });
    console.log(`MongoDB bağlandı: ${conn.connection.host}`);
  } catch (err) {
    console.error('MongoDB bağlantı hatası:', err.message);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB bağlantısı kesildi.');
});

module.exports = connectDB;
