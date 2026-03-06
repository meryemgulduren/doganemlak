/**
 * Basit adres bileşeni.
 * Şimdilik sadece üç text input kullanıyor, ancak API veya json veri
 * eklendiğinde select'lere çevirmek kolay olsun diye ayrı bileşen.
 */
export default function AddressCascader({ value, onChange }) {
  const current = value || { city: "", district: "", neighborhood: "" };

  const update = (key, val) => {
    onChange({ ...current, [key]: val });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      <div>
        <label className="block text-xs font-medium text-text-dark mb-0.5">İl</label>
        <input
          type="text"
          value={current.city}
          onChange={(e) => update("city", e.target.value)}
          placeholder="İl"
          className="w-full px-3 py-2 border border-accent/60 rounded-lg text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-text-dark mb-0.5">İlçe</label>
        <input
          type="text"
          value={current.district}
          onChange={(e) => update("district", e.target.value)}
          placeholder="İlçe"
          className="w-full px-3 py-2 border border-accent/60 rounded-lg text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-text-dark mb-0.5">Mahalle</label>
        <input
          type="text"
          value={current.neighborhood}
          onChange={(e) => update("neighborhood", e.target.value)}
          placeholder="Mahalle"
          className="w-full px-3 py-2 border border-accent/60 rounded-lg text-sm"
        />
      </div>
    </div>
  );
}

