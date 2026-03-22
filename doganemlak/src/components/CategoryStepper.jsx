import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchCategories } from "../api/admin";

// ─── Kategori ikonları ───────────────────────────────────────────────────────
const CATEGORY_ICONS = {
  KONUT: (
    <svg viewBox="0 0 48 48" fill="none" className="w-14 h-14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 22L24 6l18 16" />
      <path d="M10 18v22h10V28h8v12h10V18" />
      <rect x="20" y="28" width="8" height="12" />
    </svg>
  ),
  IS_YERI: (
    <svg viewBox="0 0 48 48" fill="none" className="w-14 h-14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="14" width="36" height="28" rx="2" />
      <path d="M16 14V8a2 2 0 012-2h12a2 2 0 012 2v6" />
      <path d="M6 28h36" />
      <rect x="20" y="28" width="8" height="14" />
    </svg>
  ),
  ARSA: (
    <svg viewBox="0 0 48 48" fill="none" className="w-14 h-14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 38L14 20l10 10 8-16 10 24" />
      <path d="M4 38h40" />
      <path d="M32 14l2-6M36 16l6-2" />
    </svg>
  ),
  BINA: (
    <svg viewBox="0 0 48 48" fill="none" className="w-14 h-14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="6" width="32" height="36" rx="1" />
      <path d="M16 6v36M24 6v36M32 6v36" />
      <path d="M8 16h32M8 26h32M8 36h32" />
      <rect x="20" y="34" width="8" height="8" />
    </svg>
  ),
};

const DEFAULT_ICON = (
  <svg viewBox="0 0 48 48" fill="none" className="w-14 h-14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="6" width="36" height="36" rx="3" />
    <path d="M24 16v16M16 24h16" />
  </svg>
);

// ─── Animasyon varyantları ────────────────────────────────────────────────────
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.28, ease: "easeOut" } },
  exit:   (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }),
};

const bounceVariants = {
  hidden:  { scale: 0.5, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 350, damping: 20 } },
};

