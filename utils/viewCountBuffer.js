/**
 * utils/viewCountBuffer.js
 *
 * İlan görüntülenme sayacı için in-memory buffer servisi.
 *
 * Neden buffer?
 *   Her sayfa açılışında DB'ye `updateOne` yazmak, yüksek trafikte gereksiz
 *   write yükü oluşturur. Bu servis sayımları bellekte biriktirip belirli
 *   aralıklarla tek bir `bulkWrite` ile DB'ye aktarır.
 *
 * Kullanım:
 *   const viewCountBuffer = require('./utils/viewCountBuffer');
 *   viewCountBuffer.increment(listingId);   // controller'dan
 *   viewCountBuffer.start();                // server.js'den başlatılır
 *   viewCountBuffer.flush();               // kapatmadan önce zorunlu
 */

const Listing = require('../models/Listing');

const FLUSH_INTERVAL_MS = 120_000; // 2 dakika
const IP_LOCK_MS = 60_000; // 1 dakika

/** @type {Map<string, number>} listingId → birikmiş sayaç */
const buffer = new Map();

/** @type {Map<string, number>} `${listingId}_${ip}` → son tıklanma zamanı (Date.now()) */
const ipCache = new Map();

let intervalId = null;

/**
 * Bir ilan için görüntüleme sayacını 1 artırır, IP bazında spama karşı korur.
 * @param {string} listingId - Mongoose ObjectId string
 * @param {string} ip - Kullanıcının IP adresi
 */
function increment(listingId, ip) {
  const key = String(listingId);
  const ipKey = `${key}_${ip || 'unknown'}`;
  
  const now = Date.now();
  const lastViewed = ipCache.get(ipKey);
  
  if (lastViewed && now - lastViewed < IP_LOCK_MS) {
    // 1 dakika içinde tekrar tekrar istek atanları sayma
    return;
  }
  
  // IP'yi kaydet/güncelle
  ipCache.set(ipKey, now);

  buffer.set(key, (buffer.get(key) ?? 0) + 1);
}

/**
 * Buffer'daki birikmiş sayımları MongoDB'ye toplu yazar ve buffer'ı temizler.
 * Server kapatılırken ve periyodik olarak çağrılır.
 */
async function flush() {
  if (buffer.size === 0) return;

  const entries = [...buffer.entries()];
  buffer.clear(); // önce temizle; flush sırasında gelen increment'lar kaybolmasın

  // Süresi geçmiş IP kayıtlarını temizle (memory leak önlemi)
  const now = Date.now();
  for (const [ipKey, timestamp] of ipCache.entries()) {
    if (now - timestamp >= IP_LOCK_MS) {
      ipCache.delete(ipKey);
    }
  }

  const operations = entries.map(([id, count]) => ({
    updateOne: {
      filter: { _id: id },
      update: { $inc: { view_count: count } },
    },
  }));

  try {
    await Listing.bulkWrite(operations, { ordered: false });
  } catch (err) {
    console.error('[viewCountBuffer] bulkWrite hatası:', err.message);
    // Hata durumunda sayımları buffer'a geri yükle (veri kaybını önler)
    for (const [id, count] of entries) {
      buffer.set(id, (buffer.get(id) ?? 0) + count);
    }
  }
}

/**
 * Periyodik flush interval'ini başlatır.
 * server.js'deki connectDB() tamamlandıktan sonra çağrılmalıdır.
 */
function start() {
  if (intervalId) return; // çift başlatmayı önle
  intervalId = setInterval(flush, FLUSH_INTERVAL_MS);
  // Node.js'in process'i bekletmemesi için unref
  if (intervalId.unref) intervalId.unref();
}

/**
 * Interval'i durdurur. Server kapatılırken kullanılır.
 */
function stop() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

module.exports = { increment, flush, start, stop };
