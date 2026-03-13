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

const FLUSH_INTERVAL_MS = 30_000; // 30 saniye

/** @type {Map<string, number>} listingId → birikmiş sayaç */
const buffer = new Map();

let intervalId = null;

/**
 * Bir ilan için görüntüleme sayacını 1 artırır.
 * @param {string} listingId - Mongoose ObjectId string
 */
function increment(listingId) {
  const key = String(listingId);
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
