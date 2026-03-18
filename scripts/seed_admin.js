const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:sifre123@localhost:27017/doganemlak?authSource=admin';

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    const adminExists = await User.findOne({ username: 'admin' });
    if (adminExists) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    const password_hash = await bcrypt.hash('admin', 12);
    const adminUser = new User({
      username: 'admin',
      email: 'admin@doganemlak.com',
      password_hash: password_hash,
      role: 'ADMIN',
      first_name: 'System',
      last_name: 'Admin'
    });

    await adminUser.save();
    console.log('Admin user created successfully.');
    console.log('Username: admin');
    console.log('Password: admin');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seedAdmin();
