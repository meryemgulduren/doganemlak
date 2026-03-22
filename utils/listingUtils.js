/**
 * utils/listingUtils.js
 *
 * İlan modeline ait yardımcı sabitler ve saf fonksiyonlar.
 * Controller, model hook ve frontend'in tekrar eden mantığını tek kaynakta toplar.
 */

/**
 * specifications Map'indeki alan adlarını Listing şemasındaki flat kolon adlarına eşler.
 * pre('save') hook bu map üzerinden otomatik senkronizasyon yapar.
 *
 * @type {Record<string, string>}
 */
const SPEC_TO_FIELD_MAP = {
  m2_brut: 'm2_brut',
  m2_net: 'm2_net',
  open_area_m2: 'open_area_m2',
  room_count: 'room_count',
  floor_number: 'floor_number',
  total_floors: 'total_floors',
  building_age: 'building_age',
  heating_type: 'heating_type',
  bathroom_count: 'bathroom_count',
  balcony: 'balcony',
  furnished: 'furnished',
  using_status: 'using_status',
  in_site: 'in_site',
  credit_eligible: 'credit_eligible',
  dues: 'dues',
  property_condition: 'property_condition',
  has_tenant: 'has_tenant',
  ground_survey: 'ground_survey',
  commercial_features: 'commercial_features',
};

/**
 * Kategori + alt tip kombinasyonundan Mongoose enum'una karşılık gelen
 * property_type değerini döndürür.
 *
 * @param {string|null} category  - Ana kategori (örn. 'KONUT', 'IS_YERI', 'ARSA')
 * @param {string|null} subType   - Alt tip (örn. 'DAIRE', 'MUSTAKIL_VILLA')
 * @returns {'DAIRE'|'VILLA'|'ARSA'|'IS_YERI'|'BINA'}
 */
function mapCategoryToPropertyType(category, subType) {
  if (!category) return 'DAIRE';

  const directMap = {
    ARSA: 'ARSA',
    BINA: 'BINA',
    IS_YERI: 'IS_YERI',
  };
  if (directMap[category]) return directMap[category];

  if (category === 'KONUT') {
    const subTypeMap = {
      DAIRE: 'DAIRE',
      REZIDANS: 'DAIRE',
      MUSTAKIL_VILLA: 'VILLA',
      YAZLIK: 'VILLA',
    };
    return subTypeMap[subType] || 'DAIRE';
  }

  return 'DAIRE';
}

module.exports = { SPEC_TO_FIELD_MAP, mapCategoryToPropertyType };
