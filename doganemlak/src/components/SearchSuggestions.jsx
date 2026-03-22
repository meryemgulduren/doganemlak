import { ChevronRight } from "lucide-react";

function SuggestionRow({ label, onClick, hasNext }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left border-b border-text-dark/10 last:border-b-0 hover:bg-text-dark/5 transition-colors font-sans"
      role="option"
    >
      <span className="font-medium text-text-dark flex-1 truncate">{label}</span>
      {hasNext && <ChevronRight className="w-5 h-5 text-text-dark/40 flex-shrink-0" />}
    </button>
  );
}

export default function SearchSuggestions({
  isOpen,
  selectedCategories,
  categoriesData,
  onSelectMain,
  onSelectSub,
  onSelectAllInCategory,
}) {
  if (!isOpen) return null;

  // Yükleniyorsa veya veri yoksa
  if (!categoriesData) {
    return (
      <div className="absolute left-0 right-0 top-full mt-1 z-[100] rounded-b-xl overflow-hidden border border-t-0 border-text-dark/30 bg-white/95 backdrop-blur-sm shadow-lg font-sans">
        <div className="px-4 py-3 text-sm text-muted">Kategoriler yükleniyor...</div>
      </div>
    );
  }

  const mainCat = selectedCategories[0];
  const listType = selectedCategories[1];

  let listToShow = [];
  
  if (selectedCategories.length === 0) {
    // Seviye 1: Ana Kategoriler
    listToShow = [
      { id: "tum_emlak", label: "Tüm 'Emlak' İlanları", isTum: true },
      ...(categoriesData.mainCategories || []).map(c => ({ ...c, level: 1 }))
    ];
  } else if (selectedCategories.length === 1) {
    // Seviye 2: İlan Tipleri (Satılık, Kiralık vb)
    listToShow = [
      { id: `tum_${mainCat.id}`, label: `Tüm '${mainCat.label}' İlanları`, isTum: true },
      ...(categoriesData.listingTypes || []).map(t => ({ ...t, level: 2 }))
    ];
  } else if (selectedCategories.length === 2 && mainCat?.id) {
    // Seviye 3: Alt Tipler (Daire, Villa vb)
    const subs = categoriesData.subTypes?.[mainCat.id] || [];
    listToShow = [
      { id: `tum_${listType.id}`, label: `Tüm '${listType.label}' İlanları`, isTum: true },
      ...subs.map(s => ({ ...s, level: 3 }))
    ];
  }

  return (
    <div
      className="absolute left-0 right-0 top-full mt-1 z-[100] rounded-b-xl overflow-hidden border border-t-0 border-text-dark/30 bg-white/95 backdrop-blur-sm shadow-lg font-sans"
      role="listbox"
      aria-label="Arama kategorileri"
    >
      <div className="py-1 max-h-80 overflow-y-auto">
        {listToShow.map((item) => (
          <SuggestionRow
            key={item.id}
            label={item.label}
            hasNext={!item.isTum && item.level < 3}
            onClick={() => {
              if (item.isTum) {
                onSelectAllInCategory?.();
              } else if (item.level === 1) {
                onSelectMain?.(item);
              } else {
                onSelectSub?.(item);
              }
            }}
          />
        ))}
        {listToShow.length === 0 && (
          <div className="px-4 py-3 text-sm text-muted">Alt kategori bulunamadı.</div>
        )}
      </div>
    </div>
  );
}
