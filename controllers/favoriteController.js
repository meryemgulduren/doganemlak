const User = require('../models/User');
const Listing = require('../models/Listing');

/**
 * GET /api/favorites
 * Giriş yapmış kullanıcının favori ilanları (authenticate gerekli).
 */
async function list(req, res) {
  try {
    const user = await User.findById(req.user._id)
      .populate('favorites', '-__v')
      .select('favorites')
      .lean();
    const favorites = user?.favorites || [];
    res.json({ success: true, data: favorites });
  } catch (err) {
    console.error('Favorites list error:', err);
    res.status(500).json({ success: false, message: 'Favoriler listelenirken hata oluştu.' });
  }
}

/**
 * POST /api/favorites/:listingId
 * Favorilere ekle (authenticate gerekli).
 */
async function add(req, res) {
  try {
    const { listingId } = req.params;
    const userId = req.user._id;

    const listing = await Listing.findById(listingId).select('_id status');
    if (!listing || listing.status !== 'ACTIVE') {
      return res.status(404).json({ success: false, message: 'İlan bulunamadı.' });
    }

    const user = await User.findById(userId).select('favorites');
    if (user.favorites.some((id) => id.toString() === listingId)) {
      return res.json({ success: true, message: 'Zaten favorilerde.', data: { added: false } });
    }

    await User.updateOne({ _id: userId }, { $addToSet: { favorites: listingId } });
    await Listing.updateOne({ _id: listingId }, { $inc: { favorite_count: 1 } });

    res.status(201).json({ success: true, message: 'Favorilere eklendi.', data: { added: true } });
  } catch (err) {
    console.error('Favorite add error:', err);
    res.status(500).json({ success: false, message: 'Favori eklenirken hata oluştu.' });
  }
}

/**
 * DELETE /api/favorites/:listingId
 * Favorilerden çıkar (authenticate gerekli).
 */
async function remove(req, res) {
  try {
    const { listingId } = req.params;
    const userId = req.user._id;

    const result = await User.updateOne(
      { _id: userId },
      { $pull: { favorites: listingId } }
    );
    if (result.modifiedCount > 0) {
      await Listing.updateOne({ _id: listingId }, { $inc: { favorite_count: -1 } });
    }

    res.json({ success: true, message: 'Favorilerden çıkarıldı.' });
  } catch (err) {
    console.error('Favorite remove error:', err);
    res.status(500).json({ success: false, message: 'Favori kaldırılırken hata oluştu.' });
  }
}

/**
 * POST /api/favorites/sync
 * Misafir favorilerini kullanıcı hesabına aktarır.
 * Body: { listingIds: [id1, id2, ...] }
 */
async function sync(req, res) {
  try {
    const { listingIds } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(listingIds) || listingIds.length === 0) {
      return res.json({ success: true, message: 'Senkronize edilecek ilan yok.' });
    }

    // Geçerli ve aktif olan ilanları filtrele
    const validListings = await Listing.find({
      _id: { $in: listingIds },
      status: 'ACTIVE',
    }).select('_id');

    const validIds = validListings.map((l) => l._id.toString());
    if (validIds.length === 0) {
      return res.json({ success: true, message: 'Geçerli ilan bulunamadı.' });
    }

    // Kullanıcının mevcut favorilerini al
    const user = await User.findById(userId).select('favorites');
    const existingIds = new Set(user.favorites.map((id) => id.toString()));

    // Sadece yeni olanları ekle
    const newIds = validIds.filter((id) => !existingIds.has(id));

    if (newIds.length > 0) {
      await User.updateOne(
        { _id: userId },
        { $addToSet: { favorites: { $each: newIds } } }
      );

      // İlanların favori sayılarını artır
      await Listing.updateMany(
        { _id: { $in: newIds } },
        { $inc: { favorite_count: 1 } }
      );
    }

    res.json({
      success: true,
      message: `${newIds.length} ilan senkronize edildi.`,
      data: { syncedCount: newIds.length },
    });
  } catch (err) {
    console.error('Favorite sync error:', err);
    res.status(500).json({ success: false, message: 'Senkronizasyon sırasında hata oluştu.' });
  }
}

module.exports = { list, add, remove, sync };
