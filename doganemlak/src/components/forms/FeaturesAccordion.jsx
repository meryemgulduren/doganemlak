import { useState } from "react";
import { featureGroups } from "../../config/formConfig";

const PRIMARY = "#2C4ECF";

// Büro & Ofis için gösterilecek sabit özellik listesi
const BURO_OFIS_ALLOWED = [
  "ADSL", "Asansör", "Beyaz Eşya", "Çelik Kapı",
  "Mobilya", "Mutfak", "Parke Zemin", "WC", "Yangın Merdiveni",
];

// ─── Flat grid (İş Yeri / Büro-Ofis stili) ──────────────────────────────────
function FlatGrid({ featureDefinitions, selectedIds, onChange }) {
  const [skip, setSkip] = useState(false);

  // Sadece izin verilen 9 özelliği göster
  const filtered = (featureDefinitions || []).filter((f) =>
    BURO_OFIS_ALLOWED.includes(f.label) || BURO_OFIS_ALLOWED.includes(f.key)
  );

  const toggle = (id) => {
    const cur = selectedIds || [];
    onChange(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  };

  const selectedCount = (selectedIds || []).filter((id) =>
    filtered.some((f) => f._id === id)
  ).length;

  return (
    <section className="rounded-xl border border-border bg-surface shadow-sm px-4 py-4 space-y-3 mb-4">
      <div className="bg-slate-50 rounded-lg border border-slate-100">
        {/* Başlık */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-slate-600">
            Detay Bilgisi
            {selectedCount > 0 ? (
              <span className="ml-2 text-xs font-normal text-gray-500">({selectedCount} seçildi)</span>
            ) : (
              <span className="ml-2 text-xs font-normal text-gray-400">(seçim yapılmadı)</span>
            )}
          </h3>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </div>

        {/* Checkbox grid */}
        {!skip && (
          <div className="px-6 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-4">
              {filtered.map((f) => {
                const checked = selectedIds?.includes(f._id) || false;
                return (
                  <label key={f._id} className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                      className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center"
                      style={checked ? { borderColor: PRIMARY, backgroundColor: PRIMARY } : { borderColor: "#d1d5db", backgroundColor: "#fff" }}
                      onClick={() => toggle(f._id)}
                    >
                      {checked && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-700 leading-tight">{f.label || f.key}</span>
                  </label>
                );
              })}
            </div>

            {/* Ayırıcı + seçim istemiyorum */}
            <div className="border-t border-gray-200 mt-5 pt-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center"
                  style={skip ? { borderColor: "#6b7280", backgroundColor: "#6b7280" } : { borderColor: "#d1d5db", backgroundColor: "#fff" }}
                  onClick={() => {
                    setSkip(true);
                    onChange([]);
                  }}
                >
                  {skip && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-600 font-medium">Detay Bilgisi seçimi yapmak istemiyorum</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Accordion (diğer kategoriler) ───────────────────────────────────────────
function AccordionGroups({ featureDefinitions, selectedIds, onChange, facadeOptions, facadeValue, onFacadeChange }) {
  const [openGroups, setOpenGroups] = useState(() => new Set());

  const byCategory = featureDefinitions.reduce((acc, f) => {
    const cat = f.category || "OTHER";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(f);
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
        <h3 className="text-base font-semibold text-slate-700">Özellikler</h3>
      </header>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        {/* Cephe */}
        {facadeOptions && facadeOptions.length > 0 && (
          <div className="border border-border rounded-lg overflow-hidden bg-background">
            <button
              type="button"
              onClick={() => toggleGroup("CEPHE")}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
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
                  <label key={opt} className="inline-flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 px-2 py-1 rounded transition-colors">
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
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
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
                    <label key={f._id} className="inline-flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 px-2 py-1 rounded transition-colors">
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

function DukkanMagazaFeatures({ commercialFeatures, onCommercialFeaturesChange, facadeValue, onFacadeChange }) {
  const [openGroups, setOpenGroups] = useState(() => new Set(["KULLANIM_AMACI"]));
  const [skipCephe, setSkipCephe] = useState(false);

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
      <div key={id} className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleGroup(id)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-semibold text-slate-600">
            {label}
            {selCount > 0 ? (
              <span className="ml-2 text-xs font-normal text-gray-500">({selCount} seçildi)</span>
            ) : (
              <span className="ml-2 text-xs font-normal text-gray-400">(seçim yapılmadı)</span>
            )}
          </span>
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
                      style={checked ? { borderColor: GOLD, backgroundColor: GOLD } : { borderColor: "#d1d5db", backgroundColor: "#fff" }}
                      onClick={() => toggleItem(item)}
                    >
                      {checked && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-700">{item}</span>
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
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleGroup("CEPHE")}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <span className="text-sm font-semibold text-slate-600">
            Cephe
            {cepheSelCount > 0 ? (
              <span className="ml-2 text-xs font-normal text-gray-500">({cepheSelCount} seçildi)</span>
            ) : (
              <span className="ml-2 text-xs font-normal text-gray-400">(seçim yapılmadı)</span>
            )}
          </span>
          <svg className={`w-4 h-4 text-gray-400 transition-transform ${cepheOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {cepheOpen && (
          <div className="px-6 py-4 bg-white">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3 mb-4">
              {DUKKAN_CEPHE.map((opt) => {
                const checked = (facadeValue || []).includes(opt);
                return (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                      className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center"
                      style={checked ? { borderColor: GOLD, backgroundColor: GOLD } : { borderColor: "#d1d5db", backgroundColor: "#fff" }}
                      onClick={() => toggleFacade(opt)}
                    >
                      {checked && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-700">{opt}</span>
                  </label>
                );
              })}
            </div>
            <div className="border-t border-gray-100 pt-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center"
                  style={skipCephe ? { borderColor: "#6b7280", backgroundColor: "#6b7280" } : { borderColor: "#d1d5db", backgroundColor: "#fff" }}
                  onClick={() => { setSkipCephe((v) => !v); onFacadeChange([]); }}
                >
                  {skipCephe && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-600 font-medium">Cephe seçimi yapmak istemiyorum</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}


// ─── Ana Bileşen ──────────────────────────────────────────────────────────────
export default function FeaturesAccordion(props) {
  const { category, subType, featureDefinitions, selectedIds, onChange, commercialFeatures, onCommercialFeaturesChange, facadeOptions, facadeValue, onFacadeChange } = props;

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

  if (!featureDefinitions?.length && !facadeOptions?.length) return null;

  // Büro & Ofis ve diğer İş Yeri → flat grid
  if (category === "IS_YERI") {
    return (
      <FlatGrid
        featureDefinitions={featureDefinitions || []}
        selectedIds={selectedIds}
        onChange={onChange}
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
