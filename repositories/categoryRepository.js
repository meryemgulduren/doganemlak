const fs = require('fs');
const path = require('path');

const CATEGORIES_PATH = path.join(__dirname, '..', 'data', 'categories.json');

/**
 * Kategori ağacını JSON dosyasından okur. İleride DB'ye taşınabilir.
 */
function getCategoriesFromFile() {
  const raw = fs.readFileSync(CATEGORIES_PATH, 'utf8');
  return JSON.parse(raw);
}

module.exports = {
  getCategoriesFromFile,
};
