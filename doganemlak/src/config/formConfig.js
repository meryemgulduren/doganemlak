// JSON driven form yapılandırması.
// Buradaki tanımlar hem Konut > Satılık > Daire hem de
// ileride eklenecek diğer kategori kombinasyonları için kullanılabilir.

export const sections = [
  { id: "basic", label: "Temel Bilgiler", order: 1 },
  { id: "price_area", label: "Fiyat ve Metraj", order: 2 },
  { id: "property_details", label: "Gayrimenkul Detayları", order: 3 },
  { id: "extra", label: "Ek Bilgiler", order: 4 },
  { id: "address", label: "Adres Bilgileri", order: 5 },
  { id: "features", label: "Özellikler", order: 6 },
];

// Tekil alan tanımları
export const fieldDefinitions = {
  title: {
    id: "title",
    label: "İlan Başlığı",
    type: "text",
    section: "basic",
    required: true,
    placeholder: "Örn. Deniz manzaralı 3+1 daire",
  },
  description: {
    id: "description",
    label: "Açıklama",
    type: "textarea",
    section: "basic",
    required: true,
    rows: 5,
  },
  price: {
    id: "price",
    label: "Fiyat",
    type: "number",
    section: "price_area",
    required: false,
  },
  m2_brut: {
    id: "m2_brut",
    label: "m² Brüt",
    type: "number",
    section: "price_area",
  },
  bina_m2: {
    id: "bina_m2",
    label: "m²",
    type: "number",
    section: "price_area",
  },
  m2_net: {
    id: "m2_net",
    label: "m² Net",
    type: "number",
    section: "price_area",
  },
  open_area_m2: {
    id: "open_area_m2",
    label: "Açık Alan m²",
    type: "number",
    section: "price_area",
    placeholder: "Bahçe / açık alan m²",
  },
  arsa_m2: {
    id: "arsa_m2",
    label: "m²",
    type: "number",
    section: "price_area",
  },
  zoning_status: {
    id: "zoning_status",
    label: "İmar Durumu",
    type: "select",
    section: "price_area",
    options: [
      "Konut",
      "Ticari",
      "Sanayi",
      "Turizm",
      "Eğitim",
      "Sağlık",
      "Bağ & Bahçe",
      "Tarla",
      "İmarsız",
    ],
  },
  ada_no: {
    id: "ada_no",
    label: "Ada No",
    type: "text",
    section: "property_details",
  },
  parsel_no: {
    id: "parsel_no",
    label: "Parsel No",
    type: "text",
    section: "property_details",
  },
  pafta_no: {
    id: "pafta_no",
    label: "Pafta No",
    type: "text",
    section: "property_details",
  },
  kaks_emsal: {
    id: "kaks_emsal",
    label: "Kaks (Emsal)",
    type: "select",
    section: "property_details",
    options: ["0.10", "0.20", "0.30", "0.40", "0.50", "0.75", "1.00", "1.50", "2.00", "Serbest"],
  },
  gabari: {
    id: "gabari",
    label: "Gabari",
    type: "select",
    section: "property_details",
    options: ["Serbest", "6.50", "9.50", "12.50", "15.50", "18.50", "21.50", "24.50"],
  },
  arsa_credit_eligible: {
    id: "arsa_credit_eligible",
    label: "Krediye Uygun",
    type: "select",
    section: "extra",
    options: ["Evet", "Hayır"],
  },
  room_count: {
    id: "room_count",
    label: "Oda Sayısı",
    type: "select",
    section: "property_details",
    options: ["1+0", "1+1", "2+1", "3+1", "4+1", "4+2", "5+1", "5+2", "6+1", "6+2", "7+2", "8+2", "9+2", "9+ üstü"],
  },
  building_age: {
    id: "building_age",
    label: "Bina Yaşı",
    type: "select",
    section: "property_details",
    options: ["0", "1-5", "6-10", "11-15", "16-20", "21-25", "26-30", "31 ve üzeri"],
  },
  floor_number: {
    id: "floor_number",
    label: "Bulunduğu Kat",
    type: "number",
    section: "property_details",
  },
  total_floors: {
    id: "total_floors",
    label: "Kat Sayısı",
    type: "number",
    section: "property_details",
  },
  apartment_count: {
    id: "apartment_count",
    label: "Bir Kattaki Daire",
    type: "select",
    section: "property_details",
    options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
  },
  heating_type: {
    id: "heating_type",
    label: "Isıtma",
    type: "select",
    section: "property_details",
    options: ["Yok", "Soba", "Kat Kaloriferi", "Doğalgaz Sobası", "Merkezi", "Merkezi (Pay Ölçer)", "Kombi", "Yerden Isıtma"],
  },
  bina_heating_type: {
    id: "bina_heating_type",
    label: "Isıtma Tipi",
    type: "select",
    section: "property_details",
    options: ["Yok", "Soba", "Kat Kaloriferi", "Doğalgaz Sobası", "Merkezi", "Merkezi (Pay Ölçer)", "Kombi", "Yerden Isıtma"],
  },
  bathroom_count: {
    id: "bathroom_count",
    label: "Banyo Sayısı",
    type: "number",
    section: "property_details",
  },
  kitchen_type: {
    id: "kitchen_type",
    label: "Mutfak",
    type: "select",
    section: "property_details",
    options: ["Açık (Amerikan)", "Kapalı"],
  },
  elevator: {
    id: "elevator",
    label: "Asansör",
    type: "select",
    section: "property_details",
    options: ["Var", "Yok"],
  },
  parking: {
    id: "parking",
    label: "Otopark",
    type: "select",
    section: "property_details",
    options: ["Açık Otopark", "Kapalı Otopark", "Açık & Kapalı Otopark", "Yok"],
  },
  balcony: {
    id: "balcony",
    label: "Balkon",
    type: "checkbox",
    section: "extra",
  },
  furnished: {
    id: "furnished",
    label: "Eşyalı mı?",
    type: "checkbox",
    section: "extra",
  },
  in_site: {
    id: "in_site",
    label: "Site İçerisinde",
    type: "checkbox",
    section: "extra",
  },
  credit_eligible: {
    id: "credit_eligible",
    label: "Krediye Uygun",
    type: "checkbox",
    section: "extra",
  },
  using_status: {
    id: "using_status",
    label: "Kullanım Durumu",
    type: "select",
    section: "extra",
    options: ["Boş", "Kiracılı", "Mal Sahibi"],
  },
  dues: {
    id: "dues",
    label: "Aidat (TL)",
    type: "number",
    section: "extra",
  },
  registry_number: {
    id: "registry_number",
    label: "Taşınmaz Numarası",
    type: "text",
    section: "extra",
  },
  title_deed_status: {
    id: "title_deed_status",
    label: "Tapu Durumu",
    type: "select",
    section: "extra",
    options: ["Kat Mülkiyeti", "Kat İrtifakı", "Arsa Tapusu"],
  },
  swap_option: {
    id: "swap_option",
    label: "Takaslı",
    type: "select",
    section: "extra",
    options: ["Evet", "Hayır"],
  },
  property_condition: {
    id: "property_condition",
    label: "Durumu",
    type: "select",
    section: "extra",
    options: ["Sıfır", "İkinci El"],
  },
  has_tenant: {
    id: "has_tenant",
    label: "Kiralık",
    type: "select",
    section: "extra",
    options: ["Evet", "Hayır"],
  },
  bina_type: {
    id: "bina_type",
    label: "Bina Tipi",
    type: "select",
    section: "property_details",
    options: ["Apartman", "İş Hanı", "Müstakil", "Villa"],
  },
  ground_survey: {
    id: "ground_survey",
    label: "Zemin Etüdü",
    type: "select",
    section: "extra",
    options: ["Var", "Yok"],
  },
  city: {
    id: "city",
    label: "İl",
    type: "text",
    section: "address",
  },
  district: {
    id: "district",
    label: "İlçe",
    type: "text",
    section: "address",
  },
  neighborhood: {
    id: "neighborhood",
    label: "Mahalle",
    type: "text",
    section: "address",
  },
  address_details: {
    id: "address_details",
    label: "Açık Adres",
    type: "textarea",
    section: "address",
    rows: 3,
    placeholder: "Örn: Cumhuriyet Mah. Vatan Cad. No: 12",
  },
};

