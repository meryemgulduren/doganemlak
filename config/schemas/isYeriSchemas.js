/**
 * config/schemas/isYeriSchemas.js
 *
 * İŞ YERİ kategorisine ait tüm Zod validation şemaları.
 */

const { z } = require('zod');

const coercedPositiveNumber = z.coerce.number().positive().optional();
const coercedNonnegativeNum = z.coerce.number().nonnegative().optional();
const coercedNonnegativeInt = z.coerce.number().int().nonnegative().optional();
const optionalString        = z.string().min(1).optional();
const optionalBool          = z.boolean().optional();

/**
 * İş yeri ilanlarında ortak spec alanları.
 */
const baseIsYeriSpecs = {
  m2_brut:             coercedPositiveNumber,
  m2_net:              coercedPositiveNumber,
  room_count:          optionalString,
  building_age:        optionalString,
  open_area_m2:        coercedNonnegativeNum,
  floor_number:        z.coerce.number().int().optional(),
  total_floors:        z.coerce.number().int().optional(),
  heating_type:        optionalString,
  bathroom_count:      coercedNonnegativeInt,
  using_status:        optionalString,
  in_site:             optionalBool,
  credit_eligible:     optionalBool,
  dues:                coercedNonnegativeNum,
  property_condition:  z.string().optional(),
  has_tenant:          z.string().optional(),
  swap_option:         optionalString,
  title_deed_status:   z.string().optional(),
  registry_number:     z.string().optional(),
  commercial_features: z.array(z.string()).optional(),
  bina_type:           optionalString,
  parking:             optionalString,
  elevator:            optionalString,
};

const makeIsYeriSchema = (extraFields = {}) =>
  z.object({ ...baseIsYeriSpecs, ...extraFields }).partial();

const DUKKAN_SATILIK_REQUIRED = [
  'm2_brut', 'using_status', 'heating_type', 'swap_option',
];
const DUKKAN_KIRALIK_REQUIRED = [
  'm2_brut', 'using_status', 'heating_type',
];
const OFIS_SATILIK_REQUIRED = [
  'm2_brut', 'm2_net', 'floor_number', 'heating_type', 'elevator', 'swap_option',
];
const OFIS_KIRALIK_REQUIRED = [
  'm2_brut', 'floor_number', 'heating_type',
];

module.exports = {
  'IS_YERI.SATILIK.DUKKAN_MAGAZA': {
    schema: makeIsYeriSchema(),
    requiredSpecs: DUKKAN_SATILIK_REQUIRED,
  },
  'IS_YERI.KIRALIK.DUKKAN_MAGAZA': {
    schema: makeIsYeriSchema(),
    requiredSpecs: DUKKAN_KIRALIK_REQUIRED,
  },
  'IS_YERI.SATILIK.OFIS': {
    schema: makeIsYeriSchema(),
    requiredSpecs: OFIS_SATILIK_REQUIRED,
  },
  'IS_YERI.KIRALIK.OFIS': {
    schema: makeIsYeriSchema(),
    requiredSpecs: OFIS_KIRALIK_REQUIRED,
  },
  'IS_YERI.SATILIK.DEPO_ANTREPO': {
    schema: makeIsYeriSchema({
      ceiling_height: z.coerce.number().positive().optional(),
      ground_survey: optionalString,
    }),
    requiredSpecs: ['m2_brut', 'using_status', 'swap_option'],
  },
  'IS_YERI.KIRALIK.DEPO_ANTREPO': {
    schema: makeIsYeriSchema({
      ceiling_height: z.coerce.number().positive().optional(),
      ground_survey: optionalString,
    }),
    requiredSpecs: ['m2_brut', 'using_status'],
  },
  'IS_YERI.SATILIK.KOMPLE_BINA': {
    schema: makeIsYeriSchema({
      ground_survey: optionalString,
      bina_type: optionalString,
    }),
    requiredSpecs: ['m2_brut', 'm2_net', 'total_floors'],
  },
  'IS_YERI.KIRALIK.KOMPLE_BINA': {
    schema: makeIsYeriSchema({
      ground_survey: optionalString,
      bina_type: optionalString,
    }),
    requiredSpecs: ['m2_brut', 'm2_net', 'total_floors'],
  },
};
