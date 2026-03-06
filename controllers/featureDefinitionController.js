const FeatureDefinition = require('../models/FeatureDefinition');

/**
 * GET /api/feature-definitions
 * Aktif özellik tanımlarını listeler (public). Kategoriye göre gruplu dönebilir.
 */
async function list(req, res) {
  try {
    const features = await FeatureDefinition.find({ is_active: true })
      .sort({ category: 1, label: 1 })
      .select('-__v')
      .lean();

    res.json({ success: true, data: features });
  } catch (err) {
    console.error('Feature definitions list error:', err);
    res.status(500).json({ success: false, message: 'Özellikler listelenirken hata oluştu.' });
  }
}

module.exports = { list };