// Kategori kombinasyonuna göre alan setleri.
export const categoryLayouts = {
  "ARSA.SATILIK": {
    requiredFields: [
      "title",
      "description",
      "zoning_status",
      "arsa_m2",
      "title_deed_status",
      "swap_option",
    ],
    optionalFields: [
      "price",
      "ada_no",
      "parsel_no",
      "pafta_no",
      "kaks_emsal",
      "gabari",
      "arsa_credit_eligible",
      "registry_number",
    ],
  },
  "ARSA.KIRALIK": {
    requiredFields: [
      "title",
      "description",
      "zoning_status",
      "arsa_m2",
      "title_deed_status",
      "swap_option",
    ],
    optionalFields: [
      "price",
      "ada_no",
      "parsel_no",
      "pafta_no",
      "kaks_emsal",
      "gabari",
      "arsa_credit_eligible",
      "registry_number",
    ],
  },
  "BINA.SATILIK": {
    requiredFields: [
      "title",
      "description",
      "total_floors",
      "apartment_count",
      "bina_heating_type",
      "bina_m2",
      "building_age",
      "elevator",
      "parking",
      "title_deed_status",
      "swap_option",
      "city",
      "district",
    ],
    optionalFields: [
      "price",
      "credit_eligible",
      "registry_number",
      "neighborhood",
      "address_details",
    ],
  },
  "BINA.KIRALIK": {
    requiredFields: [
      "title",
      "description",
      "total_floors",
      "apartment_count",
      "bina_heating_type",
      "bina_m2",
      "building_age",
      "elevator",
      "parking",
      "title_deed_status",
      "swap_option",
      "city",
      "district",
    ],
    optionalFields: [
      "price",
      "credit_eligible",
      "registry_number",
      "neighborhood",
      "address_details",
    ],
  },
  "KONUT.SATILIK.DAIRE": {
    requiredFields: [
      "title",
      "description",
      "m2_brut",
      "m2_net",
      "room_count",
      "building_age",
      "floor_number",
      "total_floors",
      "heating_type",
      "bathroom_count",
      "kitchen_type",
      "elevator",
      "parking",
      "swap_option",
      "city",
      "district",
    ],
    optionalFields: [
      "price",
      "balcony",
      "furnished",
      "in_site",
      "credit_eligible",
      "using_status",
      "dues",
      "registry_number",
      "title_deed_status",
      "neighborhood",
    ],
  },
  // Müstakil Villa / Yazlık — asansör yok, açık alan m² var
  "KONUT.SATILIK.MUSTAKIL_VILLA": {
    requiredFields: [
      "title",
      "description",
      "m2_brut",
      "m2_net",
      "open_area_m2",
      "room_count",
      "building_age",
      "total_floors",
      "heating_type",
      "bathroom_count",
      "kitchen_type",
      "parking",
      "swap_option",
      "city",
      "district",
    ],
    optionalFields: [
      "price",
      "balcony",
      "furnished",
      "in_site",
      "credit_eligible",
      "using_status",
      "dues",
      "registry_number",
      "title_deed_status",
      "neighborhood",
    ],
  },
  "KONUT.KIRALIK.MUSTAKIL_VILLA": {
    requiredFields: [
      "title",
      "description",
      "m2_brut",
      "m2_net",
      "open_area_m2",
      "room_count",
      "building_age",
      "total_floors",
      "heating_type",
      "bathroom_count",
      "kitchen_type",
      "parking",
      "city",
      "district",
    ],
    optionalFields: [
      "price",
      "balcony",
      "furnished",
      "in_site",
      "credit_eligible",
      "using_status",
      "dues",
      "neighborhood",
    ],
  },
  // İş Yeri — Büro & Ofis (hem Satılık hem Kiralık bu layoutu kullanır)
  "IS_YERI.BURO_OFIS": {
    requiredFields: [
      "title",
      "description",
      "m2_net",
      "room_count",
      "building_age",
      "heating_type",
      "using_status",
      "property_condition",
      "has_tenant",
      "title_deed_status",
      "swap_option",
      "city",
      "district",
    ],
    optionalFields: [
      "price",
      "dues",
      "floor_number",
      "credit_eligible",
      "registry_number",
      "neighborhood",
      "address_details",
    ],
  },
  // İş Yeri — Dükkan & Mağaza (Büro Ofis gibi ama Kiralık alanı yok)
  "IS_YERI.DUKKAN_MAGAZA": {
    requiredFields: [
      "title",
      "description",
      "m2_net",
      "room_count",
      "building_age",
      "heating_type",
      "using_status",
      "property_condition",
      "title_deed_status",
      "swap_option",
      "city",
      "district",
    ],
    optionalFields: [
      "price",
      "dues",
      "floor_number",
      "credit_eligible",
      "registry_number",
      "neighborhood",
      "address_details",
    ],
  },
  // İş Yeri — Depo & Antrepo (Satılık/Kiralık ortak form)
  "IS_YERI.DEPO_ANTREPO": {
    requiredFields: [
      "title",
      "description",
      "m2_net",
      "room_count",
      "building_age",
      "heating_type",
      "using_status",
      "property_condition",
      "has_tenant",
      "title_deed_status",
      "swap_option",
      "city",
      "district",
    ],
    optionalFields: [
      "price",
      "dues",
      "floor_number",
      "credit_eligible",
      "registry_number",
      "ground_survey",
      "neighborhood",
      "address_details",
    ],
  },
  // İş Yeri — Komple Bina (satılık/kiralık ortak)
  "IS_YERI.KOMPLE_BINA": {
    requiredFields: [
      "title",
      "description",
      "m2_brut",
      "m2_net",
      "building_age",
      "heating_type",
      "total_floors",
      "bina_type",
      "using_status",
      "property_condition",
      "has_tenant",
      "title_deed_status",
      "swap_option",
      "city",
      "district",
    ],
    optionalFields: [
      "price",
      "ground_survey",
      "credit_eligible",
      "registry_number",
      "neighborhood",
      "address_details",
    ],
  },
  // Diğer kombinasyonlar için genel fallback
  default: {
    requiredFields: ["title", "description", "city", "district"],
    optionalFields: ["price", "m2_brut", "m2_net", "open_area_m2", "room_count", "building_age", "floor_number", "total_floors", "address_details"],
  },
};

