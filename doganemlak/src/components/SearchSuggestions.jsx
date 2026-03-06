import { ChevronRight } from "lucide-react";
import { searchCategories } from "../constants/searchCategories";

function SuggestionRow({ label, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left border-b border-text-dark/10 last:border-b-0 hover:bg-text-dark/5 transition-colors font-sans"
      role="option"
    >
      <span className="font-medium text-text-dark flex-1 truncate">{label}</span>
      <span className="text-text-dark/50 text-sm tabular-nums flex-shrink-0">
        ({count})
      </span>
      <ChevronRight className="w-5 h-5 text-text-dark/40 flex-shrink-0" />
    </button>
  );
}

function isTumRow(item) {
  return item.id?.startsWith("tum-") || item.label?.startsWith("Tüm ");
}

export default function SearchSuggestions({
  isOpen,
  selectedCategories,
  onSelectMain,
  onSelectSub,
  onSelectAllInCategory,
}) {
  if (!isOpen) return null;

  const mainLabel = selectedCategories[0];
  const secondLabel = selectedCategories[1];
  const mainCatData = searchCategories.find((c) => c.label === mainLabel);

  const level2Items = mainCatData?.subcategories;
  const showLevel2 = mainLabel && level2Items?.length > 0 && selectedCategories.length === 1;

  const level2Item = level2Items?.find((s) => s.label === secondLabel);
  const level3Items = level2Item?.subcategories;
  const showLevel3 = mainLabel && secondLabel && level3Items?.length > 0;

  const listToShow = showLevel3
    ? level3Items
    : showLevel2
      ? level2Items
      : null;

  return (
    <div
      className="absolute left-0 right-0 top-full mt-1 z-[100] rounded-b-xl overflow-hidden border border-t-0 border-text-dark/30 bg-white/95 backdrop-blur-sm shadow-lg font-sans"
      role="listbox"
      aria-label="Arama kategorileri"
    >
      <div className="py-1">
        {listToShow ? (
          listToShow.map((item) => (
            <SuggestionRow
              key={item.id}
              label={item.label}
              count={item.count}
              onClick={() => {
                if (isTumRow(item)) {
                  onSelectAllInCategory?.();
                } else {
                  onSelectSub?.(item);
                }
              }}
            />
          ))
        ) : (
          searchCategories.map((item) => (
            <SuggestionRow
              key={item.id}
              label={item.label}
              count={item.count}
              onClick={() => onSelectMain?.(item)}
            />
          ))
        )}
      </div>
    </div>
  );
}
