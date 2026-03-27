/**
 * controllers/analyticsController.js
 *
 * Admin paneli için gelişmiş raporlama controller'ı.
 * MongoDB aggregation pipeline kullanır; DB'ye ek yük bindirmemek için
 * tüm sorgular tek bir $facet aggregation içinde paralel çalışır.
 */

const Listing = require('../models/Listing');
const User    = require('../models/User');

const THIRTY_DAYS_AGO = () => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d;
};

/**
 * GET /api/admin/analytics
 *
 * Döndürülen rapor yapısı:
 * {
 *   overview:           { total, active, sold, passive, pending, totalUsers }
 *   byCategory:         [{ _id, count, avgPrice }]
 *   byConsultantFavorites:[{ _id, count }]
 *   byListingType:      [{ _id, count }]
 *   priceStats:         { min, max, avg }
 *   recentActivity:     { newListings30d, soldListings30d }
 * }
 */
async function getAnalyticsSummary(req, res) {
  try {
    const [aggregationResult, totalUsers, newListings30d, soldListings30d, byConsultantFavorites] =
      await Promise.all([
        Listing.aggregate([
          {
            $facet: {
              // ── Genel sayılar ────────────────────────────────────────────
              overview: [
                {
                  $group: {
                    _id: null,
                    total:   { $sum: 1 },
                    active:  { $sum: { $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0] } },
                    sold:    { $sum: { $cond: [{ $eq: ['$status', 'SOLD'] },   1, 0] } },
                    passive: { $sum: { $cond: [{ $eq: ['$status', 'PASSIVE'] }, 1, 0] } },
                    pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
                    totalViews: { $sum: '$view_count' },
                  },
                },
              ],
              // ── Kategori dağılımı ────────────────────────────────────────
              byCategory: [
                {
                  $group: {
                    _id:      '$category',
                    count:    { $sum: 1 },
                    avgPrice: { $avg: '$price' },
                  },
                },
                { $sort: { count: -1 } },
                { $limit: 10 },
              ],
              // ── Satılık / Kiralık dağılımı ───────────────────────────────
              byListingType: [
                {
                  $group: {
                    _id:   '$listing_type',
                    count: { $sum: 1 },
                  },
                },
              ],
              // ── Fiyat istatistikleri ─────────────────────────────────────
              priceStats: [
                { $match: { price: { $gt: 0 } } },
                {
                  $group: {
                    _id: null,
                    min: { $min: '$price' },
                    max: { $max: '$price' },
                    avg: { $avg: '$price' },
                  },
                },
              ],
            },
          },
        ]),

        User.countDocuments(),

        // Son 30 günde eklenen ilanlar
        Listing.countDocuments({ listing_date: { $gte: THIRTY_DAYS_AGO() } }),

        // Son 30 günde satılan ilanlar
        Listing.countDocuments({
          status: 'SOLD',
          updatedAt: { $gte: THIRTY_DAYS_AGO() },
        }),

        // Her ADMIN için: USER kayıtlarında favorite_consultants içinde bu danışmanın kaç kez geçtiğini say.
        // Not: $expr + $in bazı ObjectId / dizi kombinasyonlarında 0 dönebiliyor; unwind + $eq daha güvenilir.
        User.aggregate([
          { $match: { role: 'ADMIN' } },
          {
            $lookup: {
              from: 'users',
              let: { consultantId: '$_id' },
              pipeline: [
                { $match: { role: 'USER' } },
                { $unwind: { path: '$favorite_consultants', preserveNullAndEmptyArrays: false } },
                {
                  $match: {
                    $expr: {
                      $eq: [
                        { $toString: '$favorite_consultants' },
                        { $toString: '$$consultantId' },
                      ],
                    },
                  },
                },
                { $count: 'count' },
              ],
              as: 'favMeta',
            },
          },
          {
            $addFields: {
              count: { $ifNull: [{ $arrayElemAt: ['$favMeta.count', 0] }, 0] },
              fullName: {
                $trim: {
                  input: {
                    $concat: [
                      { $ifNull: ['$first_name', ''] },
                      ' ',
                      { $ifNull: ['$last_name', ''] },
                    ],
                  },
                },
              },
            },
          },
          {
            $project: {
              count: 1,
              _id: {
                $cond: [
                  { $gt: [{ $strLenCP: '$fullName' }, 0] },
                  '$fullName',
                  { $ifNull: ['$username', '—'] },
                ],
              },
            },
          },
          { $sort: { count: -1, _id: 1 } },
        ]),
      ]);

    const facets = aggregationResult[0] ?? {};
    const overview = facets.overview?.[0] ?? { total: 0, active: 0, sold: 0, passive: 0, pending: 0, totalViews: 0 };
    const priceStats = facets.priceStats?.[0] ?? { min: 0, max: 0, avg: 0 };

    res.json({
      success: true,
      data: {
        overview: { ...overview, totalUsers },
        byCategory:    facets.byCategory    ?? [],
        byConsultantFavorites: byConsultantFavorites ?? [],
        byListingType: facets.byListingType ?? [],
        priceStats: {
          min: Math.round(priceStats.min ?? 0),
          max: Math.round(priceStats.max ?? 0),
          avg: Math.round(priceStats.avg ?? 0),
        },
        recentActivity: { newListings30d, soldListings30d },
      },
    });
  } catch (err) {
    console.error('Analytics summary error:', err);
    res.status(500).json({ success: false, message: 'Analitik veriler alınamadı.' });
  }
}

module.exports = { getAnalyticsSummary };
