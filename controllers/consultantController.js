const User = require('../models/User');

/**
 * GET /api/consultants
 * Herkese açık: sistemdeki tüm admin (danışman) kullanıcıları — iletişim için güvenli alanlar.
 */
async function listPublicConsultants(req, res) {
  try {
    const filter = { role: 'ADMIN' };

    if (req.query.ids) {
      const ids = req.query.ids.split(',').map(id => id.trim()).filter(Boolean);
      if (ids.length > 0) {
        filter._id = { $in: ids };
      }
    }

    const consultants = await User.find(filter)
      .select('first_name last_name username phone email profile_image')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: consultants });
  } catch (err) {
    console.error('Public consultants list error:', err);
    res.status(500).json({ success: false, message: 'Danışmanlar listelenirken hata oluştu.' });
  }
}

module.exports = { listPublicConsultants };
