const express = require('express');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const { createComplaint } = require('../controllers/complaintController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// ── Güvenli MIME whitelist ──────────────────────────────────────────────────
const ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff',
]);

// Magic bytes — dosyanın gerçekten resim olup olmadığını doğrular
const MAGIC_BYTES = [
  { mime: 'image/jpeg', bytes: [0xFF, 0xD8, 0xFF] },
  { mime: 'image/png',  bytes: [0x89, 0x50, 0x4E, 0x47] },
  { mime: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF header
  { mime: 'image/gif',  bytes: [0x47, 0x49, 0x46] },       // GIF
  { mime: 'image/bmp',  bytes: [0x42, 0x4D] },              // BM
];

function isRealImage(buffer) {
  if (!buffer || buffer.length < 4) return false;
  return MAGIC_BYTES.some(({ bytes }) =>
    bytes.every((b, i) => buffer[i] === b)
  );
}

// ── Multer yapılandırması ───────────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB — şikayet fotoğrafı için yeterli
    files: 3,                  // En fazla 3 dosya
  },
  fileFilter: (_req, file, cb) => {
    // 1) Sadece whitelist'teki MIME tiplerini kabul et (SVG engellendi)
    if (!ALLOWED_MIMES.has(file.mimetype)) {
      return cb(new Error('Sadece JPEG, PNG, WebP, GIF formatları kabul edilir.'), false);
    }
    // 2) Dosya adını sanitize et — path traversal engelle
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.tif'].includes(ext)) {
      return cb(new Error('Geçersiz dosya uzantısı.'), false);
    }
    cb(null, true);
  },
});

// ── Rate limiter — IP başına 5 talep/dakika ─────────────────────────────────
const ipSubmitMap = new Map();
const RATE_LIMIT_WINDOW = 60_000; // 1 dakika
const RATE_LIMIT_MAX = 5;

function complaintRateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const entry = ipSubmitMap.get(ip);

  if (entry) {
    // Pencere dışındaki kayıtları temizle
    if (now - entry.windowStart > RATE_LIMIT_WINDOW) {
      ipSubmitMap.set(ip, { windowStart: now, count: 1 });
    } else if (entry.count >= RATE_LIMIT_MAX) {
      return res.status(429).json({
        success: false,
        message: 'Çok fazla talep gönderdiniz. Lütfen biraz bekleyin.',
      });
    } else {
      entry.count++;
    }
  } else {
    ipSubmitMap.set(ip, { windowStart: now, count: 1 });
  }

  // Eski kayıtları temizle (bellek sızıntısı önleme)
  if (ipSubmitMap.size > 10_000) {
    for (const [key, val] of ipSubmitMap) {
      if (now - val.windowStart > RATE_LIMIT_WINDOW * 5) ipSubmitMap.delete(key);
    }
  }
  next();
}

// ── Dosya işleme middleware ──────────────────────────────────────────────────
async function processComplaintImages(req, _res, next) {
  try {
    if (!req.body) req.body = {};
    if (!req.files || req.files.length === 0) return next();

    const urls = [];
    for (const file of req.files.slice(0, 3)) {
      // Magic bytes kontrolü — MIME spoof engelle
      if (!isRealImage(file.buffer)) {
        continue; // Sahte dosyayı sessizce atla
      }

      // Sharp ile WebP'ye çevir — bu adım ayrıca kötü niyetli payload'ları temizler
      const filename = `complaint-${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
      const outPath = path.join('uploads', filename);
      await sharp(file.buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }) // Boyut sınırla
        .webp({ quality: 80 })
        .toFile(outPath);
      urls.push(`${req.protocol}://${req.get('host')}/uploads/${filename}`);
    }
    req.body.images = urls;
    next();
  } catch (err) {
    next(err);
  }
}

// req.body'nin undefined olmamasını garanti et
function ensureBody(req, _res, next) {
  if (!req.body) req.body = {};
  next();
}

// ── Multer hata yakala ──────────────────────────────────────────────────────
function handleMulterError(err, _req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'Dosya boyutu en fazla 5MB olabilir.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ success: false, message: 'En fazla 3 dosya yüklenebilir.' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
}

router.post('/',
  ensureBody,
  complaintRateLimit,
  optionalAuth,
  upload.array('images', 3),
  handleMulterError,
  processComplaintImages,
  createComplaint
);

module.exports = router;
