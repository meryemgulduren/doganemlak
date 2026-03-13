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

  const inputCls =
    "w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all";

  const labelCls = "block text-xs font-medium text-slate-500 mb-1";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>İl</label>
          <input
            type="text"
            value={current.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="İl"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>İlçe</label>
          <input
            type="text"
            value={current.district}
            onChange={(e) => update("district", e.target.value)}
            placeholder="İlçe"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Mahalle</label>
          <input
            type="text"
            value={current.neighborhood}
            onChange={(e) => update("neighborhood", e.target.value)}
            placeholder="Mahalle"
            className={inputCls}
          />
        </div>
      </div>
      <div>
        <label className={labelCls}>Açık Adres (İsteğe Bağlı)</label>
        <textarea
          value={current.address_details || ""}
          onChange={(e) => update("address_details", e.target.value)}
          placeholder="Örn: Cumhuriyet Mah. Vatan Cad. No: 12"
          className={`${inputCls} resize-none`}
          rows={3}
        />
      </div>
    </div>
  );
}
