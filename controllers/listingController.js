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
    if (req.query.category)      filter.category      = req.query.category;
    if (req.query.listing_type)  filter.listing_type  = req.query.listing_type;
    if (req.query.subType)       filter.subType       = req.query.subType;
    if (req.query.property_type) filter.property_type = req.query.property_type;

    if (req.query.search) {
      const searchTerm = req.query.search.trim();
      const numSearch = Number(searchTerm);
      if (!isNaN(numSearch) && searchTerm !== "") {
        filter.listing_no = numSearch;
      } else {
        filter.title = { $regex: searchTerm, $options: 'i' };
      }
    }

    // text index kullanır — RegExp'e göre daha hızlı, index'e uygun
    if (req.query.city) filter.$text = { $search: req.query.city.trim() };

    if (req.query.minPrice) {
      filter.price = { ...filter.price, $gte: Number(req.query.minPrice) };
    }
    if (req.query.maxPrice) {
      filter.price = { ...filter.price, $lte: Number(req.query.maxPrice) };
    }

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
    const listing = await Listing.findById(id)
      .populate('features', 'key label category')
      .populate('admin_id', 'username first_name last_name phone email')
      .select('-__v')
      .lean();

    if (!listing) {
      return res.status(404).json({ success: false, message: 'İlan bulunamadı.' });
    }
    if (listing.status !== 'ACTIVE') {
      return res.status(404).json({ success: false, message: 'İlan bulunamadı.' });
    }

    // Buffer'a ekle — her 30 saniyede bir DB'ye toplu yazılır
    viewCountBuffer.increment(id);
    listing.view_count = (listing.view_count || 0) + 1; // yanıtta güncel sayı göster

    res.json({ success: true, data: listing });
  } catch (err) {
    console.error('Listing getById error:', err);
    res.status(500).json({ success: false, message: 'İlan detayı alınırken hata oluştu.' });
  }
}

module.exports = { list, getById };
