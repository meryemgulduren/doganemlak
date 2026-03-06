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
    required: true,
  },
  m2_brut: {
    id: "m2_brut",
    label: "m² Brüt",
    type: "number",
    section: "price_area",
  },
  m2_net: {
    id: "m2_net",
    label: "m² Net",
    type: "number",
    section: "price_area",
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
  heating_type: {
    id: "heating_type",
    label: "Isıtma",
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
    type: "select",
    section: "property_details",
    options: ["Var", "Yok"],
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
};

// Kategori kombinasyonuna göre alan setleri.
// Şimdilik sadece KONUT.SATILIK.DAIRE detaylı tanımlı.
export const categoryLayouts = {
  "KONUT.SATILIK.DAIRE": {
    requiredFields: [
      "title",
      "description",
      "price",
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
  // Diğer kombinasyonlar için genel bir fallback
  default: {
    requiredFields: ["title", "description", "price", "city", "district"],
    optionalFields: ["m2_brut", "m2_net", "room_count", "building_age", "floor_number", "total_floors"],
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
  ENGELLI_UYGUNLUK: { id: "ENGELLI_UYGUNLUK", label: "Engelliye Uygunluk" },
};

export function resolveCategoryLayout(category, listingType, subType) {
  const key = [category, listingType, subType].filter(Boolean).join(".");
  if (categoryLayouts[key]) return { key, ...categoryLayouts[key] };
  return { key: "default", ...categoryLayouts.default };
}

