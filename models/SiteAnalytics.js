const mongoose = require('mongoose');

const siteAnalyticsSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  total_users: { type: Number, default: 0 },
  total_listings: { type: Number, default: 0 },
  active_visitor_count: { type: Number, default: 0 },
  most_searched_keywords: [{ type: String }],
});

siteAnalyticsSchema.index({ date: -1 });

module.exports = mongoose.model('SiteAnalytics', siteAnalyticsSchema);
