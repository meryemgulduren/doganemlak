require('dotenv').config();
const mongoose = require('mongoose');
const FeatureDefinition = require('../models/FeatureDefinition'); // Varsayalım ki models/FeatureDefinition.js var.
const connectDB = require('../config/db');

const seedData = [
  // İç Özellikler
  { category: "IC_OZELLIKLER", key: "ADSL", label: "ADSL" },
  { category: "IC_OZELLIKLER", key: "AHSAP_DOGRAMA", label: "Ahşap Doğrama" },
  { category: "IC_OZELLIKLER", key: "AKILLI_EV", label: "Akıllı Ev" },
  { category: "IC_OZELLIKLER", key: "ALARM_HIRSIZ", label: "Alarm (Hırsız)" },
  { category: "IC_OZELLIKLER", key: "ALARM_YANGIN", label: "Alarm (Yangın)" },
  { category: "IC_OZELLIKLER", key: "ALATURKA_TUVALET", label: "Alaturka Tuvalet" },
  { category: "IC_OZELLIKLER", key: "ALUMINYUM_DOGRAMA", label: "Alüminyum Doğrama" },
  { category: "IC_OZELLIKLER", key: "AMERIKAN_KAPI", label: "Amerikan Kapı" },
  { category: "IC_OZELLIKLER", key: "ANKASTRE_FIRIN", label: "Ankastre Fırın" },
  { category: "IC_OZELLIKLER", key: "BARBEKU", label: "Barbekü" },
  { category: "IC_OZELLIKLER", key: "BEYAZ_ESYA", label: "Beyaz Eşya" },
  { category: "IC_OZELLIKLER", key: "BOYALI", label: "Boyalı" },
  { category: "IC_OZELLIKLER", key: "BULASIK_MAKINESI", label: "Bulaşık Makinesi" },
  { category: "IC_OZELLIKLER", key: "BUZDOLABI", label: "Buzdolabı" },
  { category: "IC_OZELLIKLER", key: "CAMASIR_KURUTMA_MAKINESI", label: "Çamaşır Kurutma Makinesi" },
  { category: "IC_OZELLIKLER", key: "CAMASIR_MAKINESI", label: "Çamaşır Makinesi" },
  { category: "IC_OZELLIKLER", key: "CAMASIR_ODASI", label: "Çamaşır Odası" },
  { category: "IC_OZELLIKLER", key: "CELIK_KAPI", label: "Çelik Kapı" },
  { category: "IC_OZELLIKLER", key: "DUSAKABIN", label: "Duşakabin" },
  { category: "IC_OZELLIKLER", key: "DUVAR_KAGIDI", label: "Duvar Kağıdı" },
  { category: "IC_OZELLIKLER", key: "EBEVEYN_BANYOSU", label: "Ebeveyn Banyosu" },
  { category: "IC_OZELLIKLER", key: "FIRIN", label: "Fırın" },
  { category: "IC_OZELLIKLER", key: "FIBER_INTERNET", label: "Fiber İnternet" },
  { category: "IC_OZELLIKLER", key: "GIYINME_ODASI", label: "Giyinme Odası" },
  { category: "IC_OZELLIKLER", key: "GOMME_DOLAP", label: "Gömme Dolap" },
  { category: "IC_OZELLIKLER", key: "GORUNTULU_DIYAFON", label: "Görüntülü Diyafon" },
  { category: "IC_OZELLIKLER", key: "HILTON_BANYO", label: "Hilton Banyo" },
  { category: "IC_OZELLIKLER", key: "INTERCOM_SISTEMI", label: "Intercom Sistemi" },
  { category: "IC_OZELLIKLER", key: "ISICAM", label: "Isıcam" },
  { category: "IC_OZELLIKLER", key: "JAKUZI", label: "Jakuzi" },
  { category: "IC_OZELLIKLER", key: "KARTONPIYER", label: "Kartonpiyer" },
  { category: "IC_OZELLIKLER", key: "KILER", label: "Kiler" },
  { category: "IC_OZELLIKLER", key: "KLIMA", label: "Klima" },
  { category: "IC_OZELLIKLER", key: "KUVET", label: "Küvet" },
  { category: "IC_OZELLIKLER", key: "LAMINAT_ZEMIN", label: "Laminat Zemin" },
  { category: "IC_OZELLIKLER", key: "MARLEY", label: "Marley" },
  { category: "IC_OZELLIKLER", key: "MOBILYA", label: "Mobilya" },
  { category: "IC_OZELLIKLER", key: "MUTFAK_ANKASTRE", label: "Mutfak (Ankastre)" },
  { category: "IC_OZELLIKLER", key: "MUTFAK_LAMINAT", label: "Mutfak (Laminat)" },
  { category: "IC_OZELLIKLER", key: "MUTFAK_DOGALGAZI", label: "Mutfak Doğalgazı" },
  { category: "IC_OZELLIKLER", key: "PANJUR_JALUZI", label: "Panjur/Jaluzi" },
  { category: "IC_OZELLIKLER", key: "PARKE_ZEMIN", label: "Parke Zemin" },
  { category: "IC_OZELLIKLER", key: "PVC_DOGRAMA", label: "PVC Doğrama" },
  { category: "IC_OZELLIKLER", key: "SERAMIK_ZEMIN", label: "Seramik Zemin" },
  { category: "IC_OZELLIKLER", key: "SET_USTU_OCAK", label: "Set Üstü Ocak" },
  { category: "IC_OZELLIKLER", key: "SPOT_AYDINLATMA", label: "Spot Aydınlatma" },
  { category: "IC_OZELLIKLER", key: "SOFBEN", label: "Şofben" },
  { category: "IC_OZELLIKLER", key: "SOMINE", label: "Şömine" },
  { category: "IC_OZELLIKLER", key: "TERAS", label: "Teras" },
  { category: "IC_OZELLIKLER", key: "TERMOSIFON", label: "Termosifon" },
  { category: "IC_OZELLIKLER", key: "VESTIYER", label: "Vestiyer" },
  { category: "IC_OZELLIKLER", key: "YUZ_TANIMA_PARMAK_IZI", label: "Yüz Tanıma & Parmak İzi" },

  // Dış Özellikler
  { category: "DIS_OZELLIKLER", key: "ARAC_SARJ_ISTASYONU", label: "Araç Şarj İstasyonu" },
  { category: "DIS_OZELLIKLER", key: "YIRMIDORT_SAAT_GUVENLIK", label: "24 Saat Güvenlik" },
  { category: "DIS_OZELLIKLER", key: "APARTMAN_GOREVLISI", label: "Apartman Görevlisi" },
  { category: "DIS_OZELLIKLER", key: "BUHAR_ODASI", label: "Buhar Odası" },
  { category: "DIS_OZELLIKLER", key: "COCUK_OYUN_PARKI", label: "Çocuk Oyun Parkı" },
  { category: "DIS_OZELLIKLER", key: "HAMAM", label: "Hamam" },
  { category: "DIS_OZELLIKLER", key: "HIDROFOR", label: "Hidrofor" },
  { category: "DIS_OZELLIKLER", key: "ISI_YALITIMI", label: "Isı Yalıtımı" },
  { category: "DIS_OZELLIKLER", key: "JENERATOR", label: "Jeneratör" },
  { category: "DIS_OZELLIKLER", key: "KABLO_TV", label: "Kablo TV" },
  { category: "DIS_OZELLIKLER", key: "KAMERA_SISTEMI", label: "Kamera Sistemi" },
  { category: "DIS_OZELLIKLER", key: "KOPEK_PARKI", label: "Köpek Parkı" },
  { category: "DIS_OZELLIKLER", key: "KRES", label: "Kreş" },
  { category: "DIS_OZELLIKLER", key: "MUSTAKIL_HAVUZLU", label: "Müstakil Havuzlu" },
  { category: "DIS_OZELLIKLER", key: "SAUNA", label: "Sauna" },
  { category: "DIS_OZELLIKLER", key: "SES_YALITIMI", label: "Ses Yalıtımı" },
  { category: "DIS_OZELLIKLER", key: "SIDING", label: "Siding" },
  { category: "DIS_OZELLIKLER", key: "SPOR_ALANI", label: "Spor Alanı" },
  { category: "DIS_OZELLIKLER", key: "SU_DEPOSU", label: "Su Deposu" },
  { category: "DIS_OZELLIKLER", key: "TENIS_KORTU", label: "Tenis Kortu" },
  { category: "DIS_OZELLIKLER", key: "UYDU", label: "Uydu" },
  { category: "DIS_OZELLIKLER", key: "YANGIN_MERDIVENI", label: "Yangın Merdiveni" },
  { category: "DIS_OZELLIKLER", key: "YUZME_HAVUZU_ACIK", label: "Yüzme Havuzu (Açık)" },
  { category: "DIS_OZELLIKLER", key: "YUZME_HAVUZU_KAPALI", label: "Yüzme Havuzu (Kapalı)" },

  // Muhit
  { category: "MUHIT", key: "ALISVERIS_MERKEZI", label: "Alışveriş Merkezi" },
  { category: "MUHIT", key: "BELEDIYE", label: "Belediye" },
  { category: "MUHIT", key: "CAMI", label: "Cami" },
  { category: "MUHIT", key: "CEMEVI", label: "Cemevi" },
  { category: "MUHIT", key: "DENIZE_SIFIR", label: "Denize Sıfır" },
  { category: "MUHIT", key: "ECZANE", label: "Eczane" },
  { category: "MUHIT", key: "EGLENCE_MERKEZI", label: "Eğlence Merkezi" },
  { category: "MUHIT", key: "FUAR", label: "Fuar" },
  { category: "MUHIT", key: "GOLE_SIFIR", label: "Göle Sıfır" },
  { category: "MUHIT", key: "HASTANE", label: "Hastane" },
  { category: "MUHIT", key: "HAVRA", label: "Havra" },
  { category: "MUHIT", key: "ILKOKUL_ORTAOKUL", label: "İlkokul-Ortaokul" },
  { category: "MUHIT", key: "ITFAIYE", label: "İtfaiye" },
  { category: "MUHIT", key: "KILISE", label: "Kilise" },
  { category: "MUHIT", key: "LISE", label: "Lise" },
  { category: "MUHIT", key: "MARKET", label: "Market" },
  { category: "MUHIT", key: "PARK", label: "Park" },
  { category: "MUHIT", key: "PLAJ", label: "Plaj" },
  { category: "MUHIT", key: "POLIS_MERKEZI", label: "Polis Merkezi" },
  { category: "MUHIT", key: "SAGLIK_OCAGI", label: "Sağlık Ocağı" },
  { category: "MUHIT", key: "SEMT_PAZARI", label: "Semt Pazarı" },
  { category: "MUHIT", key: "SPOR_SALONU", label: "Spor Salonu" },
  { category: "MUHIT", key: "SEHIR_MERKEZI", label: "Şehir Merkezi" },
  { category: "MUHIT", key: "UNIVERSITE", label: "Üniversite" },

  // Ulaşım
  { category: "ULASIM", key: "ANAYOL", label: "Anayol" },
  { category: "ULASIM", key: "AVRASYA_TUNELI", label: "Avrasya Tüneli" },
  { category: "ULASIM", key: "BOGAZ_KOPRULERI", label: "Boğaz Köprüleri" },
  { category: "ULASIM", key: "CADDE", label: "Cadde" },
  { category: "ULASIM", key: "DENIZ_OTOBUSU", label: "Deniz Otobüsü" },
  { category: "ULASIM", key: "DOLMUS", label: "Dolmuş" },
  { category: "ULASIM", key: "E5", label: "E-5" },
  { category: "ULASIM", key: "HAVAALANI", label: "Havaalanı" },
  { category: "ULASIM", key: "ISKELE", label: "İskele" },
  { category: "ULASIM", key: "MARMARAY", label: "Marmaray" },
  { category: "ULASIM", key: "METRO", label: "Metro" },
  { category: "ULASIM", key: "METROBUS", label: "Metrobüs" },
  { category: "ULASIM", key: "MINIBUS", label: "Minibüs" },
  { category: "ULASIM", key: "OTOBUS_DURAGI", label: "Otobüs Durağı" },
  { category: "ULASIM", key: "SAHIL", label: "Sahil" },
  { category: "ULASIM", key: "TEM", label: "TEM" },
  { category: "ULASIM", key: "TRAMVAY", label: "Tramvay" },
  { category: "ULASIM", key: "TREN_ISTASYONU", label: "Tren İstasyonu" },

  // Manzara
  { category: "MANZARA", key: "BOGAZ", label: "Boğaz" },
  { category: "MANZARA", key: "DENIZ", label: "Deniz" },
  { category: "MANZARA", key: "DOGA", label: "Doğa" },
  { category: "MANZARA", key: "GOL", label: "Göl" },
  { category: "MANZARA", key: "HAVUZ", label: "Havuz" },
  { category: "MANZARA", key: "NEHIR", label: "Nehir" },
  { category: "MANZARA", key: "PARK_YESIL_ALAN", label: "Park & Yeşil Alan" },
  { category: "MANZARA", key: "SEHIR", label: "Şehir" },

  // Konut Tipi
  { category: "KONUT_TIPI", key: "DUBLEKS", label: "Dubleks" },
  { category: "KONUT_TIPI", key: "EN_UST_KAT", label: "En Üst Kat" },
  { category: "KONUT_TIPI", key: "ARA_KAT", label: "Ara Kat" },
  { category: "KONUT_TIPI", key: "ARA_KAT_DUBLEKS", label: "Ara Kat Dubleks" },
  { category: "KONUT_TIPI", key: "BAHCE_DUBLEKSI", label: "Bahçe Dubleksi" },
  { category: "KONUT_TIPI", key: "CATI_DUBLEKSI", label: "Çatı Dubleksi" },
  { category: "KONUT_TIPI", key: "TRIPLEKS", label: "Tripleks" },
  { category: "KONUT_TIPI", key: "FORLEKS", label: "Forleks" },
  { category: "KONUT_TIPI", key: "TERS_DUBLEKS", label: "Ters Dubleks" },

  // Engelliye ve Yaşlıya Uygun
  { category: "ENGELLI_UYGUNLUK", key: "ARAC_PARK_YERI", label: "Araç Park Yeri" },
  { category: "ENGELLI_UYGUNLUK", key: "ENGELLIYE_UYGUN_ASANSOR", label: "Engelliye Uygun Asansör" },
  { category: "ENGELLI_UYGUNLUK", key: "ENGELLIYE_UYGUN_BANYO", label: "Engelliye Uygun Banyo" },
  { category: "ENGELLI_UYGUNLUK", key: "ENGELLIYE_UYGUN_MUTFAK", label: "Engelliye Uygun Mutfak" },
  { category: "ENGELLI_UYGUNLUK", key: "ENGELLIYE_UYGUN_PARK", label: "Engelliye Uygun Park" },
  { category: "ENGELLI_UYGUNLUK", key: "GENIS_KORIDOR", label: "Geniş Koridor" },
  { category: "ENGELLI_UYGUNLUK", key: "GIRIS_RAMPA", label: "Giriş / Rampa" },
  { category: "ENGELLI_UYGUNLUK", key: "MERDIVEN", label: "Merdiven" },
  { category: "ENGELLI_UYGUNLUK", key: "ODA_KAPISI", label: "Oda Kapısı" },
  { category: "ENGELLI_UYGUNLUK", key: "PRIZ_ELEKTRIK_ANAHTARI", label: "Priz / Elektrik Anahtarı" },
  { category: "ENGELLI_UYGUNLUK", key: "TUTAMAK_KORKULUK", label: "Tutamak / Korkuluk" },
  { category: "ENGELLI_UYGUNLUK", key: "TUVALET", label: "Tuvalet" },
  { category: "ENGELLI_UYGUNLUK", key: "YUZME_HAVUZU", label: "Yüzme Havuzu" },
];

const runSeed = async () => {
  try {
    await connectDB();
    console.log("Veritabanına bağlanıldı. Seed işlemi başlıyor...");

    for (const item of seedData) {
      const existing = await FeatureDefinition.findOne({ key: item.key });
      if (existing) {
        existing.label = item.label;
        existing.category = item.category;
        existing.is_active = true;
        await existing.save();
      } else {
        await FeatureDefinition.create({
          category: item.category,
          key: item.key,
          label: item.label,
          is_active: true
        });
      }
    }

    console.log(`Başarıyla ${seedData.length} özellik tanımlandı/güncellendi.`);
    process.exit(0);
  } catch (error) {
    console.error("Seed hatası:", error);
    process.exit(1);
  }
};

runSeed();
