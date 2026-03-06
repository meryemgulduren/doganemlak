const User = require('../models/User');
const Listing = require('../models/Listing');

/**
 * GET /api/admin/stats
 * Toplam kullanıcı ve ilan sayısı (requireAdmin).
 */
async function getStats(req, res) {
  try {
    const [totalUsers, totalListings, activeListings] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Listing.countDocuments({ status: 'ACTIVE' }),
    ]);
    res.json({
      success: true,
      data: {
        total_users: totalUsers,
        total_listings: totalListings,
        active_listings: activeListings,
      },
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ success: false, message: 'İstatistikler alınamadı.' });
  }
}

/**
 * GET /api/admin/listings
 * Tüm ilanlar (filtre, sayfalama; requireAdmin).
 */
async function listAllListings(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.listing_type) filter.listing_type = req.query.listing_type;
    if (req.query.city) filter['location.city'] = new RegExp(req.query.city.trim(), 'i');

    const [listings, total] = await Promise.all([
      Listing.find(filter)
        .sort({ listing_date: -1 })
        .skip(skip)
        .limit(limit)
        .populate('features', 'key label category')
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
    console.error('Admin list listings error:', err);
    res.status(500).json({ success: false, message: 'İlanlar listelenirken hata oluştu.' });
  }
}

/**
 * category + subType -> property_type (mevcut enum ile uyum)
 */
function mapCategoryToPropertyType(category, subType) {
  if (!category) return 'DAIRE';
  if (category === 'ARSA') return 'ARSA';
  if (category === 'BINA') return 'BINA';
  if (category === 'IS_YERI') return 'IS_YERI';
  if (category === 'KONUT') {
    const map = { DAIRE: 'DAIRE', MUSTAKIL_VILLA: 'VILLA', REZIDANS: 'DAIRE', YAZLIK: 'VILLA' };
    return map[subType] || 'DAIRE';
  }
  return 'DAIRE';
}

/**
 * POST /api/admin/listings
 * Yeni ilan oluştur (requireAdmin). listing_no benzersiz üretilir.
 */
async function createListing(req, res) {
  try {
    const body = req.body;
    const listingNo = Number(`${Date.now().toString().slice(-9)}${Math.floor(Math.random() * 10)}`);

    const listingType = body.listingType ?? body.listing_type ?? 'SATILIK';
    const category = body.category || null;
    const subType = body.subType || null;
    const property_type = body.property_type ?? mapCategoryToPropertyType(category, subType);
    const specs = body.specifications || {};

    const listing = await Listing.create({
      listing_no: listingNo,
      title: body.title || 'Başlıksız',
      description: body.description ?? '',
      price: body.price ?? 0,
      currency: body.currency || 'TRY',
      listing_type: listingType,
      property_type,
      category: category || undefined,
      listingType: listingType,
      subType: subType || undefined,
      m2_brut: specs.m2_brut ?? body.m2_brut,
      m2_net: specs.m2_net ?? body.m2_net,
      room_count: specs.room_count ?? body.room_count,
      floor_number: specs.floor_number ?? body.floor_number,
      total_floors: specs.total_floors ?? body.total_floors,
      building_age: specs.building_age ?? body.building_age,
      heating_type: specs.heating_type ?? body.heating_type,
      bathroom_count: specs.bathroom_count ?? body.bathroom_count,
      balcony: typeof specs.balcony === 'boolean' ? specs.balcony : !!body.balcony,
      furnished: typeof specs.furnished === 'boolean' ? specs.furnished : !!body.furnished,
      using_status: specs.using_status ?? body.using_status,
      in_site: typeof specs.in_site === 'boolean' ? specs.in_site : !!body.in_site,
      credit_eligible: typeof specs.credit_eligible === 'boolean' ? specs.credit_eligible : !!body.credit_eligible,
      dues: specs.dues ?? body.dues,
      specifications: specs,
      facade: Array.isArray(body.facade) ? body.facade : [],
      location: body.location || {},
      media: {
        images: Array.isArray(body.media?.images) ? body.media.images : [],
        videos: Array.isArray(body.media?.videos) ? body.media.videos : [],
      },
      features: Array.isArray(body.features) ? body.features : [],
      status: body.status || 'ACTIVE',
      admin_id: req.user._id,
    });

    const populated = await Listing.findById(listing._id)
      .populate('features', 'key label category')
      .select('-__v')
      .lean();

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error('Admin create listing error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'listing_no zaten kullanılıyor. Tekrar deneyin.' });
    }
    res.status(500).json({ success: false, message: 'İlan oluşturulurken hata oluştu.' });
  }
}

