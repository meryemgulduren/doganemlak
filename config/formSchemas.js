const { z } = require('zod');

/**
 * Tüm ilanlar için ortak alanlar.
 * Sayı alanlarında z.coerce.number ile string -> number dönüşümüne izin veriyoruz.
 */
const baseSchema = z.object({
  title: z.string().min(3, 'İlan başlığı en az 3 karakter olmalı.'),
  description: z
    .string()
    .min(10, 'Açıklama en az 10 karakter olmalı.')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  price: z.coerce
    .number({
      invalid_type_error: 'Fiyat sayı olmalıdır.',
    })
    .nonnegative('Fiyat negatif olamaz.'),
  currency: z.enum(['TRY', 'USD', 'EUR']).optional(),
  listing_type: z.enum(['SATILIK', 'KIRALIK'], {
    invalid_type_error: 'İlan tipi SATILIK veya KIRALIK olmalıdır.',
  }),
  property_type: z.enum(['DAIRE', 'VILLA', 'ARSA', 'IS_YERI', 'BINA'], {
    invalid_type_error: 'Emlak tipi geçerli değil.',
  }),
  category: z.string().optional().nullable(),
  listingType: z.string().optional().nullable(),
  subType: z.string().optional().nullable(),
  location: z
    .object({
      city: z.string().min(1, 'İl zorunludur.').optional(),
      district: z.string().min(1, 'İlçe zorunludur.').optional(),
      neighborhood: z.string().optional().nullable(),
    })
    .partial()
    .optional(),
  specifications: z.record(z.any()).optional(),
});

/**
 * Kategoriye özel specifications alanlarını tanımlar.
 * Şimdilik sadece KONUT.SATILIK.DAIRE senaryosu detaylı.
 */
const konutSatilikDaireSpecsSchema = z
  .object({
    m2_brut: z.coerce.number().positive().optional(),
    m2_net: z.coerce.number().positive().optional(),
    room_count: z.string().min(1).optional(),
    building_age: z.string().min(1).optional(),
    floor_number: z.coerce.number().int().optional(),
    total_floors: z.coerce.number().int().optional(),
    heating_type: z.string().min(1).optional(),
    bathroom_count: z.coerce.number().int().nonnegative().optional(),
    balcony: z.boolean().optional(),
    using_status: z.string().min(1).optional(),
    in_site: z.boolean().optional(),
    furnished: z.boolean().optional(),
    dues: z.coerce.number().nonnegative().optional(),
    title_deed_status: z.string().optional(),
    kitchen_type: z.string().min(1).optional(),
    elevator: z.string().min(1).optional(),
    parking: z.string().min(1).optional(),
    credit_eligible: z.boolean().optional(),
    registry_number: z.string().optional(),
    swap_option: z.string().min(1).optional(),
  })
  .partial();

const categorySchemas = {
  'KONUT.SATILIK.DAIRE': {
    schema: konutSatilikDaireSpecsSchema,
    requiredSpecs: [
      'm2_brut',
      'm2_net',
      'room_count',
      'building_age',
      'floor_number',
      'total_floors',
      'heating_type',
      'bathroom_count',
      'kitchen_type',
      'elevator',
      'parking',
      'swap_option',
    ],
  },
};

module.exports = {
  baseSchema,
  categorySchemas,
};

