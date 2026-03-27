const User = require('../models/User');

const CONSULTANT_PUBLIC_FIELDS =
  'username first_name last_name email phone profile_image role';

/**
 * GET /api/favorite-consultants
 * Giriş yapmış kullanıcının favori danışmanları (populate).
 */
async function list(req, res) {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'favorite_consultants',
        select: CONSULTANT_PUBLIC_FIELDS,
        match: { role: 'ADMIN' },
      })
      .select('favorite_consultants')
      .lean();

    const listRaw = user?.favorite_consultants || [];
    const data = listRaw.filter(Boolean);
    res.json({ success: true, data });
  } catch (err) {
    console.error('Favorite consultants list error:', err);
    res.status(500).json({ success: false, message: 'Favori danışmanlar listelenirken hata oluştu.' });
  }
}

/**
 * POST /api/favorite-consultants/:consultantId
 */
async function add(req, res) {
  try {
    const { consultantId } = req.params;
    const userId = req.user._id.toString();

    if (consultantId === userId) {
      return res.status(400).json({ success: false, message: 'Kendinizi favoriye ekleyemezsiniz.' });
    }

    const consultant = await User.findById(consultantId).select('role');
    if (!consultant || consultant.role !== 'ADMIN') {
      return res.status(404).json({ success: false, message: 'Danışman bulunamadı.' });
    }

    const user = await User.findById(userId).select('favorite_consultants');
    if (user.favorite_consultants.some((id) => id.toString() === consultantId)) {
      return res.json({ success: true, message: 'Zaten favorilerde.', data: { added: false } });
    }

    await User.updateOne({ _id: userId }, { $addToSet: { favorite_consultants: consultantId } });
    res.status(201).json({ success: true, message: 'Danışman favorilere eklendi.', data: { added: true } });
  } catch (err) {
    console.error('Favorite consultant add error:', err);
    res.status(500).json({ success: false, message: 'Favori eklenirken hata oluştu.' });
  }
}

/**
 * DELETE /api/favorite-consultants/:consultantId
 */
async function remove(req, res) {
  try {
    const { consultantId } = req.params;
    const userId = req.user._id;

    await User.updateOne(
      { _id: userId },
      { $pull: { favorite_consultants: consultantId } }
    );

    res.json({ success: true, message: 'Favorilerden çıkarıldı.' });
  } catch (err) {
    console.error('Favorite consultant remove error:', err);
    res.status(500).json({ success: false, message: 'Favori kaldırılırken hata oluştu.' });
  }
}

/**
 * POST /api/favorite-consultants/sync
 * Misafir favori danışmanlarını kullanıcı hesabına aktarır.
 * Body: { consultantIds: [id1, id2, ...] }
 */
async function sync(req, res) {
  try {
    const { consultantIds } = req.body;
    const userId = req.user._id;

    if (!Array.isArray(consultantIds) || consultantIds.length === 0) {
      return res.json({ success: true, message: 'Senkronize edilecek danışman yok.' });
    }

    // Geçerli ve ADMIN olan kullanıcıları filtrele
    const validConsultants = await User.find({
      _id: { $in: consultantIds },
      role: 'ADMIN',
    }).select('_id');

    const validIds = validConsultants.map((c) => c._id.toString());
    if (validIds.length === 0) {
      return res.json({ success: true, message: 'Geçerli danışman bulunamadı.' });
    }

    // Kullanıcının kendisini favoriye eklemesini engelle
    const filteredIds = validIds.filter((id) => id !== userId.toString());

    // Kullanıcının mevcut favorilerini al
    const user = await User.findById(userId).select('favorite_consultants');
    const existingIds = new Set(user.favorite_consultants.map((id) => id.toString()));

    // Sadece yeni olanları ekle
    const newIds = filteredIds.filter((id) => !existingIds.has(id));

    if (newIds.length > 0) {
      await User.updateOne(
        { _id: userId },
        { $addToSet: { favorite_consultants: { $each: newIds } } }
      );
    }

    res.json({
      success: true,
      message: `${newIds.length} danışman senkronize edildi.`,
      data: { syncedCount: newIds.length },
    });
  } catch (err) {
    console.error('Favorite consultant sync error:', err);
    res.status(500).json({ success: false, message: 'Senkronizasyon sırasında hata oluştu.' });
  }
}

module.exports = { list, add, remove, sync };
