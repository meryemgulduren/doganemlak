/**
 * controllers/adminController.js
 *
 * Admin paneline özel CRUD + istatistik controller'ı.
 * - createListing / updateListing artık flat alanları elle yazmaz;
 *   specifications Map → flat kolon senkronizasyonu Listing.pre('save') hook'u tarafından yapılır.
 * - mapCategoryToPropertyType utils/listingUtils'ten gelir (tek kaynak).
 */

const Listing = require('../models/Listing');
const User = require('../models/User');
const { mapCategoryToPropertyType } = require('../utils/listingUtils');

// ── Yardımcı ─────────────────────────────────────────────────────────────────

/**
 * Güncelleme sırasında izin verilen top-level alan listesi.
 * Beyaz liste yaklaşımı — bilinmeyen alanlar DB'ye yazılmaz.
 */
const ALLOWED_UPDATE_FIELDS = [
  'title', 'description', 'price', 'currency', 'listing_type',
  'property_type', 'm2_brut', 'm2_net', 'open_area_m2', 'room_count',
  'floor_number', 'total_floors', 'building_age', 'heating_type',
  'bathroom_count', 'balcony', 'furnished', 'using_status',
  'in_site', 'credit_eligible', 'dues', 'facade', 'location', 'media',
  'features', 'status',
  // Yetkili danışman güncellemesi
  'admin_id',
];

/**
 * Benzersiz listing_no üretir (zaman damgası tabanlı, 10 haneli).
 * @returns {number}
 */
function generateListingNo() {
  return Number(`${Date.now().toString().slice(-9)}${Math.floor(Math.random() * 10)}`);
}

// ── Controller Fonksiyonları ──────────────────────────────────────────────────

/**
 * GET /api/admin/stats
 * Toplam kullanıcı ve ilan sayılarını paralel sorgular döndürür.
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
      data: { total_users: totalUsers, total_listings: totalListings, active_listings: activeListings },
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ success: false, message: 'İstatistikler alınamadı.' });
  }
}

/**
 * GET /api/admin/listings
 * Filtre + sayfalama destekli ilan listesi.
 */
async function listAllListings(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.listing_type) filter.listing_type = req.query.listing_type;
    if (req.query.city) {
      filter.$text = { $search: req.query.city.trim() };
    }
    if (req.query.search) {
      const searchTerm = req.query.search.trim();
      // Try parsing to Number for listing_no
      const asNum = Number(searchTerm);
      if (!isNaN(asNum) && searchTerm !== '') {
        filter.$or = [
          { listing_no: asNum },
          { title: { $regex: searchTerm, $options: 'i' } }
        ];
      } else {
        filter.title = { $regex: searchTerm, $options: 'i' };
      }
    }

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
 * POST /api/admin/listings
 * Yeni ilan oluşturur.
 *
 * Flat alanlar artık elle yazılmaz; specifications verisi pre('save') hook'u
 * ile otomatik olarak ilgili flat kolonlara aktarılır.
 */
async function createListing(req, res) {
  try {
    const { body } = req;

    const listingType = body.listingType ?? body.listing_type ?? 'SATILIK';
    const category = body.category ?? null;
    const subType = body.subType ?? null;
    const specs = body.specifications || {};

    const property_type =
      body.property_type ?? mapCategoryToPropertyType(category, subType);

    const listing = await Listing.create({
      listing_no: generateListingNo(),
      title: body.title || 'Başlıksız',
      description: body.description ?? '',
      price: body.price ?? 0,
      currency: body.currency || 'TRY',
      listing_type: listingType,
      listingType,
      property_type,
      category,
      subType,
      specifications: specs,   // ← pre-save hook flat kolonları buradan doldurur
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
      return res.status(409).json({
        success: false,
        message: 'listing_no zaten kullanılıyor. Tekrar deneyin.',
      });
    }
    res.status(500).json({ success: false, message: 'İlan oluşturulurken hata oluştu.' });
  }
}

/**
 * PUT /api/admin/listings/:id
 * Mevcut ilanı günceller.
 *
 * specifications gönderilirse pre('save') hook flat alanları günceller.
 * ALLOWED_UPDATE_FIELDS beyaz listesi dışındaki alanlar yoksayılır.
 */
async function updateListing(req, res) {
  try {
    const { id } = req.params;
    const { body } = req;

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'İlan bulunamadı.' });
    }

    // ── Kategori alanları ────────────────────────────────────────────────────
    const listingType = body.listingType ?? body.listing_type;
    if (listingType !== undefined) {
      listing.listing_type = listingType;
      listing.listingType = listingType;
    }
    if (body.category !== undefined) listing.category = body.category;
    if (body.subType !== undefined) listing.subType = body.subType;

    if (body.property_type !== undefined) {
      listing.property_type = body.property_type;
    } else if (body.category != null && body.subType != null) {
      listing.property_type = mapCategoryToPropertyType(body.category, body.subType);
    }

    const toPlainSpecs = (specValue) => {
      if (!specValue) return {};
      if (specValue instanceof Map) return Object.fromEntries(specValue);
      return { ...specValue };
    };

    // ── specifications (mevcut değerleri koruyarak birleştir) ───────────────
    if (body.specifications && typeof body.specifications === 'object') {
      const currentSpecs = toPlainSpecs(listing.specifications);
      listing.specifications = { ...currentSpecs, ...body.specifications };
    }

    // ── Beyaz listedeki top-level alanlar ────────────────────────────────────
    for (const key of ALLOWED_UPDATE_FIELDS) {
      if (body[key] === undefined) continue;

      if (key === 'location' && typeof body[key] === 'object') {
        listing.location = body[key];
      } else if (key === 'media' && typeof body[key] === 'object') {
        listing.media = {
          images: Array.isArray(body[key].images) ? body[key].images : listing.media?.images ?? [],
          videos: Array.isArray(body[key].videos) ? body[key].videos : listing.media?.videos ?? [],
        };
      } else if (key === 'features' && Array.isArray(body[key])) {
        listing.features = body[key];
      } else {
        listing[key] = body[key];
      }
    }

    await listing.save(); // pre-save hook burada çalışır

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

