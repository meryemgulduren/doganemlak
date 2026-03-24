require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function updateAdminPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOne({ username: 'admin' });
    if (user) {
      user.password_hash = await bcrypt.hash('admin', 12);
      await user.save();
      console.log('Admin password updated to admin');
    } else {
      console.log('Admin user not found');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

updateAdminPassword();
