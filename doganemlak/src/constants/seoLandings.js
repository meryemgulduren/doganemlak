/**
 * SEO landing — yalnızca Samsun ili.
 * URL'ler: /kiralik, /satilik (şehir segmenti yok; API'de il filtresi "Samsun").
 */
export const SEO_LANDING_BY_SLUG = {
  kiralik: {
    listing_type: "KIRALIK",
    /** API $text araması — il adı */
    apiCitySearch: "Samsun",
    title: "Samsun Kiralık İlanlar | Doğan Emlak",
    description:
      "Samsun kiralık daire, ev ve iş yeri ilanları. Doğan Emlak güvencesiyle güncel kiralık emlak fırsatlarını inceleyin.",
    h1: "Samsun Kiralık Emlak İlanları",
    intro:
      "Samsun ilinde kiralık konut ve ticari gayrimenkul arayanlar için güncel ilanlar. Fiyat, konum ve özelliklere göre listeyi inceleyebilirsiniz.",
  },
  satilik: {
    listing_type: "SATILIK",
    apiCitySearch: "Samsun",
    title: "Samsun Satılık İlanlar | Doğan Emlak",
    description:
      "Samsun satılık daire, villa, arsa ve iş yeri ilanları. Doğan Emlak ile satılık emlak seçeneklerini keşfedin.",
    h1: "Samsun Satılık Emlak İlanları",
    intro:
      "Samsun ilinde satılık daire, arsa ve iş yeri ilanları tek sayfada. İhtiyacınıza uygun ilanı bulmak için listeyi gezebilirsiniz.",
  },
};

/**
 * @param {string} slug — "kiralik" | "satilik"
 */
export function resolveSeoLanding(slug) {
  if (!slug) return null;
  const key = slug.toLowerCase();
  const row = SEO_LANDING_BY_SLUG[key];
  if (!row) return null;
  return {
    offerSlug: key,
    ...row,
  };
}
