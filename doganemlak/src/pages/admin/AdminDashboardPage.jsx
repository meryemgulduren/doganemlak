import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getToken } from "../../api/client";
import { fetchAdminStats, fetchAdminAnalytics } from "../../api/admin";

// ── Kurumsal Renk Paleti (Brand Colors) ──────────────────────────────────────
const BRAND_COLORS = [
  "#1e3a8a", // blue-900 (En koyu)
  "#2563eb", // blue-600
  "#3b82f6", // blue-500
  "#60a5fa", // blue-400
  "#93c5fd", // blue-300
  "#bfdbfe", // blue-200 (En açık)
];

function formatPrice(n) {
  if (!n) return "—";
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n) + " ₺";
}

// ── Özelleştirilmiş Komponentler ─────────────────────────────────────────────

// 1. KPI Kartı (Küçük ve Şık)
function KpiCard({ label, value }) {
  return (
    <div className="bg-white rounded-[16px] p-5 shadow-sm border border-slate-100 flex flex-col justify-center hover:shadow-md transition-shadow">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-2xl font-extrabold text-slate-800">{value ?? "—"}</h4>
    </div>
  );
}

// 2. CSS Donut Chart (Pasta Grafik)
function CSSDonutChart({ data, title }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-[16px] p-6 shadow-sm border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
        <p className="text-sm text-slate-400 italic">Veri yok.</p>
      </div>
    );
  }
  
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let currentDegree = 0;
  const gradientStops = data.map((d, i) => {
    const percent = total > 0 ? (d.value / total) * 360 : 0;
    const color = BRAND_COLORS[i % BRAND_COLORS.length];
    const start = currentDegree;
    currentDegree += percent;
    return `${color} ${start}deg ${currentDegree}deg`;
  });

  return (
    <div className="bg-white rounded-[16px] p-6 shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-md transition-shadow">
      <h3 className="text-sm font-semibold text-slate-700 mb-6">{title}</h3>
      <div className="flex flex-col xl:flex-row items-center gap-8 my-auto">
        <div 
          className="relative w-32 h-32 rounded-full flex-shrink-0 shadow-sm" 
          style={{ background: total > 0 ? `conic-gradient(${gradientStops.join(', ')})` : '#f1f5f9' }}
        >
          <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
            <span className="text-xl font-extrabold text-slate-800">{total}</span>
            <span className="text-[10px] uppercase tracking-wide text-slate-400 mt-0.5">Toplam</span>
          </div>
        </div>
        <div className="flex-1 space-y-3 w-full">
          {data.map((d, i) => {
            const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
            return (
              <div key={d.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: BRAND_COLORS[i % BRAND_COLORS.length] }}></span>
                  <span className="text-slate-600 font-medium truncate max-w-[120px]" title={d.label}>{d.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-xs">% {pct}</span>
                  <span className="font-bold text-slate-800 w-6 text-right">{d.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 3. Yatay Bar Chart
function HorizontalBarChart({ rows, maxRows = 5, title }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="bg-white rounded-[16px] p-6 shadow-sm border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
        <p className="text-sm text-slate-400 italic">Veri yok.</p>
      </div>
    );
  }
  
  const items = rows.slice(0, maxRows);
  const maxVal = Math.max(...items.map((r) => r.count ?? 0), 1);

  return (
    <div className="bg-white rounded-[16px] p-6 shadow-sm border border-slate-100 h-full hover:shadow-md transition-shadow">
      <h3 className="text-sm font-semibold text-slate-700 mb-5">{title}</h3>
      <div className="space-y-4">
        {items.map((row, i) => {
          const pct = Math.round(((row.count ?? 0) / maxVal) * 100);
          return (
            <div key={i} className="flex items-center gap-4 text-sm">
              <span className="w-28 text-slate-600 font-medium truncate text-xs flex-shrink-0" title={row._id}>
                {row._id || "—"}
              </span>
              <div className="flex-1 overflow-hidden flex items-center h-2 bg-slate-100 rounded-full">
                <div
                  className="h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${pct}%`, background: BRAND_COLORS[i % BRAND_COLORS.length] }}
                />
              </div>
              <span className="w-8 text-right text-slate-800 text-xs font-bold">{row.count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Ana Sayfa ────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !getToken()) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([fetchAdminStats(), fetchAdminAnalytics()])
      .then(([sr, ar]) => {
        if (cancelled) return;
        if (sr.success) setStats(sr.data);
        if (ar.success) setAnalytics(ar.data);
      })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-slate-500 py-12 justify-center">
        <svg className="w-6 h-6 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <span className="font-medium text-sm">Dashboard Yükleniyor...</span>
      </div>
    );
  }

  if (error) return <p className="text-danger p-4 bg-danger/10 rounded-xl text-sm">{error}</p>;

  // Data mapping
  const ov = analytics?.overview ?? {};
  const ps = analytics?.priceStats ?? {};
  const ra = analytics?.recentActivity ?? {};

  const listingTypeData = analytics?.byListingType?.map(item => ({
    label: item._id === "SATILIK" ? "Satılık" : "Kiralık",
    value: item.count
  })) || [];

  return (
    <div className="space-y-6 pb-12 max-w-[1400px] mx-auto animate-fade-in">
      
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Genel Bakış</h2>
          <p className="text-sm text-slate-500 mt-1">Platformun güncel istatistikleri ve özet verileri</p>
        </div>
      </div>

      {/* 1. Üst Satır (KPI Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Toplam İlan" value={ov.total ?? stats?.total_listings} />
        <KpiCard label="Aktif İlan" value={ov.active ?? stats?.active_listings} />
        <KpiCard label="Satıldı" value={ov.sold} />
        <KpiCard label="Kullanıcı Sayısı" value={ov.totalUsers ?? stats?.total_users} />
      </div>

      {/* 2. Orta Grid: Sol (60%) ve Sağ (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sol Sütun (60%) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Fiyat Özetleri (3'lü Yan Yana Kart) */}
          {(ps.avg > 0 || ps.min > 0 || ps.max > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-slate-50 to-white rounded-[16px] p-5 shadow-sm border border-slate-100 flex flex-col justify-center hover:shadow-md transition-shadow">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> En Düşük Fiyat
                </p>
                <p className="text-xl font-extrabold text-slate-700">{formatPrice(ps.min)}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[16px] p-5 shadow-sm shadow-blue-900/10 text-white flex flex-col justify-center transform hover:-translate-y-0.5 transition-transform">
                <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-300"></span> Ortalama Fiyat
                </p>
                <p className="text-xl font-extrabold text-white">{formatPrice(ps.avg)}</p>
              </div>
              <div className="bg-gradient-to-br from-slate-50 to-white rounded-[16px] p-5 shadow-sm border border-slate-100 flex flex-col justify-center hover:shadow-md transition-shadow">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> En Yüksek Fiyat
                </p>
                <p className="text-xl font-extrabold text-slate-700">{formatPrice(ps.max)}</p>
              </div>
            </div>
          )}

          {/* Kategori Dağılımı (Yatay Bar Chart) */}
          <HorizontalBarChart rows={analytics?.byCategory} title="Kategoriye Göre Dağılım" maxRows={6} />
          
        </div>

        {/* Sağ Sütun (40%) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* İlan Tipi Dağılımı (Donut Chart) */}
          <CSSDonutChart data={listingTypeData} title="İlan Tipi Dağılımı" />

          {/* Şehir Dağılımı (Kısa Liste) */}
          <HorizontalBarChart rows={analytics?.byCity} title="Şehre Göre Yoğunluk" maxRows={5} />
          
        </div>
      </div>

      {/* 3. Alt Satır (Son 30 Gün Özetleri) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[16px] p-6 shadow-sm border border-slate-100 flex items-center gap-6 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-[14px] bg-blue-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Son 30 Gün: Eklenen</h3>
            <p className="text-3xl font-extrabold text-slate-800">{ra.newListings30d || 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-[16px] p-6 shadow-sm border border-slate-100 flex items-center gap-6 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-[14px] bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Son 30 Gün: Satılan</h3>
            <p className="text-3xl font-extrabold text-slate-800">{ra.soldListings30d || 0}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
