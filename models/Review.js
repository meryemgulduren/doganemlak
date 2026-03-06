const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  listing_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  comment_text: { type: String, required: true, trim: true },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    integer: true,
  },
  is_approved: { type: Boolean, default: false },
}, { timestamps: { createdAt: true, updatedAt: false } });

reviewSchema.index({ listing_id: 1 });
reviewSchema.index({ user_id: 1 });
reviewSchema.index({ is_approved: 1 });

module.exports = mongoose.model('Review', reviewSchema);
