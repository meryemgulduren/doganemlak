/**
 * controllers/listingController.js
 *
 * Genel kullanıcı ilan endpoint'leri.
 * - list():    Filtreli + sayfalı ilan listesi. Şehir araması $text index kullanır.
 * - getById(): İlan detayı; görüntüleme sayacı viewCountBuffer'a iletilir (batch write).
 */

const Listing = require('../models/Listing');
const viewCountBuffer = require('../utils/viewCountBuffer');

const DEFAULT_PAGE  = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT     = 100;

/**
 * GET /api/listings
 * Query: page, limit, listing_type, property_type, city, minPrice, maxPrice
 */
async function list(req, res) {
  try {
    const page  = Math.max(1, parseInt(req.query.page,  10) || DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));
    const skip  = (page - 1) * limit;

    const filter = { status: 'ACTIVE' };

    // Basic fields
    const directFields = ['category', 'listing_type', 'subType', 'property_type', 'currency', 'using_status', 'property_condition', 'zoning_status', 'title_deed_status', 'heating_type', 'building_age', 'room_count'];
    directFields.forEach(field => {
      if (req.query[field]) {
        const value = req.query[field];
        if (typeof value === 'string' && value.includes(',')) {
          filter[field] = { $in: value.split(',').map(v => v.trim()) };
        } else {
          filter[field] = value;
        }
      }
    });

    // Range fields
    const rangeFields = [
      { key: 'price', min: 'min_price', max: 'max_price' },
      { key: 'm2_brut', min: 'min_m2_brut', max: 'max_m2_brut' },
      { key: 'm2_net', min: 'min_m2_net', max: 'max_m2_net' },
      { key: 'open_area_m2', min: 'min_open_area_m2', max: 'max_open_area_m2' },
      { key: 'floor_number', min: 'min_floor', max: 'max_floor' },
      { key: 'total_floors', min: 'min_total_floors', max: 'max_total_floors' },
      { key: 'bathroom_count', min: 'min_bathrooms', max: 'max_bathrooms' },
      { key: 'dues', min: 'min_dues', max: 'max_dues' },
    ];

    rangeFields.forEach(({ key, min, max }) => {
      if (req.query[min] || req.query[max]) {
        filter[key] = {};
        if (req.query[min]) filter[key].$gte = Number(req.query[min]);
        if (req.query[max]) filter[key].$lte = Number(req.query[max]);
      }
    });

    // Boolean fields
    const booleanFields = ['balcony', 'furnished', 'in_site', 'credit_eligible'];
    booleanFields.forEach(field => {
      if (req.query[field] !== undefined) {
        filter[field] = req.query[field] === 'true';
      }
    });

    // Facade (Array field)
    if (req.query.facade) {
      const facades = req.query.facade.split(',').map(v => v.trim());
      filter.facade = { $in: facades };
    }

    // Search
    if (req.query.search) {
      const searchTerm = req.query.search.trim();
      const numSearch = Number(searchTerm);
      if (!isNaN(numSearch) && searchTerm !== "") {
        filter.listing_no = numSearch;
      } else {
        filter.title = { $regex: searchTerm, $options: 'i' };
      }
    }

    // Location
    if (req.query.city) filter['location.city'] = req.query.city;
    if (req.query.district) filter['location.district'] = req.query.district;
    if (req.query.neighborhood) filter['location.neighborhood'] = req.query.neighborhood;

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .sort({ listing_date: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .lean(),
      Listing.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error('Listing list error:', err);
    res.status(500).json({ success: false, message: 'İlanlar listelenirken hata oluştu.' });
  }
}

/**
 * GET /api/listings/:id
 * features populate edilir; görüntüleme sayacı buffer'a iletilir (DB'ye doğrudan yazılmaz).
 */
async function getById(req, res) {
  try {
    const { id } = req.params;
    const listingDoc = await Listing.findById(id)
      .populate('features', 'key label category')
      .populate('admin_id', '_id username first_name last_name phone email profile_image')
      .select('-__v');

    if (!listingDoc) {
      return res.status(404).json({ success: false, message: 'İlan bulunamadı.' });
    }
    const listing = listingDoc.toObject({ flattenMaps: true });
    if (listing.status !== 'ACTIVE') {
      return res.status(404).json({ success: false, message: 'İlan bulunamadı.' });
    }

    // Buffer'a ekle — her 2 dakikada bir DB'ye toplu yazılır, 1 dakikalık IP korumalı
    viewCountBuffer.increment(id, req.ip);
    listing.view_count = (listing.view_count || 0) + 1; // yanıtta güncel sayı göster

    res.json({ success: true, data: listing });
  } catch (err) {
    console.error('Listing getById error:', err);
    res.status(500).json({ success: false, message: 'İlan detayı alınırken hata oluştu.' });
  }
}

module.exports = { list, getById };
