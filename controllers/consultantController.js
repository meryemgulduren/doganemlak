const User = require('../models/User');

/**
 * GET /api/consultants
 * Herkese açık: sistemdeki tüm admin (danışman) kullanıcıları — iletişim için güvenli alanlar.
 */
async function listPublicConsultants(req, res) {
  try {
    const consultants = await User.find({ role: 'ADMIN' })
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
