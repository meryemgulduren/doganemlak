import { useMemo } from "react";

function buildPageItems({ currentPage, totalPages }) {
  // Ekranda karışıklık olmasın diye, sayfa sayısı az ise hepsini göster.
  if (totalPages <= 12) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const items = new Set();
  items.add(1);
  items.add(totalPages);

  // Yakın çevre + geçiş
  for (let p = currentPage - 1; p <= currentPage + 1; p++) {
    if (p >= 2 && p <= totalPages - 1) items.add(p);
  }

  // Baş ve orta parçadan birer tane daha
  items.add(2);
  items.add(3);
  items.add(totalPages - 2);
  items.add(totalPages - 1);

  const sorted = Array.from(items).sort((a, b) => a - b);

  // Ellipsis ( ... ) için araları doldur.
  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    const page = sorted[i];
    result.push(page);
    const next = sorted[i + 1];
    if (next && next !== page + 1) result.push("ellipsis");
  }
  return result;
}

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const safeCurrent = Math.max(1, Number(currentPage) || 1);
  const safeTotal = Math.max(1, Number(totalPages) || 1);

  const items = useMemo(
    () => buildPageItems({ currentPage: safeCurrent, totalPages: safeTotal }),
    [safeCurrent, safeTotal]
  );

  return (
    <div className="mt-10">
      <div className="text-center text-sm text-neutral-500 mb-4">
        Toplam {safeTotal} sayfa içerisinde {safeCurrent}. sayfayı görmektesiniz.
      </div>

      <div className="flex justify-center items-center gap-2 flex-wrap">
        {items.map((it, idx) => {
          if (it === "ellipsis") {
            return (
              <span key={`e-${idx}`} className="px-2 text-neutral-500">
                ...
              </span>
            );
          }

          const page = it;
          const isActive = page === safeCurrent;

          return (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange?.(page)}
              aria-current={isActive ? "page" : undefined}
              className={`min-w-[2.25rem] h-9 px-3 rounded-lg border text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-neutral-200 border-neutral-300 text-neutral-800 cursor-default"
                  : "bg-white border-neutral-200 text-primary hover:bg-neutral-50"
              }`}
              disabled={isActive}
            >
              {page}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange?.(safeCurrent + 1)}
          disabled={safeCurrent >= safeTotal}
          className="min-w-[6rem] h-9 px-3 rounded-lg border border-neutral-200 bg-white text-primary font-semibold text-sm hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sonraki
        </button>
      </div>
    </div>
  );
}

