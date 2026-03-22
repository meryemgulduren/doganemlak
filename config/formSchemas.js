/**
 * config/formSchemas.js
 *
 * Listing validasyonu için Zod şemaları.
 *
 * Mimari:
 *  - baseSchema       → tüm kategorilerde zorunlu/ortak alanlar
 *  - categorySchemas  → kategori+listingType+subType yoluna göre
 *                       specifications validasyonu (config/schemas/ altında)
 *
 * Yeni kategori eklemek için sadece config/schemas/ altına dosya açıp
 * buraya import etmeniz yeterli; formSchemas.js'e dokunmanıza gerek yok.
 */

const { z } = require('zod');
const konutSchemas    = require('./schemas/konutSchemas');
const isYeriSchemas   = require('./schemas/isYeriSchemas');
const arsaBinaSchemas = require('./schemas/arsaBinaSchemas');

// ── Ortak base şeması ─────────────────────────────────────────────────────────

/**
 * Tüm ilanlar için ortak alanlar.
 * Sayı alanlarında z.coerce.number() ile string→number dönüşümüne izin verilir.
 */
const baseSchema = z.object({
  title: z.string().min(3, 'İlan başlığı en az 3 karakter olmalı.'),
  description: z.string().min(3, 'Açıklama en az 3 karakter olmalı.'),
  price: z.coerce.number({
    invalid_type_error: 'Fiyat sayı olmalıdır.',
  }).nonnegative('Fiyat negatif olamaz.').optional(),
  currency: z.enum(['TRY', 'USD', 'EUR']).optional(),
  listing_type: z.enum(['SATILIK', 'KIRALIK'], {
    invalid_type_error: 'İlan tipi SATILIK veya KIRALIK olmalıdır.',
  }),
  property_type: z.enum(['DAIRE', 'VILLA', 'ARSA', 'IS_YERI', 'BINA'], {
    invalid_type_error: 'Emlak tipi geçerli değil.',
  }).optional(),
  category:    z.string().optional().nullable(),
  listingType: z.string().optional().nullable(),
  subType:     z.string().optional().nullable(),
  // Opsiyonel — hangi admin bu ilanı yönetiyor (yetkili danışman)
  admin_id: z.string().optional().nullable(),
  location: z.object({
    city:            z.string().optional().nullable(),
    district:        z.string().optional().nullable(),
    neighborhood:    z.string().optional().nullable(),
    address_details: z.string().optional().nullable(),
    coordinates: z.object({
      lat: z.number().optional().nullable(),
      lng: z.number().optional().nullable(),
    }).optional().nullable(),
    map_selection_confirmed: z.boolean().optional(),
  }).partial().optional(),
  specifications: z.record(z.any()).optional(),
  facade: z.array(z.string()).optional(),
});

// ── Kategori şemalarını tek map'te birleştir ──────────────────────────────────

/**
 * Her anahtar "CATEGORY.LISTING_TYPE[.SUB_TYPE]" formatındadır.
 * Yeni kategori alt dosyaları buraya spread edilir — O(1) lookup.
 *
 * @type {Record<string, { schema: import('zod').ZodTypeAny, requiredSpecs: string[] }>}
 */
const categorySchemas = {
  ...konutSchemas,
  ...isYeriSchemas,
  ...arsaBinaSchemas,
};

module.exports = { baseSchema, categorySchemas };
