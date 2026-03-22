import { useState } from "react";
import { featureGroups } from "../../config/formConfig";

const PRIMARY = "#A66F2C";

// Büro & Ofis için sabit "Detay Bilgisi" seçenekleri
const BURO_OFIS_DETAIL_OPTIONS = [
  "ADSL",
  "Asansör",
  "Beyaz Eşya",
  "Çelik Kapı",
  "Mobilya",
  "Mutfak",
  "Parke Zemin",
  "WC",
  "Yangın Merdiveni",
];

// ─── Flat grid (İş Yeri / Büro-Ofis stili) ──────────────────────────────────
function FlatGrid({ selectedValues, onChange }) {
  const toggle = (label) => {
    const cur = selectedValues || [];
    onChange(cur.includes(label) ? cur.filter((x) => x !== label) : [...cur, label]);
  };

  const selectedCount = (selectedValues || []).filter((value) =>
    BURO_OFIS_DETAIL_OPTIONS.includes(value)
  ).length;

  return (
    <section className="rounded-xl border border-border bg-surface shadow-sm px-4 py-4 space-y-3 mb-4">
      <div className="bg-accent/30 rounded-lg border border-border">
        {/* Başlık */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-text-dark">
            Detay Bilgisi
            {selectedCount > 0 ? (
              <span className="ml-2 text-xs font-normal text-muted">({selectedCount} seçildi)</span>
            ) : (
              <span className="ml-2 text-xs font-normal text-muted">(seçim yapılmadı)</span>
            )}
          </h3>
          <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </div>

        {/* Checkbox grid */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-4">
            {BURO_OFIS_DETAIL_OPTIONS.map((label) => {
              const checked = selectedValues?.includes(label) || false;
              return (
                <label key={label} className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center"
                    style={checked ? { borderColor: PRIMARY, backgroundColor: PRIMARY } : { borderColor: "#D8D3CA", backgroundColor: "#FFFFFF" }}
                    onClick={() => toggle(label)}
                  >
                    {checked && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-text-dark leading-tight">{label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Accordion (diğer kategoriler) ───────────────────────────────────────────
function AccordionGroups({ featureDefinitions, selectedIds, onChange, facadeOptions, facadeValue, onFacadeChange }) {
  const [openGroups, setOpenGroups] = useState(() => new Set());

  const normalize = (value = "") =>
    String(value)
      .toLocaleLowerCase("tr-TR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ı/g, "i")
      .replace(/\blaminant\b/g, "laminat")
      .trim();

  const byCategory = featureDefinitions.reduce((acc, f) => {
    const cat = f.category || "OTHER";
    if (!acc[cat]) acc[cat] = [];
    const dedupeKey = normalize(f.label || f.key || f._id);
    const exists = acc[cat].some(
      (item) => normalize(item.label || item.key || item._id) === dedupeKey
    );
    if (!exists) acc[cat].push(f);
    return acc;
  }, {});

  const toggleGroup = (id) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleFacade = (opt) => {
    const cur = facadeValue || [];
    onFacadeChange(cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt]);
  };

  const toggleFeature = (id) => {
    const cur = selectedIds || [];
    onChange(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  };

  return (
    <section className="rounded-xl border border-border bg-surface shadow-sm px-5 py-4 space-y-4 mb-4">
      <header className="flex items-center gap-2">
        <span className="w-1.5 h-5 rounded-full bg-secondary flex-shrink-0" />
        <h3 className="text-base font-semibold text-text-dark">Özellikler</h3>
      </header>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {/* Cephe */}
        {facadeOptions && facadeOptions.length > 0 && (
          <div className="border border-border rounded-lg overflow-hidden bg-background">
            <button
              type="button"
              onClick={() => toggleGroup("CEPHE")}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-text-dark hover:bg-accent/30 transition-colors"
            >
              <span>
                Cephe{" "}
                {facadeValue?.length > 0 && (
                  <span className="text-[11px] text-secondary">({facadeValue.length} seçildi)</span>
                )}
              </span>
              <span className="text-[10px] text-text-dark/70">{openGroups.has("CEPHE") ? "▲" : "▼"}</span>
            </button>
            {openGroups.has("CEPHE") && (
              <div className="px-3 pb-2 pt-1 flex flex-wrap gap-2 bg-white">
                {facadeOptions.map((opt) => (
                  <label key={opt} className="inline-flex items-center gap-2 text-sm cursor-pointer hover:bg-accent/30 px-2 py-1 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={facadeValue?.includes(opt) || false}
                      onChange={() => toggleFacade(opt)}
                      className="rounded border-accent/60"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dinamik gruplar */}
        {Object.entries(byCategory).map(([cat, items]) => {
          const def = featureGroups[cat] || { label: cat };
          const open = openGroups.has(cat);
          const selCount = items.filter((f) => selectedIds?.includes(f._id)).length;
          return (
            <div key={cat} className="border border-border rounded-lg overflow-hidden bg-background">
              <button
                type="button"
                onClick={() => toggleGroup(cat)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-text-dark hover:bg-accent/30 transition-colors"
              >
                <span>
                  {def.label}{" "}
                  {selCount > 0 && <span className="text-[11px] text-secondary">({selCount} seçildi)</span>}
                </span>
                <span className="text-[10px] text-text-dark/70">{open ? "▲" : "▼"}</span>
              </button>
              {open && (
                <div className="px-3 pb-2 pt-1 flex flex-wrap gap-2 bg-white">
                  {items.map((f) => (
                    <label key={f._id} className="inline-flex items-center gap-2 text-sm cursor-pointer hover:bg-accent/30 px-2 py-1 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedIds?.includes(f._id) || false}
                        onChange={() => toggleFeature(f._id)}
                        className="rounded border-accent/60"
                      />
                      <span>{f.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// Dükkan & Mağaza özellik grupları (resimden birebir)
const DUKKAN_MAGAZA_GROUPS = [
  {
    id: "KULLANIM_AMACI",
    label: "Kullanım Amacı",
    items: [
      "Ayakkabıcı & Lostra", "Çay Ocağı", "Çiğ Köfteci", "Market",
      "Mefruşatçı & Perdeci", "Motosiklet Servis & Bakım", "Muayenehane", "Otomotiv",
      "Oyun Kafe", "Prova & Kayıt Stüdyosu", "Su Bayi", "Tamirhane",
      "Tekel Bayi", "Tüp Bayi",
    ],
  },
  {
    id: "GENEL_OZELLIKLER",
    label: "Genel Özellikler",
    items: [
      "Güvenlik Kamerası", "Jeneratör", "Su Deposu", "Yangın Alarmı",
      "Hırsız Alarmı", "Hidrofor", "Mutfak", "WC",
    ],
  },
  {
    id: "ALT_YAPI",
    label: "Alt Yapı",
    items: [
      "ADSL", "Wi-Fi", "Kablo TV", "Uydu",
      "Intercom", "Telefon Hattı", "Faks - Telefon Hattı", "Sanayi Elektriği",
    ],
  },
];

// Cephe seçenekleri (Dükkan & Mağaza için)
const DUKKAN_CEPHE = ["Kuzey", "Güney", "Doğu", "Batı"];
const DEPO_ANTREPO_CEPHE = ["Kuzey", "Güney", "Doğu", "Batı"];
const DEPO_ANTREPO_GROUPS = [
  {
    id: "GENEL_OZELLIKLER",
    label: "Genel Özellikler",
    items: [
      "Asansör", "Güvenlik Kamerası", "Jeneratör", "Su Deposu",
      "Yangın Merdiveni", "Yangın Alarmı", "Hırsız Alarmı", "Hidrofor",
      "Açık Otopark", "Kapalı Otopark", "Bahçe", "Mutfak", "WC",
    ],
  },
  {
    id: "ALT_YAPI",
    label: "Alt Yapı",
    items: [
      "ADSL", "Wi-Fi", "Kablo TV", "Uydu", "Intercom", "Telefon Hattı",
    ],
  },
];
const KOMPLE_BINA_GROUPS = [
  {
    id: "KULLANIM_AMACI",
    label: "Kullanım Amacı",
    items: [
      "Anaokulu", "Atölye", "Banka", "Büro & Ofis",
      "Cafe & Bar", "Dershane & Kurs", "İmalathane", "Kuaför & Güzellik Merkezi",
      "Muayenehane", "Pastane & Fırın", "Poliklinik", "Restoran & Lokanta",
      "Sağlık Merkezi & Hastane", "Sinema & Konferans Salonu", "Spor Tesisi", "Yurt",
    ],
  },
  {
    id: "BINA_OZELLIKLERI",
    label: "Bina Özellikleri",
    items: [
      "Açık Otopark", "Asansör", "Güvenlik Kamerası", "Helikopter Sahası",
      "Hırsız Alarmı", "Hidrofor", "Jeneratör", "Kapalı Otopark",
      "Su Deposu", "Su Yalıtımı", "Yangın Alarmı", "Yangın Merdiveni",
    ],
  },
  {
    id: "DIS_CEPHE_OZELLIKLERI",
    label: "Dış Cephe Özellikleri",
    items: ["Ahşap Kaplama", "BTB Kaplama", "Cam Giydirme", "Siding Kaplama", "Taş Kaplama"],
  },
  {
    id: "MANZARA",
    label: "Manzara",
    items: ["Deniz", "Doğa", "Şehir"],
  },
  {
    id: "ALT_YAPI",
    label: "Alt Yapı",
    items: ["ADSL", "Intercom", "Kablo TV", "Telefon Hattı", "Uydu", "Wi-Fi"],
  },
  {
    id: "YAKINLIK",
    label: "Yakınlık",
    items: ["Cami", "Hastane", "Havaalanı", "Kilise", "Market", "Restoran", "Sağlık Ocağı", "Toplu Taşıma", "Veteriner"],
  },
];
const KOMPLE_BINA_CEPHE = ["Batı", "Doğu", "Güney", "Kuzey"];
const ARSA_GROUPS = [
  {
    id: "ALT_YAPI",
    label: "Altyapı",
    items: [
      "Elektrik", "Sanayi Elektriği", "Su", "Telefon",
      "Doğalgaz", "Kanalizasyon", "Arıtma", "Sondaj & Kuyu",
      "Zemin Etüdü", "Yolu Açılmış", "Yolu Açılmamış", "Yolu Yok",
    ],
  },
  {
    id: "KONUM",
    label: "Konum",
    items: ["Ana Yola Yakın", "Denize Sıfır", "Denize Yakın", "Havaalanına Yakın", "Toplu Ulaşıma Yakın"],
  },
  {
    id: "GENEL_OZELLIKLER",
    label: "Genel Özellikler",
    items: ["İfrazlı", "Parselli", "Projeli", "Köşe Parsel"],
  },
  {
    id: "MANZARA",
    label: "Manzara",
    items: ["Şehir", "Deniz", "Doğa", "Boğaz", "Göl"],
  },
];
const BINA_DETAIL_OPTIONS = [
  "Bahçe",
  "Boğaz Manzarası",
  "Deniz Manzarası",
  "Güvenlik",
  "Hidrofor",
  "Jeneratör",
  "Kablo TV - Uydu",
  "Kapıcı",
  "Site İçerisinde",
  "Yangın Merdiveni",
];

function BinaFeatures({ binaFeatures, onBinaFeaturesChange }) {
  const toggle = (label) => {
    const cur = binaFeatures || [];
    onBinaFeaturesChange(
      cur.includes(label) ? cur.filter((x) => x !== label) : [...cur, label]
    );
  };

  const selectedCount = (binaFeatures || []).filter((value) =>
    BINA_DETAIL_OPTIONS.includes(value)
  ).length;

  return (
    <section className="rounded-xl border border-border bg-surface shadow-sm px-4 py-4 space-y-3 mb-4">
      <div className="bg-accent/30 rounded-lg border border-border">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-text-dark">
            Detay Bilgisi
            {selectedCount > 0 ? (
              <span className="ml-2 text-xs font-normal text-muted">({selectedCount} seçildi)</span>
            ) : (
              <span className="ml-2 text-xs font-normal text-muted">(seçim yapılmadı)</span>
            )}
          </h3>
          <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </div>
        <div className="px-6 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-4">
            {BINA_DETAIL_OPTIONS.map((label) => {
              const checked = binaFeatures?.includes(label) || false;
              return (
                <label key={label} className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center"
                    style={checked ? { borderColor: PRIMARY, backgroundColor: PRIMARY } : { borderColor: "#D8D3CA", backgroundColor: "#FFFFFF" }}
                    onClick={() => toggle(label)}
                  >
                    {checked && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-text-dark leading-tight">{label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function DukkanMagazaFeatures({ commercialFeatures, onCommercialFeaturesChange, facadeValue, onFacadeChange }) {
  const [openGroups, setOpenGroups] = useState(() => new Set(["KULLANIM_AMACI"]));

  const cur = commercialFeatures || [];

  const toggleGroup = (id) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleItem = (label) => {
    onCommercialFeaturesChange(
      cur.includes(label) ? cur.filter((x) => x !== label) : [...cur, label]
    );
  };

  const toggleFacade = (opt) => {
    const f = facadeValue || [];
    onFacadeChange(f.includes(opt) ? f.filter((x) => x !== opt) : [...f, opt]);
  };

  const renderGroup = ({ id, label, items }) => {
    const open = openGroups.has(id);
    const selCount = items.filter((item) => cur.includes(item)).length;

    return (
      <div key={id} className="border border-border rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleGroup(id)}
          className="w-full flex items-center justify-between px-4 py-3 bg-accent/20 hover:bg-accent/40 transition-colors"
        >
          <span className="text-sm font-semibold text-text-dark">
            {label}
            {selCount > 0 ? (
              <span className="ml-2 text-xs font-normal text-muted">({selCount} seçildi)</span>
            ) : (
              <span className="ml-2 text-xs font-normal text-muted">(seçim yapılmadı)</span>
            )}
          </span>
          <svg className={`w-4 h-4 text-muted transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <div className="px-6 py-4 bg-white">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-3">
              {items.map((item) => {
                const checked = cur.includes(item);
                return (
                  <label key={item} className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                      className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center"
                      style={checked ? { borderColor: PRIMARY, backgroundColor: PRIMARY } : { borderColor: "#D8D3CA", backgroundColor: "#FFFFFF" }}
                      onClick={() => toggleItem(item)}
                    >
                      {checked && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-text-dark">{item}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const cepheOpen = openGroups.has("CEPHE");
  const cepheSelCount = (facadeValue || []).length;

  return (
    <section className="rounded-xl border border-border bg-surface shadow-sm px-4 py-4 space-y-2 mb-4">
      {DUKKAN_MAGAZA_GROUPS.map(renderGroup)}

      {/* Cephe */}
      <div className="border border-border rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleGroup("CEPHE")}
          className="w-full flex items-center justify-between px-4 py-3 bg-accent/20 hover:bg-accent/40 transition-colors"
        >
          <span className="text-sm font-semibold text-text-dark">
            Cephe
            {cepheSelCount > 0 ? (
              <span className="ml-2 text-xs font-normal text-muted">({cepheSelCount} seçildi)</span>
            ) : (
              <span className="ml-2 text-xs font-normal text-muted">(seçim yapılmadı)</span>
            )}
          </span>
          <svg className={`w-4 h-4 text-muted transition-transform ${cepheOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {cepheOpen && (
          <div className="px-6 py-4 bg-white">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3">
              {DUKKAN_CEPHE.map((opt) => {
                const checked = (facadeValue || []).includes(opt);
                return (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                      className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center"
                      style={checked ? { borderColor: PRIMARY, backgroundColor: PRIMARY } : { borderColor: "#D8D3CA", backgroundColor: "#FFFFFF" }}
                      onClick={() => toggleFacade(opt)}
                    >
                      {checked && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-text-dark">{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function DepoAntrepoFeatures({ commercialFeatures, onCommercialFeaturesChange, facadeValue, onFacadeChange }) {
  const [openGroups, setOpenGroups] = useState(() => new Set(["GENEL_OZELLIKLER"]));
  const cur = commercialFeatures || [];

  const toggleGroup = (id) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleItem = (label) => {
    onCommercialFeaturesChange(
      cur.includes(label) ? cur.filter((x) => x !== label) : [...cur, label]
    );
  };

  const toggleFacade = (opt) => {
    const f = facadeValue || [];
    onFacadeChange(f.includes(opt) ? f.filter((x) => x !== opt) : [...f, opt]);
  };

  const renderGroup = ({ id, label, items }) => {
    const open = openGroups.has(id);
    const selCount = items.filter((item) => cur.includes(item)).length;
    return (
      <div key={id} className="border border-border rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleGroup(id)}
          className="w-full flex items-center justify-between px-4 py-3 bg-accent/20 hover:bg-accent/40 transition-colors"
        >
          <span className="text-sm font-semibold text-text-dark">
            {label}
            {selCount > 0 ? (
              <span className="ml-2 text-xs font-normal text-muted">({selCount} seçildi)</span>
            ) : (
              <span className="ml-2 text-xs font-normal text-muted">(seçim yapılmadı)</span>
            )}
          </span>
          <svg className={`w-4 h-4 text-muted transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <div className="px-6 py-4 bg-white">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-3">
              {items.map((item) => {
                const checked = cur.includes(item);
                return (
                  <label key={item} className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                      className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center"
                      style={checked ? { borderColor: PRIMARY, backgroundColor: PRIMARY } : { borderColor: "#D8D3CA", backgroundColor: "#FFFFFF" }}
                      onClick={() => toggleItem(item)}
                    >
                      {checked && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-text-dark">{item}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const cepheOpen = openGroups.has("CEPHE");
  const cepheSelCount = (facadeValue || []).length;

  return (
    <section className="rounded-xl border border-border bg-surface shadow-sm px-4 py-4 space-y-2 mb-4">
      {DEPO_ANTREPO_GROUPS.map(renderGroup)}
      <div className="border border-border rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleGroup("CEPHE")}
          className="w-full flex items-center justify-between px-4 py-3 bg-accent/20 hover:bg-accent/40 transition-colors"
        >
          <span className="text-sm font-semibold text-text-dark">
            Cephe
            {cepheSelCount > 0 ? (
              <span className="ml-2 text-xs font-normal text-muted">({cepheSelCount} seçildi)</span>
            ) : (
              <span className="ml-2 text-xs font-normal text-muted">(seçim yapılmadı)</span>
            )}
          </span>
          <svg className={`w-4 h-4 text-muted transition-transform ${cepheOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {cepheOpen && (
          <div className="px-6 py-4 bg-white">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3">
              {DEPO_ANTREPO_CEPHE.map((opt) => {
                const checked = (facadeValue || []).includes(opt);
                return (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                      className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center"
                      style={checked ? { borderColor: PRIMARY, backgroundColor: PRIMARY } : { borderColor: "#D8D3CA", backgroundColor: "#FFFFFF" }}
                      onClick={() => toggleFacade(opt)}
                    >
                      {checked && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-text-dark">{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function KompleBinaFeatures({ commercialFeatures, onCommercialFeaturesChange, facadeValue, onFacadeChange }) {
  const [openGroups, setOpenGroups] = useState(() => new Set(["KULLANIM_AMACI"]));
  const cur = commercialFeatures || [];

  const toggleGroup = (id) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleItem = (label) => {
    onCommercialFeaturesChange(
      cur.includes(label) ? cur.filter((x) => x !== label) : [...cur, label]
    );
  };

  const toggleFacade = (opt) => {
    const f = facadeValue || [];
    onFacadeChange(f.includes(opt) ? f.filter((x) => x !== opt) : [...f, opt]);
  };

  const renderGroup = ({ id, label, items }) => {
    const open = openGroups.has(id);
    const selCount = items.filter((item) => cur.includes(item)).length;
    return (
      <div key={id} className="border border-border rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleGroup(id)}
          className="w-full flex items-center justify-between px-4 py-3 bg-accent/20 hover:bg-accent/40 transition-colors"
        >
          <span className="text-sm font-semibold text-text-dark">
            {label}
            {selCount > 0 ? (
              <span className="ml-2 text-xs font-normal text-muted">({selCount} seçildi)</span>
            ) : (
              <span className="ml-2 text-xs font-normal text-muted">(seçim yapılmadı)</span>
            )}
          </span>
          <svg className={`w-4 h-4 text-muted transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <div className="px-6 py-4 bg-white">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-3">
              {items.map((item) => {
                const checked = cur.includes(item);
                return (
                  <label key={item} className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                      className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center"
                      style={checked ? { borderColor: PRIMARY, backgroundColor: PRIMARY } : { borderColor: "#D8D3CA", backgroundColor: "#FFFFFF" }}
                      onClick={() => toggleItem(item)}
                    >
                      {checked && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-text-dark">{item}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const cepheOpen = openGroups.has("CEPHE");
  const cepheSelCount = (facadeValue || []).length;

  return (
    <section className="rounded-xl border border-border bg-surface shadow-sm px-4 py-4 space-y-2 mb-4">
      {KOMPLE_BINA_GROUPS.map(renderGroup)}
      <div className="border border-border rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleGroup("CEPHE")}
          className="w-full flex items-center justify-between px-4 py-3 bg-accent/20 hover:bg-accent/40 transition-colors"
        >
          <span className="text-sm font-semibold text-text-dark">
            Cephe
            {cepheSelCount > 0 ? (
              <span className="ml-2 text-xs font-normal text-muted">({cepheSelCount} seçildi)</span>
            ) : (
              <span className="ml-2 text-xs font-normal text-muted">(seçim yapılmadı)</span>
            )}
          </span>
          <svg className={`w-4 h-4 text-muted transition-transform ${cepheOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {cepheOpen && (
          <div className="px-6 py-4 bg-white">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3">
              {KOMPLE_BINA_CEPHE.map((opt) => {
                const checked = (facadeValue || []).includes(opt);
                return (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                      className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center"
                      style={checked ? { borderColor: PRIMARY, backgroundColor: PRIMARY } : { borderColor: "#D8D3CA", backgroundColor: "#FFFFFF" }}
                      onClick={() => toggleFacade(opt)}
                    >
                      {checked && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-text-dark">{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ArsaFeatures({ arsaFeatures, onArsaFeaturesChange }) {
  const [openGroups, setOpenGroups] = useState(() => new Set(["ALT_YAPI"]));
  const cur = arsaFeatures || [];

  const toggleGroup = (id) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleItem = (label) => {
    onArsaFeaturesChange(
      cur.includes(label) ? cur.filter((x) => x !== label) : [...cur, label]
    );
  };

  return (
    <section className="rounded-xl border border-border bg-surface shadow-sm px-4 py-4 space-y-2 mb-4">
      {ARSA_GROUPS.map(({ id, label, items }) => {
        const open = openGroups.has(id);
        const selCount = items.filter((item) => cur.includes(item)).length;
        return (
          <div key={id} className="border border-border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => toggleGroup(id)}
              className="w-full flex items-center justify-between px-4 py-3 bg-accent/20 hover:bg-accent/40 transition-colors"
            >
              <span className="text-sm font-semibold text-text-dark">
                {label}
                {selCount > 0 ? (
                  <span className="ml-2 text-xs font-normal text-muted">({selCount} seçildi)</span>
                ) : (
                  <span className="ml-2 text-xs font-normal text-muted">(seçim yapılmadı)</span>
                )}
              </span>
              <svg className={`w-4 h-4 text-muted transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {open && (
              <div className="px-6 py-4 bg-white">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-3">
                  {items.map((item) => {
                    const checked = cur.includes(item);
                    return (
                      <label key={item} className="flex items-center gap-2 cursor-pointer select-none">
                        <div
                          className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center"
                          style={checked ? { borderColor: PRIMARY, backgroundColor: PRIMARY } : { borderColor: "#D8D3CA", backgroundColor: "#FFFFFF" }}
                          onClick={() => toggleItem(item)}
                        >
                          {checked && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm text-text-dark">{item}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}


// ─── Ana Bileşen ──────────────────────────────────────────────────────────────
export default function FeaturesAccordion(props) {
  const {
    category,
    subType,
    featureDefinitions,
    selectedIds,
    onChange,
    commercialFeatures,
    onCommercialFeaturesChange,
    facadeOptions,
    facadeValue,
    onFacadeChange,
    arsaFeatures,
    onArsaFeaturesChange,
    binaFeatures,
    onBinaFeaturesChange,
  } = props;

  // DUKKAN_MAGAZA her zaman render edilir (backend bağımsız)
  if (category === "IS_YERI" && subType === "DUKKAN_MAGAZA") {
    return (
      <DukkanMagazaFeatures
        commercialFeatures={commercialFeatures || []}
        onCommercialFeaturesChange={onCommercialFeaturesChange}
        facadeValue={facadeValue}
        onFacadeChange={onFacadeChange}
      />
    );
  }
  if (category === "IS_YERI" && subType === "DEPO_ANTREPO") {
    return (
      <DepoAntrepoFeatures
        commercialFeatures={commercialFeatures || []}
        onCommercialFeaturesChange={onCommercialFeaturesChange}
        facadeValue={facadeValue}
        onFacadeChange={onFacadeChange}
      />
    );
  }
  if (category === "IS_YERI" && subType === "KOMPLE_BINA") {
    return (
      <KompleBinaFeatures
        commercialFeatures={commercialFeatures || []}
        onCommercialFeaturesChange={onCommercialFeaturesChange}
        facadeValue={facadeValue}
        onFacadeChange={onFacadeChange}
      />
    );
  }
  if (category === "ARSA") {
    return (
      <ArsaFeatures
        arsaFeatures={arsaFeatures || []}
        onArsaFeaturesChange={onArsaFeaturesChange}
      />
    );
  }
  if (category === "BINA") {
    return (
      <BinaFeatures
        binaFeatures={binaFeatures || []}
        onBinaFeaturesChange={onBinaFeaturesChange}
      />
    );
  }

  if (!featureDefinitions?.length && !facadeOptions?.length) return null;

  // Büro & Ofis ve diğer İş Yeri → flat grid
  if (category === "IS_YERI") {
    return (
      <FlatGrid
        selectedValues={commercialFeatures || []}
        onChange={onCommercialFeaturesChange}
      />
    );
  }

  // Diğer kategoriler → accordion
  return (
    <AccordionGroups
      featureDefinitions={featureDefinitions || []}
      selectedIds={selectedIds}
      onChange={onChange}
      facadeOptions={facadeOptions}
      facadeValue={facadeValue}
      onFacadeChange={onFacadeChange}
    />
  );
}