/**
 * PUT /api/admin/listings/:id
 * İlan güncelle (requireAdmin).
 */
async function updateListing(req, res) {
  try {
    const { id } = req.params;
    const body = req.body;

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'İlan bulunamadı.' });
    }

    const listingType = body.listingType ?? body.listing_type;
    const category = body.category;
    const subType = body.subType;
    const specs = body.specifications || null;
    if (listingType !== undefined) {
      listing.listing_type = listingType;
      listing.listingType = listingType;
    }
    if (category !== undefined) listing.category = category;
    if (subType !== undefined) listing.subType = subType;
    if (body.property_type !== undefined) listing.property_type = body.property_type;
    else if (category != null && subType != null) {
      listing.property_type = mapCategoryToPropertyType(category, subType);
    }

    if (specs && typeof specs === 'object') {
      listing.specifications = specs;
      if (specs.m2_brut !== undefined) listing.m2_brut = specs.m2_brut;
      if (specs.m2_net !== undefined) listing.m2_net = specs.m2_net;
      if (specs.room_count !== undefined) listing.room_count = specs.room_count;
      if (specs.floor_number !== undefined) listing.floor_number = specs.floor_number;
      if (specs.total_floors !== undefined) listing.total_floors = specs.total_floors;
      if (specs.building_age !== undefined) listing.building_age = specs.building_age;
      if (specs.heating_type !== undefined) listing.heating_type = specs.heating_type;
      if (specs.bathroom_count !== undefined) listing.bathroom_count = specs.bathroom_count;
      if (specs.balcony !== undefined) listing.balcony = !!specs.balcony;
      if (specs.furnished !== undefined) listing.furnished = !!specs.furnished;
      if (specs.using_status !== undefined) listing.using_status = specs.using_status;
      if (specs.in_site !== undefined) listing.in_site = !!specs.in_site;
      if (specs.credit_eligible !== undefined) listing.credit_eligible = !!specs.credit_eligible;
      if (specs.dues !== undefined) listing.dues = specs.dues;
    }

    const allowed = [
      'title', 'description', 'price', 'currency', 'listing_type', 'property_type',
      'm2_brut', 'm2_net', 'room_count', 'floor_number', 'total_floors', 'building_age',
      'heating_type', 'bathroom_count', 'balcony', 'furnished', 'using_status',
      'in_site', 'credit_eligible', 'dues', 'facade', 'location', 'media', 'features', 'status',
    ];
    for (const key of allowed) {
      if (body[key] !== undefined) {
        if (key === 'location' && typeof body[key] === 'object') listing.location = body[key];
        else if (key === 'media' && typeof body[key] === 'object') {
          listing.media = {
            images: Array.isArray(body[key].images) ? body[key].images : listing.media?.images || [],
            videos: Array.isArray(body[key].videos) ? body[key].videos : listing.media?.videos || [],
          };
        } else if (key === 'features' && Array.isArray(body[key])) listing.features = body[key];
        else listing[key] = body[key];
      }
    }
    await listing.save();

    const populated = await Listing.findById(listing._id)
      .populate('features', 'key label category')
      .select('-__v')
      .lean();

    res.json({ success: true, data: populated });
  } catch (err) {
    console.error('Admin update listing error:', err);
    res.status(500).json({ success: false, message: 'İlan güncellenirken hata oluştu.' });
  }
}

/**
 * DELETE /api/admin/listings/:id
 * İlan sil (requireAdmin). Fiziksel silme veya status PASSIVE.
 */
async function deleteListing(req, res) {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'İlan bulunamadı.' });
    }
    await Listing.deleteOne({ _id: id });
    res.json({ success: true, message: 'İlan silindi.' });
  } catch (err) {
    console.error('Admin delete listing error:', err);
    res.status(500).json({ success: false, message: 'İlan silinirken hata oluştu.' });
  }
}

module.exports = {
  getStats,
  listAllListings,
  createListing,
  updateListing,
  deleteListing,
};
