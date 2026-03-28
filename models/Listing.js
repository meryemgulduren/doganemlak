const mongoose = require('mongoose');
const { SPEC_TO_FIELD_MAP } = require('../utils/listingUtils');

const locationSchema = new mongoose.Schema({
  city: { type: String, default: null },
  district: { type: String, default: null },
  neighborhood: { type: String, default: null },
  address_details: { type: String, default: null },
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
    price: { type: Number, default: null },
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

    // ── Flat kolonlar — specifications pre-save hook tarafından otomatik doldurulur ──
    m2_brut: { type: Number, default: null },
    m2_net: { type: Number, default: null },
    open_area_m2: { type: Number, default: null },
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
    property_condition: { type: String, default: null },
    has_tenant: { type: String, default: null },
    ground_survey: { type: String, default: null },
    commercial_features: { type: [String], default: [] },
    zoning_status: { type: String, default: null },
    ada_no: { type: String, default: null },
    parsel_no: { type: String, default: null },
    pafta_no: { type: String, default: null },
    kaks_emsal: { type: String, default: null },
    gabari: { type: String, default: null },
    title_deed_status: { type: String, default: null },
    swap_option: { type: String, default: null },

    /**
     * Kategori-özgü tüm ek alanlar bu esnek Map'te tutulur.
     * SPEC_TO_FIELD_MAP'teki alanlar pre('save') hook'u ile flat kolonlara senkronize edilir.
     */
    specifications: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },

    facade: [{ type: String }],
    location: { type: locationSchema, default: () => ({}) },
    /** GeoJSON Point — konum bazlı arama ($near, $geoWithin) için */
    geo: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: undefined,
      },
    },
    media: { type: mediaSchema, default: () => ({ images: [], videos: [] }) },
    features: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FeatureDefinition' }],
    view_count: { type: Number, default: 0 },
    favorite_count: { type: Number, default: 0 },
    status: { type: String, enum: ['ACTIVE', 'PASSIVE', 'PENDING', 'SOLD'], default: 'ACTIVE' },
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

// ── Index'ler ─────────────────────────────────────────────────────────────────
listingSchema.index({ listing_type: 1, status: 1 });
listingSchema.index({ property_type: 1, status: 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ listing_date: -1 });
// Text index: şehir araması RegExp yerine $text sorgusu ile yapılır
listingSchema.index({ 'location.city': 'text', 'location.district': 'text' });
// Konum compound index (non-text filtreler için)
listingSchema.index({ 'location.city': 1, 'location.district': 1 });
listingSchema.index({ geo: '2dsphere' });

// ── Pre-save hook: location.coordinates → geo (GeoJSON) senkronizasyonu ────────
listingSchema.pre('save', async function syncLocationToGeo() {
  const lat = this.location?.coordinates?.lat;
  const lng = this.location?.coordinates?.lng;
  if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
    this.geo = { type: 'Point', coordinates: [lng, lat] }; // GeoJSON: [longitude, latitude]
  } else {
    this.geo = undefined;
  }
});

// ── Pre-save hook: specifications → flat alan senkronizasyonu ─────────────────
/**
 * specifications Map değiştiğinde ilgili flat kolonları otomatik günceller.
 * Controller'da her alanı tek tek yazmak zorunda kalmayız (DRY).
 *
 * async function olarak tanımlandı: Mongoose 6+ modern yaklaşımı, next() gerekmez.
 */
listingSchema.pre('save', async function syncSpecificationsToFields() {
  const specs = this.specifications;
  if (!specs) return;

  // Mongoose Map ya da plain object — her ikisini de destekle
  const getValue = (key) =>
    specs instanceof Map ? specs.get(key) : specs[key];

  const BOOLEAN_FIELDS = new Set(['balcony', 'furnished', 'in_site', 'credit_eligible']);

  for (const [specKey, fieldKey] of Object.entries(SPEC_TO_FIELD_MAP)) {
    const value = getValue(specKey);
    if (value === undefined) continue;

    if (fieldKey === 'commercial_features') {
      this[fieldKey] = Array.isArray(value) ? value : [];
    } else if (BOOLEAN_FIELDS.has(fieldKey)) {
      this[fieldKey] = Boolean(value);
    } else {
      this[fieldKey] = value ?? null;
    }
  }
});

module.exports = mongoose.model('Listing', listingSchema);
