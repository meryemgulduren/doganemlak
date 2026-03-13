/**
 * config/schemas/konutSchemas.js
 *
 * KONUT kategorisine ait tüm Zod validation şemaları.
 * Her şema { schema, requiredSpecs } formatındadır:
 *  - schema: specifications object için Zod şeması
 *  - requiredSpecs: zorunlu alan anahtarları listesi
 */

const { z } = require('zod');

// ── Paylaşılan alan tanımları ─────────────────────────────────────────────────

const coercedPositiveNumber = z.coerce.number().positive().optional();
const coercedNonnegativeInt  = z.coerce.number().int().nonnegative().optional();
const coercedNonnegativeNum  = z.coerce.number().nonnegative().optional();
const optionalString         = z.string().min(1).optional();
const optionalBool           = z.boolean().optional();

/**
 * Konut ilanlarında sık kullanılan temel spec alanları.
 * Tüm konut şema variantları bu nesneyi genişletir.
 */
const baseKonutSpecs = {
  m2_brut:         coercedPositiveNumber,
  m2_net:          coercedPositiveNumber,
  room_count:      optionalString,
  building_age:    optionalString,
  floor_number:    z.coerce.number().int().optional(),
  total_floors:    z.coerce.number().int().optional(),
  heating_type:    optionalString,
  bathroom_count:  coercedNonnegativeInt,
  kitchen_type:    optionalString,
  elevator:        optionalString,
  parking:         optionalString,
  swap_option:     optionalString,
  balcony:         optionalBool,
  furnished:       optionalBool,
  using_status:    optionalString,
  in_site:         optionalBool,
  credit_eligible: optionalBool,
  dues:            coercedNonnegativeNum,
  open_area_m2:    coercedNonnegativeNum,
  property_condition: z.string().optional(),
  has_tenant:      z.string().optional(),
  title_deed_status: z.string().optional(),
  registry_number: z.string().optional(),
  commercial_features: z.array(z.string()).optional(),
};

// ── Zorunlu alanlar (ortak daire/rezidans için) ───────────────────────────────
const DAIRE_REQUIRED = [
  'm2_brut', 'm2_net', 'room_count', 'building_age',
  'floor_number', 'total_floors', 'heating_type',
  'bathroom_count', 'kitchen_type', 'elevator', 'parking', 'swap_option',
];

const VILLA_REQUIRED = [
  'm2_brut', 'm2_net', 'room_count', 'building_age',
  'heating_type', 'bathroom_count', 'swap_option',
];

const KIRALIK_REQUIRED = [
  'm2_brut', 'm2_net', 'room_count', 'floor_number', 'total_floors',
  'heating_type', 'bathroom_count',
];

// ── Şema oluşturucu yardımcısı ────────────────────────────────────────────────
const makeKonutSchema = (extraFields = {}) =>
  z.object({ ...baseKonutSpecs, ...extraFields }).partial();

// ── Export ────────────────────────────────────────────────────────────────────

module.exports = {
  'KONUT.SATILIK.DAIRE': {
    schema: makeKonutSchema(),
    requiredSpecs: DAIRE_REQUIRED,
  },
  'KONUT.KIRALIK.DAIRE': {
    schema: makeKonutSchema(),
    requiredSpecs: KIRALIK_REQUIRED,
  },
  'KONUT.SATILIK.REZIDANS': {
    schema: makeKonutSchema(),
    requiredSpecs: DAIRE_REQUIRED,
  },
  'KONUT.KIRALIK.REZIDANS': {
    schema: makeKonutSchema(),
    requiredSpecs: KIRALIK_REQUIRED,
  },
  'KONUT.SATILIK.MUSTAKIL_VILLA': {
    schema: makeKonutSchema({
      garden_m2: z.coerce.number().nonnegative().optional(),
      pool: optionalBool,
    }),
    requiredSpecs: VILLA_REQUIRED,
  },
  'KONUT.KIRALIK.MUSTAKIL_VILLA': {
    schema: makeKonutSchema({
      garden_m2: z.coerce.number().nonnegative().optional(),
      pool: optionalBool,
    }),
    requiredSpecs: ['m2_brut', 'room_count', 'heating_type', 'bathroom_count'],
  },
  'KONUT.SATILIK.YAZLIK': {
    schema: makeKonutSchema({ garden_m2: z.coerce.number().nonnegative().optional() }),
    requiredSpecs: ['m2_brut', 'm2_net', 'room_count', 'bathroom_count'],
  },
  'KONUT.KIRALIK.YAZLIK': {
    schema: makeKonutSchema({ garden_m2: z.coerce.number().nonnegative().optional() }),
    requiredSpecs: ['m2_brut', 'room_count', 'bathroom_count'],
  },
};
