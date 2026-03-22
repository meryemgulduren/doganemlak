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
    const pruneEmptyValues = (value) => {
      if (Array.isArray(value)) {
        return value
          .map(pruneEmptyValues)
          .filter((item) => item !== undefined);
      }
      if (value && typeof value === 'object') {
        const entries = Object.entries(value)
          .map(([k, v]) => [k, pruneEmptyValues(v)])
          .filter(([, v]) => v !== undefined);
        return Object.fromEntries(entries);
      }
      if (value === '' || value === null || value === undefined) {
        return undefined;
      }
      return value;
    };

    // Base alanlar için validasyon (coerce destekli)
    const parsedBase = await baseSchema.parseAsync(req.body);
    // Kritik: parsedBase bilinmeyen alanları strip eder (Zod default davranışı).
    // Orijinal body korunarak sadece parse edilmiş alanlar güncellenir;
    // admin_id gibi ekstra alanlar kaybolmaz.
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
      const cleanedSpecs = pruneEmptyValues(rawSpecs) || {};
      const parsedSpecs = await specConfig.schema.parseAsync(cleanedSpecs);

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

