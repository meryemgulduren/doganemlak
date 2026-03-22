const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const { watermarkListingImage } = require('../utils/watermarkImage');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    const ext = (path.extname(file.originalname) || '.jpg').toLowerCase();
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpe?g|png|gif|webp)$/i.test(file.originalname) || file.mimetype?.startsWith('image/');
    if (allowed) cb(null, true);
    else cb(new Error('Sadece resim dosyaları (jpg, png, gif, webp) yüklenebilir.'));
  },
});

const uploadVideo = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max for video
  fileFilter: (req, file, cb) => {
    const allowed = /\.(mp4|avi|mkv|webm|mov)$/i.test(file.originalname) || file.mimetype?.startsWith('video/');
    if (allowed) cb(null, true);
    else cb(new Error('Sadece video dosyaları (mp4, avi, mkv, webm, mov) yüklenebilir.'));
  },
});

router.use(authenticate);
router.use(requireAdmin);

router.post('/image', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'Yükleme hatası.' });
    }
    next();
  });
}, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Dosya seçilmedi.' });
  }

  try {
    const originalPath = req.file.path;
    const webpFilename = req.file.filename.replace(/\.[^/.]+$/, "") + ".webp";
    const webpPath = path.join(req.file.destination, webpFilename);

    if (originalPath !== webpPath) {
      await sharp(originalPath)
        .webp({ quality: 85, effort: 4 }) // Yüksek kalite, iyi sıkıştırma
        .toFile(webpPath);
      
      fs.unlinkSync(originalPath); // Orijinal dosyayı sil
      
      req.file.filename = webpFilename;
      req.file.path = webpPath;
    } else {
      const tmpPath = originalPath + '.tmp.webp';
      await sharp(originalPath)
        .webp({ quality: 85, effort: 4 })
        .toFile(tmpPath);
      fs.unlinkSync(originalPath);
      fs.renameSync(tmpPath, originalPath);
    }
  } catch (err) {
    console.error('[webp_convert] Hata:', err.message || err);
    // Dönüşüm hatası olursa orijinal dosya ile devam etmeye çalışalım
  }

  try {
    await watermarkListingImage(req.file.path);
  } catch (err) {
    console.error('[watermark] Uygulanamadı:', err.message || err);
    // Orijinal (veya dönüştürülmüş webp) dosya korunur
  }

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const url = `${baseUrl}/uploads/${req.file.filename}`;
  res.json({ success: true, url });
});

router.post('/video', (req, res, next) => {
  uploadVideo.single('video')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'Dosya boyutu çok büyük. Maksimum 100MB yükleyebilirsiniz.' });
      }
      return res.status(400).json({ success: false, message: err.message || 'Yükleme hatası.' });
    }
    next();
  });
}, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Video dosyası seçilmedi.' });
  }
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const url = `${baseUrl}/uploads/${req.file.filename}`;
  res.json({ success: true, url });
});

module.exports = router;
