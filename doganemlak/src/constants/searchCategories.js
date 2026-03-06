/**
 * Arama önerileri kategorileri - backend entegrasyonunda API'den gelecek.
 * subcategories varsa önce ana kategori seçilir, sonra alt liste açılır.
 */
export const searchCategories = [
  { id: "tum", label: "Tüm 'Emlak' İlanları", count: "848.001" },
  {
    id: "konut",
    label: "Konut",
    count: "848.001",
    subcategories: [
      { id: "tum-konut", label: "Tüm 'Konut' İlanları", count: "848.001" },
      {
        id: "satilik",
        label: "Satılık",
        count: "637.246",
        subcategories: [
          { id: "tum-satilik", label: "Tüm 'Satılık' İlanları", count: "637.246" },
          { id: "daire", label: "Daire", count: "412.500" },
          { id: "mustakil-ev", label: "Müstakil Ev", count: "98.200" },
          { id: "villa", label: "Villa", count: "76.400" },
          { id: "arsa", label: "Arsa", count: "50.146" },
        ],
      },
      {
        id: "kiralik",
        label: "Kiralık",
        count: "207.356",
        subcategories: [
          { id: "tum-kiralik", label: "Tüm 'Kiralık' İlanları", count: "207.356" },
          { id: "daire-kiralik", label: "Daire", count: "195.033" },
          { id: "rezidans", label: "Rezidans", count: "3.397" },
          { id: "mustakil-ev-kiralik", label: "Müstakil Ev", count: "2.316" },
          { id: "villa-kiralik", label: "Villa", count: "6.422" },
          { id: "ciftlik-evi", label: "Çiftlik Evi", count: "62" },
          { id: "kosk-konak", label: "Köşk & Konak", count: "37" },
          { id: "yali", label: "Yalı", count: "4" },
          { id: "yali-dairesi", label: "Yalı Dairesi", count: "58" },
        ],
      },
      {
        id: "turistik-gunluk",
        label: "Turistik Günlük Kiralık",
        count: "2.683",
        subcategories: [
          { id: "tum-turistik", label: "Tüm 'Turistik Günlük Kiralık' İlanları", count: "2.683" },
          { id: "daire-turistik", label: "Daire", count: "1.666" },
          { id: "rezidans-turistik", label: "Rezidans", count: "60" },
          { id: "mustakil-ev-turistik", label: "Müstakil Ev", count: "111" },
          { id: "villa-turistik", label: "Villa", count: "606" },
          { id: "devre-mulk-turistik", label: "Devre Mülk", count: "9" },
          { id: "apart-pansiyon", label: "Apart & Pansiyon", count: "232" },
        ],
      },
      {
        id: "devren-satilik",
        label: "Devren Satılık Konut",
        count: "719",
        subcategories: [
          { id: "tum-devren", label: "Tüm 'Devren Satılık Konut' İlanları", count: "719" },
          { id: "daire-devren", label: "Daire", count: "695" },
          { id: "villa-devren", label: "Villa", count: "23" },
        ],
      },
    ],
  },
  {
    id: "isyeri",
    label: "İş Yeri",
    count: "128.450",
    subcategories: [
      { id: "tum-isyeri", label: "Tüm 'İş Yeri' İlanları", count: "128.450" },
      { id: "ofis", label: "Ofis", count: "72.100" },
      { id: "dukkan-magaza", label: "Dükkan - Mağaza", count: "38.250" },
      { id: "depo", label: "Depo", count: "12.400" },
      { id: "buro", label: "Büro", count: "5.700" },
    ],
  },
  {
    id: "arsa",
    label: "Arsa",
    count: "317.853",
    subcategories: [
      { id: "tum-arsa", label: "Tüm 'Arsa' İlanları", count: "317.853" },
      { id: "kat-karsiligi", label: "Kat Karşılığı Satılık", count: "4.326" },
      { id: "arsa-satilik", label: "Satılık", count: "311.656" },
      { id: "arsa-kiralik", label: "Kiralık", count: "1.885" },
      { id: "ciftlik", label: "Çiftlik", count: "733" },
      { id: "depo-antrepo", label: "Depo & Antrepo", count: "1.059" },
      { id: "otopark-garaj", label: "Otopark & Garaj", count: "12" },
      { id: "sulama-gerecleri", label: "Sulama Gereçleri", count: "1.181" },
    ],
  },
  {
    id: "bina",
    label: "Bina",
    count: "10.962",
    subcategories: [
      { id: "tum-bina", label: "Tüm 'Bina' İlanları", count: "10.962" },
      { id: "bina-satilik", label: "Satılık", count: "10.299" },
      { id: "bina-kiralik", label: "Kiralık", count: "663" },
    ],
  },
  {
    id: "devre-mulk",
    label: "Devre Mülk",
    count: "8.920",
    subcategories: [
      { id: "tum-devre-mulk", label: "Tüm 'Devre Mülk' İlanları", count: "8.920" },
      { id: "devre-mulk-satilik", label: "Satılık", count: "8.257" },
      { id: "devre-mulk-kiralik", label: "Kiralık", count: "663" },
    ],
  },
  {
    id: "turistik-tesis",
    label: "Turistik Tesis",
    count: "3.150",
    subcategories: [
      { id: "tum-turistik-tesis", label: "Tüm 'Turistik Tesis' İlanları", count: "3.150" },
      { id: "turistik-tesis-satilik", label: "Satılık", count: "2.900" },
      { id: "turistik-tesis-kiralik", label: "Kiralık", count: "250" },
    ],
  },
];
