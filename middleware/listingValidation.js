const { ZodError } = require('zod');
const { baseSchema, categorySchemas } = require('../config/formSchemas');

/**
 * İlan oluşturma/güncelleme istekleri için JSON tabanlı validasyon.
 * - Ortak alanlar baseSchema ile kontrol edilir.
 * - specifications alanı varsa ve kategori eşleşiyorsa,
 *   categorySchemas üzerinden ek zorunlu alanlar doğrulanır.
 *
 * Hata durumunda 400 ve alan bazlı mesajlar döner.
 */
async function validateListing(req, res, next) {
  try {
    // Base alanlar için validasyon (coerce destekli)
    const parsedBase = await baseSchema.parseAsync(req.body);
    req.body = { ...req.body, ...parsedBase };

    // Kategori path'ini hesapla
    const category = parsedBase.category || parsedBase.category === '' ? parsedBase.category : req.body.category;
    const listingType = parsedBase.listingType || req.body.listingType || parsedBase.listing_type || req.body.listing_type;
    const subType = parsedBase.subType || req.body.subType;
    const path = [category, listingType, subType].filter(Boolean).join('.');

    const specConfig = categorySchemas[path];
    const hasSpecifications = req.body && typeof req.body.specifications === 'object';

    if (specConfig && hasSpecifications) {
      const rawSpecs = req.body.specifications || {};
      const parsedSpecs = await specConfig.schema.parseAsync(rawSpecs);

      // Zorunlu specifications alanları gerçekten dolu mu?
      const missing = [];
      for (const key of specConfig.requiredSpecs) {
        const value = parsedSpecs[key];
        if (
          value === undefined ||
          value === null ||
          (typeof value === 'string' && value.trim() === '') ||
          (typeof value === 'number' && Number.isNaN(value))
        ) {
          missing.push(key);
        }
      }

      if (missing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Bazı zorunlu alanlar eksik.',
          errors: missing.map((field) => ({
            field: `specifications.${field}`,
            message: 'Bu alan zorunludur.',
          })),
        });
      }

      req.body.specifications = parsedSpecs;
    }

    return next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return res.status(400).json({
        success: false,
        message: 'Form verileri geçersiz.',
        errors,
      });
    }
    console.error('Listing validation error:', err);
    return res.status(500).json({ success: false, message: 'Validasyon sırasında bir hata oluştu.' });
  }
}

module.exports = {
  validateListing,
};

