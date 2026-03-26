require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('../models/Listing');
const User = require('../models/User');

async function check() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/doganemlak';
  await mongoose.connect(uri);
  const counts = {
    listings: await Listing.countDocuments(),
    activeListings: await Listing.countDocuments({ status: 'ACTIVE' }),
    admins: await User.countDocuments({ role: 'ADMIN' }),
  };
  console.log('Counts:', counts);
  process.exit(0);
}

check();
