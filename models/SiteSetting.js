const mongoose = require('mongoose');

const socialMediaSchema = new mongoose.Schema({
  facebook: { type: String, default: null, trim: true },
  instagram: { type: String, default: null, trim: true },
  linkedin: { type: String, default: null, trim: true },
}, { _id: false });

const siteSettingSchema = new mongoose.Schema({
  logo_url: { type: String, default: null },
  contact_email: { type: String, default: null, trim: true },
  social_media: { type: socialMediaSchema, default: () => ({}) },
  terms_and_conditions: { type: String, default: null },
});

// Genelde tek doküman kullanılır (singleton)
module.exports = mongoose.model('SiteSetting', siteSettingSchema);
