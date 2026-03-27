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
    const andClauses = [];

    // Support for multiple specific IDs (useful for Guest Favorites)
    if (req.query.ids) {
      const ids = req.query.ids.split(',').map(id => id.trim()).filter(Boolean);
      if (ids.length > 0) {
        filter._id = { $in: ids };
      }
    }

    // Basic fields
    const directFields = ['category', 'listing_type', 'subType', 'property_type', 'currency', 'using_status', 'property_condition', 'has_tenant', 'zoning_status', 'building_age', 'room_count', 'admin_id', 'kaks_emsal', 'gabari'];
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

    // Alt tip alias desteği: filtredeki değer ile DB'deki farklı kaydı birlikte eşleştir.
    if (req.query.subType) {
      const raw = String(req.query.subType).trim();
      const aliasMap = {
        DEPO: ['DEPO', 'DEPO_ANTREPO'],
        DEPO_ANTREPO: ['DEPO_ANTREPO', 'DEPO'],
        DUKKAN: ['DUKKAN', 'DUKKAN_MAGAZA'],
        DUKKAN_MAGAZA: ['DUKKAN_MAGAZA', 'DUKKAN'],
        OFIS: ['OFIS', 'BURO_OFIS'],
        BURO_OFIS: ['BURO_OFIS', 'OFIS'],
        RESIDENCE: ['RESIDENCE', 'REZIDANS'],
        REZIDANS: ['REZIDANS', 'RESIDENCE'],
      };
      if (aliasMap[raw]) {
        filter.subType = { $in: aliasMap[raw] };
      }
    }

    // Tapu / takas: hem düz kolonda hem specifications Map içinde tutulabiliyor; ikisini de eşleştir.
    if (req.query.title_deed_status) {
      const raw = String(req.query.title_deed_status).trim();
      const parts = raw.includes(',')
        ? raw.split(',').map((v) => v.trim()).filter(Boolean)
        : [raw];
      if (parts.length === 1) {
        andClauses.push({
          $or: [
            { title_deed_status: parts[0] },
            { 'specifications.title_deed_status': parts[0] },
          ],
        });
      } else if (parts.length > 1) {
        andClauses.push({
          $or: [
            { title_deed_status: { $in: parts } },
            { 'specifications.title_deed_status': { $in: parts } },
          ],
        });
      }
    }

    if (req.query.swap_option) {
      let v = String(req.query.swap_option).trim();
      if (v === 'true') v = 'Evet';
      if (v === 'false') v = 'Hayır';
      andClauses.push({
        $or: [{ swap_option: v }, { 'specifications.swap_option': v }],
      });
    }

    // Isıtma: düz kolon veya specifications (çoklu seçim virgülle)
    if (req.query.heating_type) {
      const raw = String(req.query.heating_type).trim();
      const parts = raw.includes(',')
        ? raw.split(',').map((v) => v.trim()).filter(Boolean)
        : [raw];
      if (parts.length === 1) {
        andClauses.push({
          $or: [
            { heating_type: parts[0] },
            { 'specifications.heating_type': parts[0] },
          ],
        });
      } else if (parts.length > 1) {
        andClauses.push({
          $or: [
            { heating_type: { $in: parts } },
            { 'specifications.heating_type': { $in: parts } },
          ],
        });
      }
    }

    if (req.query.apartment_count) {
      const raw = String(req.query.apartment_count).trim();
      const parts = raw.includes(',')
        ? raw.split(',').map((v) => v.trim()).filter(Boolean)
        : [raw];
      andClauses.push({
        'specifications.apartment_count': parts.length > 1 ? { $in: parts } : parts[0],
      });
    }

    if (req.query.ground_survey) {
      const raw = String(req.query.ground_survey).trim();
      const parts = raw.includes(',')
        ? raw.split(',').map((v) => v.trim()).filter(Boolean)
        : [raw];
      andClauses.push({
        $or: [
          { ground_survey: parts.length > 1 ? { $in: parts } : parts[0] },
          { 'specifications.ground_survey': parts.length > 1 ? { $in: parts } : parts[0] },
        ],
      });
    }

    if (req.query.bina_type) {
      const raw = String(req.query.bina_type).trim();
      const parts = raw.includes(',')
        ? raw.split(',').map((v) => v.trim()).filter(Boolean)
        : [raw];
      andClauses.push({
        $or: [
          { bina_type: parts.length > 1 ? { $in: parts } : parts[0] },
          { 'specifications.bina_type': parts.length > 1 ? { $in: parts } : parts[0] },
        ],
      });
    }

    // Daire filtresindeki bazı alanlar specifications altında tutuluyor.
    const specArrayFields = [
      { queryKey: 'kitchen_type', path: 'specifications.kitchen_type' },
      { queryKey: 'elevator', path: 'specifications.elevator' },
      { queryKey: 'parking', path: 'specifications.parking' },
    ];
    specArrayFields.forEach(({ queryKey, path }) => {
      if (!req.query[queryKey]) return;
      const values = String(req.query[queryKey])
        .split(',')
        .map(v => v.trim())
        .filter(Boolean);
      if (values.length > 0) {
        andClauses.push({ [path]: { $in: values } });
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

    // Arsa numerik metin alanları (ada/parsel) için min-max aralık filtresi
    const textNumericRangeFields = [
      { field: 'ada_no', min: 'min_ada_no', max: 'max_ada_no' },
      { field: 'parsel_no', min: 'min_parsel_no', max: 'max_parsel_no' },
    ];
    textNumericRangeFields.forEach(({ field, min, max }) => {
      if (!req.query[min] && !req.query[max]) return;
      const minN = req.query[min] !== undefined && req.query[min] !== '' ? Number(req.query[min]) : null;
      const maxN = req.query[max] !== undefined && req.query[max] !== '' ? Number(req.query[max]) : null;
      if ((minN != null && Number.isNaN(minN)) || (maxN != null && Number.isNaN(maxN))) return;

      const convertedField = {
        $convert: { input: `$${field}`, to: 'double', onError: null, onNull: null },
      };
      const exprParts = [{ $ne: [convertedField, null] }];
      if (minN != null) exprParts.push({ $gte: [convertedField, minN] });
      if (maxN != null) exprParts.push({ $lte: [convertedField, maxN] });
      andClauses.push({ $expr: { $and: exprParts } });
    });

    // Numeric multi-select alanları
    const numericMultiFields = ['floor_number', 'total_floors', 'bathroom_count'];
    numericMultiFields.forEach((field) => {
      if (!req.query[field]) return;
      const rawValues = String(req.query[field]).split(',').map(v => v.trim()).filter(Boolean);
      if (rawValues.length === 0) return;

      // "6 Üzeri" veya "20+" gibi değerleri aralık filtresine çevir
      const numericIn = [];
      rawValues.forEach((token) => {
        if (/^\d+\+$/.test(token)) {
          const minN = Number(token.replace('+', ''));
          if (!Number.isNaN(minN)) andClauses.push({ [field]: { $gte: minN } });
          return;
        }
        if (token.toLowerCase().includes('üzeri')) {
          const only = token.match(/\d+/);
          if (only) andClauses.push({ [field]: { $gte: Number(only[0]) } });
          return;
        }
        const n = Number(token);
        if (!Number.isNaN(n)) numericIn.push(n);
      });
      if (numericIn.length > 0) {
        andClauses.push({ [field]: { $in: numericIn } });
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

    const finalFilter = andClauses.length ? { ...filter, $and: andClauses } : filter;

    const [listings, total] = await Promise.all([
      Listing.find(finalFilter)
        .sort({ listing_date: -1 })
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .lean(),
      Listing.countDocuments(finalFilter),
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