// ─── Adım göstergesi ──────────────────────────────────────────────────────────
function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((label, i) => {
        const done   = i < currentStep;
        const active = i === currentStep;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                animate={
                  active
                    ? { scale: 1.15, boxShadow: "0 0 0 4px rgba(73,17,28,0.18)" }
                    : { scale: 1,    boxShadow: "none" }
                }
                className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-base border-2 transition-colors duration-300 ${
                  done   ? "bg-success border-success text-white"
                  : active ? "bg-surface border-primary text-primary"
                  :          "bg-accent/40 border-border text-muted"
                }`}
              >
                {done ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : i + 1}
              </motion.div>
              <span className={`mt-1.5 text-[13px] font-semibold whitespace-nowrap ${
                done ? "text-success" : active ? "text-primary" : "text-muted"
              }`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="w-24 h-0.5 mx-2 mb-5 rounded-full transition-colors duration-500"
                style={{ background: done ? "#2F855A" : "#D8D3CA" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Ana bileşen ──────────────────────────────────────────────────────────────
export default function CategoryStepper({ value = null, onChange, onComplete }) {
  const [categoriesData, setCategoriesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [direction, setDirection] = useState(1);

  const selection = value ?? { category: null, listingType: null, subType: null };

  useEffect(() => {
    let cancelled = false;
    fetchCategories()
      .then((res) => { if (!cancelled && res.success && res.data) setCategoriesData(res.data); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const mainCategories  = categoriesData?.mainCategories ?? [];
  const listingTypes    = categoriesData?.listingTypes   ?? [];
  const subTypesMap     = categoriesData?.subTypes       ?? {};
  const currentSubTypes = selection.category ? (subTypesMap[selection.category] ?? []) : [];
  const hasSubTypeStep  = currentSubTypes.length > 0;

  const set = (next) => onChange?.({ ...selection, ...next });

  const getWithLabels = () => {
    const main    = mainCategories.find((c) => c.id === selection.category);
    const listing = listingTypes.find((t) => t.id === selection.listingType);
    const sub     = currentSubTypes.find((s) => s.id === selection.subType);
    return {
      ...selection,
      categoryLabel:    main?.label    ?? selection.category,
      listingTypeLabel: listing?.label ?? selection.listingType,
      subTypeLabel:     sub?.label     ?? selection.subType,
    };
  };

  const stepIndex = !selection.category
    ? 0
    : !selection.listingType
    ? 1
    : hasSubTypeStep && !selection.subType
    ? 2
    : hasSubTypeStep ? 3 : 2;

  const isDone = selection.category && selection.listingType && (!hasSubTypeStep || selection.subType);
  const allSteps = ["Kategori", "İlan Tipi", ...(hasSubTypeStep ? ["Alt Tip"] : []), "Tamamla"];

  const breadcrumbs = [
    { label: "Emlak", onClick: () => { setDirection(-1); set({ category: null, listingType: null, subType: null }); } },
    selection.category    && { label: mainCategories.find((c) => c.id === selection.category)?.label ?? selection.category,    onClick: () => { setDirection(-1); set({ listingType: null, subType: null }); } },
    selection.listingType && { label: listingTypes.find((t) => t.id === selection.listingType)?.label ?? selection.listingType, onClick: () => { setDirection(-1); set({ subType: null }); } },
    (selection.subType && hasSubTypeStep) && { label: currentSubTypes.find((s) => s.id === selection.subType)?.label ?? selection.subType, onClick: null },
  ].filter(Boolean);

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="flex items-center gap-3 text-muted">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Kategoriler yükleniyor...
      </div>
    </div>
  );

  if (error) return (
    <div className="rounded-xl border border-danger/30 bg-danger/10 p-6 text-danger text-sm">{error}</div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-surface rounded-2xl shadow-card border border-border overflow-hidden">

        {/* Üst başlık */}
        <div className="px-10 pt-8 pb-6 border-b border-border bg-accent/10">
          <h2 className="text-2xl font-bold text-text-dark mb-1">Yeni İlan Oluştur</h2>
          <p className="text-base text-muted">İlan türünüzü adım adım seçin</p>

          <div className="mt-6">
            <StepIndicator steps={allSteps} currentStep={isDone ? allSteps.length - 1 : stepIndex} />
          </div>

          {/* Breadcrumb */}
          {breadcrumbs.length > 1 && (
            <div className="flex items-center gap-1 flex-wrap">
              {breadcrumbs.map((b, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <span className="text-muted/40 text-sm">›</span>}
                  {b.onClick ? (
                    <button type="button" onClick={b.onClick}
                      className="text-sm font-medium text-secondary hover:text-primary hover:underline transition-colors">
                      {b.label}
                    </button>
                  ) : (
                    <span className="text-sm font-semibold text-text-dark">{b.label}</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* İçerik */}
        <div className="px-10 py-8 min-h-[320px]">
          <AnimatePresence mode="wait" custom={direction}>

            {/* Adım 0 — Ana Kategori */}
            {!selection.category && (
              <motion.div key="step-main" custom={direction} variants={slideVariants}
                initial="enter" animate="center" exit="exit">
                <p className="text-sm font-bold text-muted uppercase tracking-widest mb-5">Ana Kategori Seçin</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                  {mainCategories.map((c) => (
                    <motion.button
                      key={c.id}
                      type="button"
                      onClick={() => { setDirection(1); set({ category: c.id, listingType: null, subType: null }); }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex flex-col items-center gap-4 p-7 rounded-xl border-2 border-border bg-background hover:bg-accent/30 hover:border-primary/50 transition-colors cursor-pointer group"
                    >
                      <span className="text-muted group-hover:text-primary transition-colors">
                        {CATEGORY_ICONS[c.id] ?? DEFAULT_ICON}
                      </span>
                      <span className="font-bold text-text-dark text-base group-hover:text-primary">{c.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Adım 1 — İlan Tipi */}
            {selection.category && !selection.listingType && (
              <motion.div key="step-type" custom={direction} variants={slideVariants}
                initial="enter" animate="center" exit="exit">
                <p className="text-sm font-bold text-muted uppercase tracking-widest mb-5">İlan Tipini Seçin</p>
                <div className="grid grid-cols-2 gap-5 max-w-lg">
                  {listingTypes.map((t) => (
                    <motion.button
                      key={t.id}
                      type="button"
                      onClick={() => { setDirection(1); set({ listingType: t.id }); }}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex flex-col items-center gap-4 p-8 rounded-xl border-2 border-border bg-background hover:bg-accent/30 hover:border-primary/50 transition-colors cursor-pointer group"
                    >
                      {t.id === "SATILIK" ? (
                        <svg className="w-14 h-14 text-muted group-hover:text-primary" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 48 48" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M24 6v36M12 18l12-12 12 12" />
                          <path d="M10 42h28" />
                          <circle cx="24" cy="30" r="4" />
                        </svg>
                      ) : (
                        <svg className="w-14 h-14 text-muted group-hover:text-warning" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 48 48" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="6" y="14" width="36" height="28" rx="3" />
                          <path d="M16 14V10a2 2 0 012-2h12a2 2 0 012 2v4" />
                          <path d="M24 28v-6M21 25l3-3 3 3" />
                        </svg>
                      )}
                      <span className={`font-bold text-text-dark text-lg group-hover:${t.id === "SATILIK" ? "text-primary" : "text-warning"}`}>
                        {t.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Adım 2 — Alt Tip */}
            {selection.listingType && hasSubTypeStep && !selection.subType && (
              <motion.div key="step-sub" custom={direction} variants={slideVariants}
                initial="enter" animate="center" exit="exit">
                <p className="text-sm font-bold text-muted uppercase tracking-widest mb-5">Konut Tipini Seçin</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {currentSubTypes.map((s) => (
                    <motion.button
                      key={s.id}
                      type="button"
                      onClick={() => { setDirection(1); set({ subType: s.id }); }}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-3 px-6 py-5 rounded-xl border-2 border-border bg-background hover:bg-accent/30 hover:border-primary/50 transition-colors text-left group"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-secondary/60 group-hover:bg-primary transition-colors flex-shrink-0" />
                      <span className="font-semibold text-text-dark text-base group-hover:text-primary">{s.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Adım: Tamamlandı */}
            {isDone && (
              <motion.div key="step-done" variants={bounceVariants} initial="hidden" animate="visible"
                className="flex flex-col items-center justify-center py-4 text-center gap-4">
                <div className="w-20 h-20 rounded-full bg-success flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-xl font-bold text-text-dark">Kategori Seçildi!</p>
                  <p className="text-base text-muted mt-1">
                    {[
                      mainCategories.find((c) => c.id === selection.category)?.label,
                      listingTypes.find((t) => t.id === selection.listingType)?.label,
                      currentSubTypes.find((s) => s.id === selection.subType)?.label,
                    ].filter(Boolean).join(" › ")}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button type="button"
                    onClick={() => { setDirection(-1); set({ category: null, listingType: null, subType: null }); }}
                    className="px-5 py-2.5 rounded-xl border-2 border-border text-muted font-medium text-sm hover:border-secondary hover:bg-accent/30 transition-colors">
                    Değiştir
                  </button>
                  <motion.button
                    type="button"
                    onClick={() => onComplete?.(getWithLabels())}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-8 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm shadow-sm hover:bg-primary/90 transition-all">
                    Devam Et →
                  </motion.button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {!selection.category && mainCategories.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-12 text-muted gap-3">
              <p className="text-sm">Kategori verisi bulunamadı.</p>
            </div>
          )}
        </div>

        {/* Alt bilgi */}
        <div className="px-8 py-3 bg-background border-t border-border flex items-center justify-between">
          {stepIndex > 0 && !isDone ? (
            <button type="button"
              onClick={() => {
                setDirection(-1);
                if (selection.subType) set({ subType: null });
                else if (selection.listingType) set({ listingType: null });
                else set({ category: null });
              }}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-text-dark transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Geri
            </button>
          ) : <div />}
          <p className="text-xs text-muted">
            {isDone ? "Devam Et butonuna basarak ilan detaylarını girebilirsiniz." : "Lütfen ilerlemek için bir seçim yapın."}
          </p>
        </div>
      </div>
    </div>
  );
}
