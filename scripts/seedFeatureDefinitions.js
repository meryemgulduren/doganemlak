/**
 * feature_definitions koleksiyonuna başlangıç verilerini ekler.
 * Çalıştırma: node scripts/seedFeatureDefinitions.js
 * .env MONGODB_URI kullanılır; dotenv yüklemek için proje kökünden çalıştırın.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const FeatureDefinition = require('../models/FeatureDefinition');

const SEED_DATA = [
  { category: 'IC_OZELLIKLER', key: 'ADSL', label: 'ADSL' },
  { category: 'IC_OZELLIKLER', key: 'ALARM_YANGIN', label: 'Alarm (Yangın)' },
  { category: 'IC_OZELLIKLER', key: 'ALARM_HIRSIZ', label: 'Alarm (Hırsız)' },
  { category: 'IC_OZELLIKLER', key: 'ANKASTRE_FIRIN', label: 'Ankastre Fırın' },
  { category: 'IC_OZELLIKLER', key: 'BARBEKU', label: 'Barbekü' },
  { category: 'IC_OZELLIKLER', key: 'BOYALI', label: 'Boyalı' },
  { category: 'IC_OZELLIKLER', key: 'BULASIK_MAKINESI', label: 'Bulaşık Makinesi' },
  { category: 'IC_OZELLIKLER', key: 'BUZDOLABI', label: 'Buzdolabı' },
  { category: 'IC_OZELLIKLER', key: 'CELIK_KAPI', label: 'Çelik Kapı' },
  { category: 'IC_OZELLIKLER', key: 'DUSAKABIN', label: 'Duşakabin' },
  { category: 'IC_OZELLIKLER', key: 'FIBER_INTERNET', label: 'Fiber İnternet' },
  { category: 'IC_OZELLIKLER', key: 'HILTON_BANYO', label: 'Hilton Banyo' },
  { category: 'IC_OZELLIKLER', key: 'ISICAM', label: 'Isıcam' },
  { category: 'IC_OZELLIKLER', key: 'ISI_YALITIMI', label: 'Isı Yalıtımı' },
  { category: 'IC_OZELLIKLER', key: 'KARTONPIYER', label: 'Kartonpiyer' },
  { category: 'IC_OZELLIKLER', key: 'KLIMA', label: 'Klima' },
  { category: 'IC_OZELLIKLER', key: 'LAMINANT_ZEMIN', label: 'Laminant Zemin' },
  { category: 'IC_OZELLIKLER', key: 'PARKE_ZEMIN', label: 'Parke Zemin' },
  { category: 'IC_OZELLIKLER', key: 'SERAMIK_ZEMIN', label: 'Seramik Zemin' },
  { category: 'IC_OZELLIKLER', key: 'SPOT_AYDINLATMA', label: 'Spot Aydınlatma' },
  { category: 'DIS_OZELLIKLER', key: '24_SAAT_GUVENLIK', label: '24 Saat Güvenlik' },
  { category: 'DIS_OZELLIKLER', key: 'HAMAM', label: 'Hamam' },
  { category: 'DIS_OZELLIKLER', key: 'KABLO_TV', label: 'Kablo TV' },
  { category: 'DIS_OZELLIKLER', key: 'KAMERA_SISTEMI', label: 'Kamera Sistemi' },
  { category: 'DIS_OZELLIKLER', key: 'SES_YALITIMI', label: 'Ses Yalıtımı' },
  { category: 'DIS_OZELLIKLER', key: 'UYDU', label: 'Uydu' },
  { category: 'DIS_OZELLIKLER', key: 'YUZME_HAVUZU', label: 'Yüzme Havuzu (Açık)' },
  { category: 'MUHIT', key: 'ALISVERIS_MERKEZI', label: 'Alışveriş Merkezi' },
  { category: 'MUHIT', key: 'CAMİ', label: 'Cami' },
  { category: 'MUHIT', key: 'ECZANE', label: 'Eczane' },
  { category: 'MUHIT', key: 'HASTANE', label: 'Hastane' },
  { category: 'MUHIT', key: 'MARKET', label: 'Market' },
  { category: 'MUHIT', key: 'PARK', label: 'Park' },
  { category: 'ULASIM', key: 'ANAYOL', label: 'Anayol' },
  { category: 'ULASIM', key: 'CADDE', label: 'Cadde' },
  { category: 'ULASIM', key: 'DOLMUS', label: 'Dolmuş' },
  { category: 'ULASIM', key: 'OTOBUS_DURAGI', label: 'Otobüs Durağı' },
  { category: 'ULASIM', key: 'METRO', label: 'Metro' },
  { category: 'MANZARA', key: 'DENIZ', label: 'Deniz' },
  { category: 'MANZARA', key: 'DOGA', label: 'Doğa' },
  { category: 'MANZARA', key: 'HAVUZ', label: 'Havuz' },
  { category: 'MANZARA', key: 'SEHIR', label: 'Şehir' },
  { category: 'KONUT_TIPI', key: 'DUBLEKS', label: 'Dubleks' },
  { category: 'KONUT_TIPI', key: 'EN_UST_KAT', label: 'En Üst Kat' },
  { category: 'KONUT_TIPI', key: 'ARA_KAT', label: 'Ara Kat' },
  { category: 'ENGELLI_UYGUNLUK', key: 'ENGELSI_ASANSOR', label: 'Engelliye Uygun Asansör' },
  { category: 'ENGELLI_UYGUNLUK', key: 'ENGELSI_BANYO', label: 'Engelliye Uygun Banyo' },
  { category: 'ENGELLI_UYGUNLUK', key: 'RAMPA', label: 'Giriş / Rampa' },
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/doganemlak');
    console.log('MongoDB bağlandı.');

    for (const item of SEED_DATA) {
      await FeatureDefinition.updateOne(
        { key: item.key },
        { $set: { ...item, is_active: true } },
        { upsert: true }
      );
    }
    console.log(`${SEED_DATA.length} özellik tanımı seedlendi.`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Bağlantı kapatıldı.');
  }
}

run();
