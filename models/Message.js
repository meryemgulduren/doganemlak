const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  listing_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    default: null,
  },
  subject: { type: String, default: null, trim: true },
  message_body: { type: String, required: true },
  is_read: { type: Boolean, default: false },
  type: {
    type: String,
    enum: ['MESSAGE', 'INQUIRY', 'NOTIFICATION'],
    default: 'MESSAGE',
  },
}, { timestamps: { createdAt: true, updatedAt: false } });

messageSchema.index({ receiver_id: 1, is_read: 1 });
messageSchema.index({ sender_id: 1 });
messageSchema.index({ listing_id: 1 });

module.exports = mongoose.model('Message', messageSchema);
