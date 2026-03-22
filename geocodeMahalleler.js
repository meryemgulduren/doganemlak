/**
 * samsun-geo.json'daki her mahallenin koordinatını Nominatim API ile günceller.
 * Bulunamayanlar ilçe merkez koordinatında kalır.
 * 
 * Rate limit: 1 istek/saniye (Nominatim politikası)
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'doganemlak', 'src', 'data', 'samsun-geo.json');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function geocode(district, neighborhood) {
  const q = encodeURIComponent(`${neighborhood}, ${district}, Samsun, Turkey`);
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${q}&limit=1&countrycodes=tr`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'DoganEmlakBot/1.0 (serha@dev)' }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.length > 0) {
      return [Number(data[0].lat), Number(data[0].lon)];
    }
  } catch(e) { /* ignore */ }
  return null;
}

async function run() {
  const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  
  let total = 0, found = 0, notFound = 0;
  const notFoundList = [];
  
  for (const dist of data.districts) {
    const distCoords = dist.coordinates;
    console.log(`\n📍 ${dist.name} (${dist.neighborhoods.length} mahalle)`);
    
    for (let i = 0; i < dist.neighborhoods.length; i++) {
      const mah = dist.neighborhoods[i];
      total++;
      
      // Zaten ilçe merkezinden farklı koordinatı varsa atla
      const sameAsDistrict = 
        JSON.stringify(mah.coordinates) === JSON.stringify(distCoords);
      
      if (!sameAsDistrict) {
        found++;
        continue; // Zaten özel koordinatı var
      }
      
      const coords = await geocode(dist.name, mah.name);
      await sleep(1100); // Nominatim rate limit
      
      if (coords) {
        mah.coordinates = coords;
        found++;
        process.stdout.write(`  ✅ ${mah.name} → [${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}]\n`);
      } else {
        notFound++;
        notFoundList.push(`${dist.name} / ${mah.name}`);
        process.stdout.write(`  ❌ ${mah.name} (ilçe merkezi kullanılıyor)\n`);
      }
      
      // Her 50 mahallede bir ara kaydet (çökme güvencesi)
      if (total % 50 === 0) {
        fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');
        console.log(`  💾 Ara kayıt (${total}/${data.districts.reduce((s,d) => s+d.neighborhoods.length, 0)})`);
      }
    }
  }
  
  // Son kayıt
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Bulunan: ${found}/${total}`);
  console.log(`❌ Bulunamayan: ${notFound}/${total}`);
  console.log(`📁 Kaydedildi: ${FILE}`);
  
  if (notFoundList.length > 0) {
    fs.writeFileSync(
      path.join(__dirname, 'geocode_not_found.txt'),
      notFoundList.join('\n'),
      'utf8'
    );
    console.log(`📝 Bulunamayanlar listesi: geocode_not_found.txt`);
  }
}

run().catch(console.error);
