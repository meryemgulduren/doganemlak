import { useState } from "react";
import { featureGroups } from "../../config/formConfig";

export default function FeaturesAccordion({ featureDefinitions, selectedIds, onChange }) {
  const [openGroups, setOpenGroups] = useState(() => new Set());

  if (!featureDefinitions?.length) return null;

  const byCategory = featureDefinitions.reduce((acc, f) => {
    const cat = f.category || "OTHER";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(f);
    return acc;
  }, {});

  const toggleGroup = (id) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleFeature = (id) => {
    const current = selectedIds || [];
    const exists = current.includes(id);
    const next = exists ? current.filter((x) => x !== id) : [...current, id];
    onChange(next);
  };

  return (
    <section className="rounded-xl border border-[#e2d4b0] bg-white shadow-sm px-4 py-3 space-y-2">
      <h3 className="text-sm font-semibold text-[#b8902d]">Özellikler</h3>
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {Object.entries(byCategory).map(([cat, items]) => {
          const def = featureGroups[cat] || { label: cat };
          const open = openGroups.has(cat);
          const selectedCount = items.filter((f) => selectedIds?.includes(f._id)).length;
          return (
            <div key={cat} className="border border-accent/30 rounded-lg overflow-hidden bg-[#fffbf3]">
              <button
                type="button"
                onClick={() => toggleGroup(cat)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-text-dark"
              >
                <span>
                  {def.label}{" "}
                  {selectedCount > 0 && (
                    <span className="text-[11px] text-[#b8902d]">({selectedCount} seçildi)</span>
                  )}
                </span>
                <span className="text-[10px] text-text-dark/70">{open ? "▲" : "▼"}</span>
              </button>
              {open && (
                <div className="px-3 pb-2 pt-1 flex flex-wrap gap-2 bg-white">
                  {items.map((f) => (
                    <label
                      key={f._id}
                      className="inline-flex items-center gap-1.5 text-xs cursor-pointer"
                    >
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

