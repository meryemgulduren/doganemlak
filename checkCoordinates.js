require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('./models/Listing');

async function checkListingCoordinates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doganemlak');
    const listing = await Listing.findOne().sort({ createdAt: -1 });
    if (listing) {
      console.log('Latest Listing ID:', listing._id);
      console.log('Title:', listing.title);
      console.log('Location:', JSON.stringify(listing.location, null, 2));
      console.log('Geo:', JSON.stringify(listing.geo, null, 2));
    } else {
      console.log('No listings found.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkListingCoordinates();
