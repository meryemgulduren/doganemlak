const { getCategoriesFromFile } = require('../repositories/categoryRepository');

/**
 * GET /api/categories
 * İlan verme akışında kullanılacak kategori ağacını döner (mainCategories, listingTypes, subTypes).
 */
function getCategories(req, res) {
  try {
    const data = getCategoriesFromFile();
    res.json({ success: true, data });
  } catch (err) {
    console.error('Categories load error:', err);
    res.status(500).json({ success: false, message: 'Kategoriler yüklenemedi.' });
  }
}

module.exports = {
  getCategories,
};