// Özellik grupları, backend FeatureDefinition.category alanı ile eşleşir.
export const featureGroups = {
  IC_OZELLIKLER: { id: "IC_OZELLIKLER", label: "İç Özellikler" },
  DIS_OZELLIKLER: { id: "DIS_OZELLIKLER", label: "Dış Özellikler" },
  MUHIT: { id: "MUHIT", label: "Muhit" },
  ULASIM: { id: "ULASIM", label: "Ulaşım" },
  MANZARA: { id: "MANZARA", label: "Manzara" },
  KONUT_TIPI: { id: "KONUT_TIPI", label: "Konut Tipi" },
  ENGELLI_UYGUNLUK: { id: "ENGELLI_UYGUNLUK", label: "Engelliye ve Yaşlıya Uygun" },
};

export function resolveCategoryLayout(category, listingType, subType) {
  // Tam eşleşme varsa onu kullan
  const key = [category, listingType, subType].filter(Boolean).join(".");
  if (categoryLayouts[key]) return { key, ...categoryLayouts[key] };

  // KONUT kategorisi: Müstakil Villa → villa layoutu, geri kalan → Daire formu
  if (category === "KONUT") {
    if (subType === "MUSTAKIL_VILLA") {
      const villaKey = `KONUT.${listingType}.MUSTAKIL_VILLA`;
      if (categoryLayouts[villaKey]) return { key: villaKey, ...categoryLayouts[villaKey] };
      return { key: "KONUT.SATILIK.MUSTAKIL_VILLA", ...categoryLayouts["KONUT.SATILIK.MUSTAKIL_VILLA"] };
    }
    return { key: "KONUT.SATILIK.DAIRE", ...categoryLayouts["KONUT.SATILIK.DAIRE"] };
  }

  // İş Yeri kategorisi: subType'a göre layout seç
  if (category === "IS_YERI") {
    if (subType === "DUKKAN_MAGAZA") {
      return { key: "IS_YERI.DUKKAN_MAGAZA", ...categoryLayouts["IS_YERI.DUKKAN_MAGAZA"] };
    }
    if (subType === "DEPO_ANTREPO") {
      return { key: "IS_YERI.DEPO_ANTREPO", ...categoryLayouts["IS_YERI.DEPO_ANTREPO"] };
    }
    if (subType === "KOMPLE_BINA") {
      return { key: "IS_YERI.KOMPLE_BINA", ...categoryLayouts["IS_YERI.KOMPLE_BINA"] };
    }
    // BURO_OFIS ve diğerleri
    return { key: "IS_YERI.BURO_OFIS", ...categoryLayouts["IS_YERI.BURO_OFIS"] };
  }
  if (category === "ARSA") {
    const arsaKey = `ARSA.${listingType || "SATILIK"}`;
    if (categoryLayouts[arsaKey]) return { key: arsaKey, ...categoryLayouts[arsaKey] };
    return { key: "ARSA.SATILIK", ...categoryLayouts["ARSA.SATILIK"] };
  }
  if (category === "BINA") {
    const binaKey = `BINA.${listingType || "SATILIK"}`;
    if (categoryLayouts[binaKey]) return { key: binaKey, ...categoryLayouts[binaKey] };
    return { key: "BINA.SATILIK", ...categoryLayouts["BINA.SATILIK"] };
  }

  return { key: "default", ...categoryLayouts.default };
}

