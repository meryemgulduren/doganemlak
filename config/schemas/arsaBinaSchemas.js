/**
 * config/schemas/arsaBinaSchemas.js
 *
 * ARSA ve BİNA kategorilerine ait Zod validation şemaları.
 */

const { z } = require('zod');

const coercedPositiveNumber = z.coerce.number().positive().optional();
const coercedNonnegativeNum = z.coerce.number().nonnegative().optional();
const optionalString        = z.string().min(1).optional();
const optionalBool          = z.boolean().optional();

// ── ARSA şemaları ─────────────────────────────────────────────────────────────
const arsaSpecs = z.object({
  m2_brut:             coercedPositiveNumber,
  open_area_m2:        coercedNonnegativeNum,
  title_deed_status:   z.string().optional(),
  registry_number:     z.string().optional(),
  zoning_status:       z.string().optional(),    // İmar durumu
  floor_easement:      z.string().optional(),    // Kat irtifakı
  credit_eligible:     optionalBool,
  swap_option:         optionalString,
}).partial();

// ── BİNA şemaları ─────────────────────────────────────────────────────────────
const binaSpecs = z.object({
  m2_brut:             coercedPositiveNumber,
  m2_net:              coercedPositiveNumber,
  total_floors:        z.coerce.number().int().optional(),
  apartment_count:     z.coerce.number().int().nonnegative().optional(),
  building_age:        optionalString,
  heating_type:        optionalString,
  title_deed_status:   z.string().optional(),
  registry_number:     z.string().optional(),
  credit_eligible:     optionalBool,
  swap_option:         optionalString,
}).partial();

module.exports = {
  'ARSA.SATILIK': {
    schema: arsaSpecs,
    requiredSpecs: ['m2_brut', 'zoning_status', 'title_deed_status'],
  },
  'ARSA.KIRALIK': {
    schema: arsaSpecs,
    requiredSpecs: ['m2_brut'],
  },
  'BINA.SATILIK': {
    schema: binaSpecs,
    requiredSpecs: ['m2_brut', 'total_floors', 'building_age'],
  },
  'BINA.KIRALIK': {
    schema: binaSpecs,
    requiredSpecs: ['m2_brut', 'total_floors'],
  },
};
