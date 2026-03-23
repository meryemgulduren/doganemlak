/**
 * İlan fotoğraflarına görüntünün tam ortasında yarı saydam logo (filigran) uygular.
 * Logo sırası: WATERMARK_LOGO_PATH → logo.png / logo.svg (src/assets) → assets/watermark-logo.png
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/** 0–1: düşük = daha silik / saydam (varsayılan ~0.26) */
const LOGO_OPACITY = Number(process.env.WATERMARK_OPACITY || 0.26);
/** Görüntü genişlik/yüksekliğine göre logo üst sınırı (0–1); daha büyük = daha geniş filigran */
const LOGO_MAX_FRACTION = Number(process.env.WATERMARK_MAX_FRACTION || 0.42);

function resolveLogoPath() {
  const envPath = process.env.WATERMARK_LOGO_PATH;
  if (envPath && fs.existsSync(envPath)) return envPath;

  const assetsDir = path.join(__dirname, '..', 'doganemlak', 'src', 'assets');
  const candidates = [
    path.join(assetsDir, 'logo.png'),
    path.join(assetsDir, 'logo.svg'),
    path.join(__dirname, '..', 'assets', 'watermark-logo.png'),
    path.join(__dirname, '..', 'assets', 'watermark-logo.svg'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/**
 * PNG buffer üzerinde tüm piksellerin alfa kanalını çarpar (saydamlık).
 */
async function multiplyPngAlpha(pngBuffer, factor) {
  const f = Math.max(0, Math.min(1, factor));
  const { data, info } = await sharp(pngBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 3; i < data.length; i += 4) {
    data[i] = Math.round(data[i] * f);
  }

  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
}

/**
 * @param {string} imagePath - Multer'ın kaydettiği mutlak veya cwd'ye göre yol (uploads/...)
 * @returns {Promise<boolean>} filigran uygulandı mı
 */
async function watermarkListingImage(imagePath) {
  const logoPath = resolveLogoPath();
  if (!logoPath) {
    console.warn('[watermark] Logo dosyası bulunamadı; filigran atlandı.');
    return false;
  }

  const ext = path.extname(imagePath).toLowerCase();
  if (ext === '.gif') {
    console.warn('[watermark] GIF desteklenmiyor, atlandı:', path.basename(imagePath));
    return false;
  }

  const absPath = path.isAbsolute(imagePath)
    ? imagePath
    : path.join(process.cwd(), imagePath);

  // Dosyayı belleğe oku — sharp'ın dosya handle'ı tutmasını önler (Windows EPERM fix)
  const imageBuffer = fs.readFileSync(absPath);

  const meta = await sharp(imageBuffer).metadata();
  const width = meta.width || 0;
  const height = meta.height || 0;
  if (!width || !height) return false;

  const frac = Math.max(0.15, Math.min(0.55, LOGO_MAX_FRACTION));
  const maxLogoW = Math.floor(width * frac);
  const maxLogoH = Math.floor(height * frac);

  const logoPng = await sharp(logoPath)
    .resize({
      width: maxLogoW,
      height: maxLogoH,
      fit: 'inside',
    })
    .ensureAlpha()
    .png()
    .toBuffer();

  const logoFaded = await multiplyPngAlpha(logoPng, LOGO_OPACITY);
  const lm = await sharp(logoFaded).metadata();
  const lw = lm.width || 0;
  const lh = lm.height || 0;
  if (!lw || !lh) return false;

  const left = Math.round((width - lw) / 2);
  const top = Math.round((height - lh) / 2);

  // Buffer üzerinde composite yap — dosyaya dokunmadığımız için kilit yok
  let pipeline = sharp(imageBuffer).composite([
    {
      input: logoFaded,
      left,
      top,
      blend: 'over',
    },
  ]);

  let outputBuffer;
  if (ext === '.png') {
    outputBuffer = await pipeline.png({ compressionLevel: 9 }).toBuffer();
  } else if (ext === '.webp') {
    outputBuffer = await pipeline.webp({ quality: 88 }).toBuffer();
  } else {
    outputBuffer = await pipeline.jpeg({ quality: 88, mozjpeg: true }).toBuffer();
  }

  // Sonucu doğrudan dosyaya yaz (temp dosya / rename gerekmez)
  fs.writeFileSync(absPath, outputBuffer);
  return true;
}

module.exports = { watermarkListingImage, resolveLogoPath };