const ALLOWED_STATUS_VALUES = ['ACTIVE', 'PASSIVE', 'PENDING', 'SOLD'];

/**
 * PATCH /api/admin/listings/:id/status
 * Sadece durum güncellemesi (liste sayfası için; validateListing gerekmez).
 */
async function patchListingStatus(req, res) {
  try {
    const { id } = req.params;
    const raw = req.body?.status;
    const status =
      typeof raw === 'string' ? raw.trim().toUpperCase() : '';
    if (!ALLOWED_STATUS_VALUES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz durum.',
      });
    }

    const listing = await Listing.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    )
      .select('_id status listing_no title')
      .lean();

    if (!listing) {
      return res.status(404).json({ success: false, message: 'İlan bulunamadı.' });
    }

    res.json({ success: true, data: listing });
  } catch (err) {
    console.error('Patch listing status error:', err);
    res.status(500).json({ success: false, message: 'Durum güncellenemedi.' });
  }
}

/**
 * DELETE /api/admin/listings/:id
 * İlanı fiziksel olarak siler.
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

// ── Admin Kullanıcı Yönetimi ─────────────────────────────────────────────────

const bcrypt = require('bcryptjs');

/** Güvenli kullanıcı objesi — password_hash çıkarılır. */
function toSafeUser(user) {
  const u = user.toObject ? user.toObject() : { ...user };
  const { password_hash, ...rest } = u;
  return rest;
}

/**
 * POST /api/admin/admins
 * Yeni admin kullanıcısı oluşturur.
 * Body: { username, email, password, first_name, last_name, phone, profile_image? }
 */
async function createAdmin(req, res) {
  try {
    const { username, email, password, first_name, last_name, phone, profile_image } = req.body;

    if (!username?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı adı, e-posta ve şifre zorunludur.',
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Şifre en az 8 karakter olmalıdır.',
      });
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { username: username.trim() }],
    });
    if (existing) {
      const field = existing.email === email.toLowerCase().trim() ? 'E-posta' : 'Kullanıcı adı';
      return res.status(409).json({ success: false, message: `${field} zaten kullanılıyor.` });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const profileUrl =
      typeof profile_image === 'string' && profile_image.trim().length > 0
        ? profile_image.trim()
        : null;

    const admin = await User.create({
      username:   username.trim(),
      email:      email.toLowerCase().trim(),
      password_hash,
      first_name: first_name?.trim() || null,
      last_name:  last_name?.trim()  || null,
      phone:      phone?.trim()       || null,
      profile_image: profileUrl,
      role: 'ADMIN',
    });

    res.status(201).json({ success: true, data: toSafeUser(admin) });
  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({ success: false, message: 'Admin oluşturulurken hata oluştu.' });
  }
}

/**
 * GET /api/admin/admins
 * Tüm admin kullanıcılarını listeler.
 */
async function listAdmins(req, res) {
  try {
    const admins = await User.find({ role: 'ADMIN' })
      .select('-password_hash -favorites -favorite_consultants')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: admins });
  } catch (err) {
    console.error('List admins error:', err);
    res.status(500).json({ success: false, message: 'Adminler listelenirken hata oluştu.' });
  }
}

/**
 * DELETE /api/admin/admins/:id
 * Bir admin kullanıcısını siler. Kendi hesabını silemez.
 */
async function deleteAdmin(req, res) {
  try {
    const { id } = req.params;

    if (String(req.user._id) === String(id)) {
      return res.status(400).json({ success: false, message: 'Kendi hesabınızı silemezsiniz.' });
    }

    const admin = await User.findOne({ _id: id, role: 'ADMIN' });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin bulunamadı.' });
    }

    await User.deleteOne({ _id: id });
    res.json({ success: true, message: 'Admin silindi.' });
  } catch (err) {
    console.error('Delete admin error:', err);
    res.status(500).json({ success: false, message: 'Admin silinirken hata oluştu.' });
  }
}


module.exports = {
  getStats,
  listAllListings,
  createListing,
  updateListing,
  patchListingStatus,
  deleteListing,
  createAdmin,
  listAdmins,
  deleteAdmin,
};

