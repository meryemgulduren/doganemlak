const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username:      { type: String, required: true, unique: true, trim: true },
    email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    first_name:    { type: String, default: null, trim: true },
    last_name:     { type: String, default: null, trim: true },
    phone:         { type: String, default: null, trim: true },
    role:          { type: String, enum: ['ADMIN', 'USER'], default: 'USER' },
    profile_image: { type: String, default: null },
    favorites:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
    last_login:    { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
