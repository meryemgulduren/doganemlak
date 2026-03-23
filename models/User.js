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
    /** Normal kullanıcıların favorilediği danışman (ADMIN) kullanıcıları */
    favorite_consultants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    last_login:    { type: Date, default: null },
    /** Şifre sıfırlama token'ı (SHA-256 hash olarak saklanır) */
    reset_token:         { type: String, default: null },
    reset_token_expires: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// email ve username için index zaten `unique: true` ile oluşturuluyor; tekrar tanımlamayın (Mongoose uyarısı).
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
