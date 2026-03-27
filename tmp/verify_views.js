const mongoose = require('mongoose');
const Listing = require('../models/Listing');
const dotenv = require('dotenv');

dotenv.config();

async function verify() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const totalViewsResult = await Listing.aggregate([{ $group: { _id: null, total: { $sum: '$view_count' } } }]);
    const totalViews = totalViewsResult[0]?.total || 0;

    const listingsCount = await Listing.countDocuments();
    console.log(`Summary:`);
    console.log(`Total Listings: ${listingsCount}`);
    console.log(`Total Views (calculated): ${totalViews}`);

    // Check individual view counts
    const sampleListings = await Listing.find().limit(5).select('title view_count');
    console.log('\nSample Listings View Counts:');
    sampleListings.forEach(l => {
      console.log(`- ${l.title}: ${l.view_count}`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

verify();
