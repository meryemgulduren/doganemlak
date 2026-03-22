const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['TALEP', 'SIKAYET'],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
      validate: [arr => arr.length <= 3, 'En fazla 3 fotoğraf yüklenebilir.'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['BEKLEMEDE', 'INCELENIYOR', 'COZULDU'],
      default: 'BEKLEMEDE',
    },
  },
  { timestamps: true }
);

complaintSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);
