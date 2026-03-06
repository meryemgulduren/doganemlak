import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { fetchCategories } from "../api/admin";

const STEP_MAIN = 1;
const STEP_LISTING_TYPE = 2;
const STEP_SUB_TYPE = 3;
const STEP_DONE = 4;

/**
 * Adım adım kategori seçimi (sahibinden.com tarzı).
 * categorySelection: { category, listingType, subType }
 * onComplete(selection) Devam butonunda çağrılır.
 */
export default function CategoryStepper({ value = null, onChange, onComplete }) {
  const [categoriesData, setCategoriesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const selection = value ?? {
    category: null,
    listingType: null,
    subType: null,
  };

  useEffect(() => {
    let cancelled = false;
    fetchCategories()
      .then((res) => {
        if (!cancelled && res.success && res.data) setCategoriesData(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const mainCategories = categoriesData?.mainCategories ?? [];
  const listingTypes = categoriesData?.listingTypes ?? [];
  const subTypesMap = categoriesData?.subTypes ?? {};
  const currentSubTypes = selection.category ? (subTypesMap[selection.category] ?? []) : [];
  const hasSubTypeStep = currentSubTypes.length > 0;

  const setSelection = (next) => {
    const nextSelection = { ...selection, ...next };
    onChange?.(nextSelection);
  };

  const getSelectionWithLabels = () => {
    const main = mainCategories.find((c) => c.id === selection.category);
    const listing = listingTypes.find((t) => t.id === selection.listingType);
    const sub = currentSubTypes.find((s) => s.id === selection.subType);
    return {
      ...selection,
      categoryLabel: main?.label ?? selection.category,
      listingTypeLabel: listing?.label ?? selection.listingType,
      subTypeLabel: sub?.label ?? selection.subType,
    };
  };

  const handleMainSelect = (id) => {
    setSelection({ category: id, listingType: null, subType: null });
  };

  const handleListingTypeSelect = (id) => {
    setSelection({ listingType: id });
    if (!hasSubTypeStep) {
      // Arsa / Bina: alt tip yok, doğrudan bitiş
      // (STEP_DONE will be shown on next render)
    }
  };

  const handleSubTypeSelect = (id) => {
    setSelection({ subType: id });
  };

  const getStep = () => {
    if (!selection.category) return STEP_MAIN;
    if (!selection.listingType) return STEP_LISTING_TYPE;
    if (hasSubTypeStep && !selection.subType) return STEP_SUB_TYPE;
    return STEP_DONE;
  };

  const step = getStep();
  const breadcrumbParts = [
    selection.category && mainCategories.find((c) => c.id === selection.category)?.label,
    selection.listingType && listingTypes.find((t) => t.id === selection.listingType)?.label,
    selection.subType && currentSubTypes.find((s) => s.id === selection.subType)?.label,
  ].filter(Boolean);

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-gray-600">
        Kategoriler yükleniyor...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Adım Adım Kategori Seç</h3>

      {breadcrumbParts.length > 0 && (
        <p className="text-sm text-gray-600">
          <span className="font-medium text-blue-600">Emlak</span>
          {breadcrumbParts.map((part, i) => (
            <span key={i}>
              <span className="mx-1 text-gray-400">›</span>
              <span className="text-gray-800">{part}</span>
            </span>
          ))}
        </p>
      )}

      <div className="flex flex-wrap gap-4 items-stretch">
        {/* Sütun 1: Ana kategori */}
        <div className="flex flex-col min-w-[200px] rounded-lg border border-gray-200 bg-white overflow-hidden">
          <div className="px-3 py-2 bg-gray-100 border-b border-gray-200 text-xs font-medium text-gray-600">
            Ana kategori
          </div>
          <ul className="p-2 flex-1">
            {mainCategories.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => handleMainSelect(c.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selection.category === c.id
                      ? "bg-gray-200 text-gray-900 font-medium"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {c.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Sütun 2: İlan tipi (Satılık / Kiralık) */}
        {selection.category && (
          <div className="flex flex-col min-w-[200px] rounded-lg border border-gray-200 bg-white overflow-hidden">
            <div className="px-3 py-2 bg-gray-100 border-b border-gray-200 text-xs font-medium text-gray-600">
              İlan tipi
            </div>
            <ul className="p-2 flex-1">
              {listingTypes.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => handleListingTypeSelect(t.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selection.listingType === t.id
                        ? "bg-gray-200 text-gray-900 font-medium"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {t.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sütun 3: Alt tip (Konut / İş Yeri) veya boş Arsa/Bina için yer tutucu */}
        {selection.category && selection.listingType && (
          hasSubTypeStep ? (
            <div className="flex flex-col min-w-[200px] rounded-lg border border-sky-200 bg-sky-50/50 overflow-hidden">
              <div className="px-3 py-2 bg-sky-100 border-b border-sky-200 text-xs font-medium text-sky-800">
                Alt tip
              </div>
              <ul className="p-2 flex-1">
                {currentSubTypes.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => handleSubTypeSelect(s.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selection.subType === s.id
                          ? "bg-sky-200 text-sky-900 font-medium"
                          : "hover:bg-sky-100 text-sky-800"
                      }`}
                    >
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex flex-col min-w-[200px] rounded-lg border border-gray-200 bg-gray-50 overflow-hidden opacity-80">
              <div className="px-3 py-2 bg-gray-100 border-b border-gray-200 text-xs font-medium text-gray-500">
                Alt tip yok
              </div>
              <div className="p-4 text-sm text-gray-500 flex-1">
                Bu kategoride alt tip seçimi yok.
              </div>
            </div>
          )
        )}

        {/* Final card: Tamamlandı + Devam */}
        {step === STEP_DONE && (
          <div className="flex flex-col min-w-[240px] rounded-lg border-2 border-green-200 bg-green-50 overflow-hidden">
            <div className="p-4 flex flex-col items-center justify-center flex-1 text-center">
              <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center mb-3">
                <Check className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <p className="text-green-800 font-medium mb-4">
                Kategori seçimi tamamlanmıştır.
              </p>
              <button
                type="button"
                onClick={() => onComplete?.(getSelectionWithLabels())}
                className="w-full py-2.5 px-4 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
              >
                Devam
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
