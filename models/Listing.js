const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  city: { type: String, default: null },
  district: { type: String, default: null },
  neighborhood: { type: String, default: null },
  coordinates: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
}, { _id: false });

const mediaSchema = new mongoose.Schema({
  images: [{ type: String }],
  videos: [{ type: String }],
}, { _id: false });

const listingSchema = new mongoose.Schema(
  {
    listing_no: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    currency: { type: String, enum: ['TRY', 'USD', 'EUR'], default: 'TRY' },
    listing_date: { type: Date, default: Date.now },
    listing_type: { type: String, enum: ['SATILIK', 'KIRALIK'], required: true },
    property_type: {
      type: String,
      enum: ['DAIRE', 'VILLA', 'ARSA', 'IS_YERI', 'BINA'],
      required: true,
    },
    category: { type: String, default: null },
    listingType: { type: String, enum: ['SATILIK', 'KIRALIK'], default: null },
    subType: { type: String, default: null },
    m2_brut: { type: Number, default: null },
    m2_net: { type: Number, default: null },
    room_count: { type: String, default: null },
    floor_number: { type: Number, default: null },
    total_floors: { type: Number, default: null },
    building_age: { type: String, default: null },
    heating_type: { type: String, default: null },
    bathroom_count: { type: Number, default: null },
    balcony: { type: Boolean, default: false },
    furnished: { type: Boolean, default: false },
    using_status: { type: String, default: null },
    in_site: { type: Boolean, default: false },
    credit_eligible: { type: Boolean, default: false },
    dues: { type: Number, default: null },
    specifications: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    facade: [{ type: String }],
    location: { type: locationSchema, default: () => ({}) },
    media: { type: mediaSchema, default: () => ({ images: [], videos: [] }) },
    features: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FeatureDefinition' }],
    view_count: { type: Number, default: 0 },
    favorite_count: { type: Number, default: 0 },
    status: { type: String, enum: ['ACTIVE', 'PASSIVE', 'SOLD'], default: 'ACTIVE' },
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

listingSchema.index({ listing_type: 1, status: 1 });
listingSchema.index({ 'location.city': 1, 'location.district': 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ listing_date: -1 });

module.exports = mongoose.model('Listing', listingSchema);
