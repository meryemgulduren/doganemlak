import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronUp, Search, X, User } from "lucide-react";
import samsunData from "../data/samsun-geo.json";
import { fetchPublicConsultants } from "../api/consultants";

const ROOM_COUNT_OPTIONS = ["1+0", "1+1", "2+1", "3+1", "4+1", "4+2", "5+1", "5+2", "6+1", "6+2", "7+2", "8+2", "9+2", "9+ üstü"];
const BUILDING_AGE_OPTIONS = ["0", "1-5", "6-10", "11-15", "16-20", "21-25", "26-30", "31 ve üzeri"];
const HEATING_OPTIONS = ["Yok", "Soba", "Kat Kaloriferi", "Doğalgaz Sobası", "Merkezi", "Merkezi (Pay Ölçer)", "Kombi", "Yerden Isıtma"];
const USING_STATUS_OPTIONS = ["Boş", "Kiracılı", "Mal Sahibi"];
const CATEGORY_OPTIONS = [
  { value: "KONUT", label: "Konut" },
  { value: "IS_YERI", label: "İş Yeri" },
  { value: "ARSA", label: "Arsa" },
  { value: "BINA", label: "Bina" }
];
const SUB_TYPE_OPTIONS = {
  KONUT: [
    { value: "DAIRE", label: "Daire" },
    { value: "MUSTAKIL_VILLA", label: "Müstakil / Villa" },
    { value: "YAZLIK", label: "Yazlık" },
    { value: "RESIDENCE", label: "Rezidans" }
  ],
  IS_YERI: [
    { value: "OFIS", label: "Ofis / Büro" },
    { value: "DUKKAN", label: "Dükkan / Mağaza" },
    { value: "DEPO", label: "Depo / Antrepo" }
  ]
};
const LISTING_TYPE_OPTIONS = [
  { value: "SATILIK", label: "Satılık" },
  { value: "KIRALIK", label: "Kiralık" }
];
const ZONING_STATUS_OPTIONS = ["Konut", "Ticari", "Sanayi", "Turizm", "Eğitim", "Sağlık", "Bağ & Bahçe", "Tarla", "İmarsız"];
const TITLE_DEED_OPTIONS = ["Kat Mülkiyeti", "Kat İrtifakı", "Arsa Tapusu"];
const SWAP_OPTIONS = ["Evet", "Hayır"];
const GABARI_OPTIONS = ["Serbest", "6.50", "9.50", "12.50", "15.50", "18.50", "21.50", "24.50"];
const KAKS_OPTIONS = ["0.10", "0.20", "0.30", "0.40", "0.50", "0.75", "1.00", "1.50", "2.00", "Serbest"];

export default function FilterSidebar({ className = "", totalCount = 0 }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [expanded, setExpanded] = useState({
    category: true,
    location: true,
    price: true,
    area: true,
    details: true,
  });

  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    subType: searchParams.get("subType") || "",
    listing_type: searchParams.get("listing_type") || "",
    city: searchParams.get("city") || "Samsun",
    district: searchParams.get("district") || "",
    neighborhood: searchParams.get("neighborhood") || "",
    minPrice: searchParams.get("min_price") || "",
    maxPrice: searchParams.get("max_price") || "",
    min_m2_brut: searchParams.get("min_m2_brut") || "",
    max_m2_brut: searchParams.get("max_m2_brut") || "",
    room_count: searchParams.get("room_count") ? searchParams.get("room_count").split(",") : [],
    building_age: searchParams.get("building_age") || "",
    heating_type: searchParams.get("heating_type") || "",
    floor_number: searchParams.get("floor_number") || "",
    total_floors: searchParams.get("total_floors") || "",
    bathroom_count: searchParams.get("bathroom_count") || "",
    using_status: searchParams.get("using_status") || "",
    balcony: searchParams.get("balcony") === "true",
    furnished: searchParams.get("furnished") === "true",
    credit_eligible: searchParams.get("credit_eligible") === "true",
    admin_id: searchParams.get("admin_id") || "",
    zoning_status: searchParams.get("zoning_status") || "",
    title_deed_status: searchParams.get("title_deed_status") || "",
    swap_option: searchParams.get("swap_option") || "",
    ada_no: searchParams.get("ada_no") || "",
    parsel_no: searchParams.get("parsel_no") || "",
    pafta_no: searchParams.get("pafta_no") || "",
    kaks_emsal: searchParams.get("kaks_emsal") || "",
    gabari: searchParams.get("gabari") || "",
  });

  const [consultants, setConsultants] = useState([]);
  const [previewCount, setPreviewCount] = useState(totalCount);
  const [loadingCount, setLoadingCount] = useState(false);

  useEffect(() => {
    fetchPublicConsultants().then(res => {
      if (res.success) setConsultants(res.data || []);
    });
  }, []);

  // Real-time count update
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoadingCount(true);
      try {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            if (value.length > 0) params.set(key, value.join(","));
          } else if (typeof value === "boolean") {
            if (value) params.set(key, "true");
          } else if (value) {
            if (key === "minPrice") params.set("min_price", value);
            else if (key === "maxPrice") params.set("max_price", value);
            else params.set(key, value);
          }
        });
        params.set("limit", "1");
        const res = await fetch(`/api/listings?${params.toString()}`).then(r => r.json());
        if (res.success) {
          setPreviewCount(res.pagination.total);
        }
      } catch (err) {
        console.error("Count fetch error:", err);
      } finally {
        setLoadingCount(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

  const toggleExpand = (section) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    const next = new URLSearchParams(searchParams);
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) next.set(key, value.join(","));
        else next.delete(key);
      } else if (typeof value === "boolean") {
        if (value) next.set(key, "true");
        else next.delete(key);
      } else if (value) {
        if (key === "minPrice") next.set("min_price", value);
        else if (key === "maxPrice") next.set("max_price", value);
        else next.set(key, value);
      } else {
        if (key === "minPrice") next.delete("min_price");
        else if (key === "maxPrice") next.delete("max_price");
        else next.delete(key);
      }
    });
    next.delete("page");
    setSearchParams(next);
  };

  const handleClear = () => {
    setFilters({
      category: "",
      subType: "",
      listing_type: "",
      city: "Samsun",
      district: "",
      neighborhood: "",
      minPrice: "",
      maxPrice: "",
      min_m2_brut: "",
      max_m2_brut: "",
      room_count: [],
      building_age: "",
      heating_type: "",
      floor_number: "",
      total_floors: "",
      bathroom_count: "",
      using_status: "",
      balcony: false,
      furnished: false,
      credit_eligible: false,
      admin_id: "",
      zoning_status: "",
      title_deed_status: "",
      swap_option: "",
      ada_no: "",
      parsel_no: "",
      pafta_no: "",
      kaks_emsal: "",
      gabari: "",
    });
    setSearchParams({});
  };

  const selectedDistrictData = samsunData.districts.find(d => d.name === filters.district);
  const currentSubTypes = SUB_TYPE_OPTIONS[filters.category] || [];

  return (
    <aside className={`w-full lg:w-72 bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm h-fit sticky top-24 ${className}`}>
      <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
        <h3 className="font-bold text-neutral-900 flex items-center gap-2">
          <Search className="w-4 h-4 text-amber-500" />
          İlan Filtrele
        </h3>
        <button onClick={handleClear} className="text-xs font-semibold text-neutral-400 hover:text-red-500 flex items-center gap-1 transition-colors">
          <X className="w-3 h-3" />
          Temizle
        </button>
      </div>

      <div className="divide-y divide-neutral-100 h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
        {/* Kategori ve Tip */}
        <div className="p-5">
           <button 
            onClick={() => toggleExpand('category')}
            className="w-full flex items-center justify-between text-[13px] font-bold text-neutral-800 mb-3 hover:text-black transition-colors"
          >
            Kategori ve İlan Tipi
            {expanded.category ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {expanded.category && (
            <div className="space-y-3">
              <select 
                value={filters.category} 
                onChange={(e) => {
                  updateFilter('category', e.target.value);
                  updateFilter('subType', '');
                  // Clear details when category changes
                  setFilters(prev => ({
                    ...prev,
                    category: e.target.value,
                    subType: '',
                    room_count: [],
                    building_age: "",
                    heating_type: "",
                    floor_number: "",
                    total_floors: "",
                    bathroom_count: "",
                    using_status: "",
                    balcony: false,
                    furnished: false,
                    zoning_status: "",
                    title_deed_status: "",
                    swap_option: "",
                    ada_no: "",
                    parsel_no: "",
                    pafta_no: "",
                    kaks_emsal: "",
                    gabari: "",
                  }));
                }}
                className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
              >
                <option value="">Tüm Kategoriler</option>
                {CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>

              {currentSubTypes.length > 0 && (
                <select 
                  value={filters.subType} 
                  onChange={(e) => updateFilter('subType', e.target.value)}
                  className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                >
                  <option value="">Alt Tip Seçin</option>
                  {currentSubTypes.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              )}

              <select 
                value={filters.listing_type} 
                onChange={(e) => updateFilter('listing_type', e.target.value)}
                className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
              >
                <option value="">Satılık / Kiralık</option>
                {LISTING_TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Adres */}
        <div className="p-5">
          <button 
            onClick={() => toggleExpand('location')}
            className="w-full flex items-center justify-between text-[13px] font-bold text-neutral-800 mb-3 hover:text-black transition-colors"
          >
            Adres Bilgileri
            {expanded.location ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {expanded.location && (
            <div className="space-y-3 mt-1">
              <select 
                value={filters.city} 
                onChange={(e) => updateFilter('city', e.target.value)}
                className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
              >
                <option value="Samsun">Samsun</option>
              </select>
              <select 
                value={filters.district} 
                onChange={(e) => {
                   updateFilter('district', e.target.value);
                   updateFilter('neighborhood', '');
                }}
                className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
              >
                <option value="">İlçe Seçin</option>
                {samsunData.districts.map(d => (
                  <option key={d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
              <select 
                value={filters.neighborhood} 
                onChange={(e) => updateFilter('neighborhood', e.target.value)}
                disabled={!filters.district}
                className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white disabled:bg-neutral-50 disabled:text-neutral-400"
              >
                <option value="">Mahalle Seçin</option>
                {selectedDistrictData?.neighborhoods?.map(n => {
                   const nName = typeof n === 'string' ? n : n.name;
                   return <option key={nName} value={nName}>{nName}</option>;
                })}
              </select>
            </div>
          )}
        </div>

        {/* Fiyat */}
        <div className="p-5">
          <button 
            onClick={() => toggleExpand('price')}
            className="w-full flex items-center justify-between text-[13px] font-bold text-neutral-800 mb-3 hover:text-black transition-colors"
          >
            Fiyat (TL)
            {expanded.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {expanded.price && (
            <div className="grid grid-cols-2 items-center gap-3 mt-1">
              <input 
                type="number" 
                placeholder="Min" 
                value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
                className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
              />
              <input 
                type="number" 
                placeholder="Max" 
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
              />
            </div>
          )}
        </div>

        {/* Metrekare */}
        <div className="p-5">
          <button 
            onClick={() => toggleExpand('area')}
            className="w-full flex items-center justify-between text-[13px] font-bold text-neutral-800 mb-3 hover:text-black transition-colors"
          >
            Metrekare (Brüt)
            {expanded.area ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {expanded.area && (
            <div className="grid grid-cols-2 items-center gap-3 mt-1">
              <input 
                type="number" 
                placeholder="Min" 
                value={filters.min_m2_brut}
                onChange={(e) => updateFilter('min_m2_brut', e.target.value)}
                className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
              />
              <input 
                type="number" 
                placeholder="Max" 
                value={filters.max_m2_brut}
                onChange={(e) => updateFilter('max_m2_brut', e.target.value)}
                className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
              />
            </div>
          )}
        </div>

        {/* Danışman Filtresi (Her zaman görünür) */}
        <div className="p-5">
           <button 
            className="w-full flex items-center justify-between text-[13px] font-bold text-neutral-800 mb-3"
            disabled
          >
            Danışman
            <User className="w-4 h-4 text-neutral-400" />
          </button>
          <select 
            value={filters.admin_id} 
            onChange={(e) => updateFilter('admin_id', e.target.value)}
            className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
          >
            <option value="">Tüm Danışmanlar</option>
            {consultants.map(c => (
              <option key={c._id} value={c._id}>
                {c.first_name || c.last_name ? `${c.first_name || ''} ${c.last_name || ''}`.trim() : c.username}
              </option>
            ))}
          </select>
        </div>

        {/* Gayrimenkul Detayları (DAİRE/KONUT) */}
        {filters.category === "KONUT" && (
          <div className="p-5">
            <button 
              onClick={() => toggleExpand('details')}
              className="w-full flex items-center justify-between text-[13px] font-bold text-neutral-800 mb-3 hover:text-black transition-colors"
            >
              Konut Özellikleri
              {expanded.details ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expanded.details && (
              <div className="space-y-5 mt-1">
                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Oda Sayısı</label>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {ROOM_COUNT_OPTIONS.map(opt => (
                      <label key={opt} className="flex items-center gap-2 text-[13px] text-neutral-600 hover:text-black cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={filters.room_count.includes(opt)}
                          onChange={(e) => {
                            const next = e.target.checked 
                              ? [...filters.room_count, opt]
                              : filters.room_count.filter(c => c !== opt);
                            updateFilter('room_count', next);
                          }}
                          className="w-4 h-4 rounded border-neutral-300 text-amber-500 focus:ring-amber-500 transition-all"
                        />
                        <span className="group-hover:translate-x-0.5 transition-transform">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Bina Yaşı</label>
                    <select 
                      value={filters.building_age}
                      onChange={(e) => updateFilter('building_age', e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    >
                      <option value="">Belirtilmemiş</option>
                      {BUILDING_AGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Isıtma</label>
                    <select 
                      value={filters.heating_type}
                      onChange={(e) => updateFilter('heating_type', e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    >
                      <option value="">Belirtilmemiş</option>
                      {HEATING_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Bulunduğu Kat</label>
                    <input 
                      type="number" 
                      placeholder="Eğ. 3"
                      value={filters.floor_number}
                      onChange={(e) => updateFilter('floor_number', e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Banyo Sayısı</label>
                    <input 
                      type="number" 
                      placeholder="Eğ. 2"
                      value={filters.bathroom_count}
                      onChange={(e) => updateFilter('bathroom_count', e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-3 border-t border-neutral-50">
                  <label className="flex items-center gap-3 text-[13px] font-medium text-neutral-700 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={filters.balcony}
                      onChange={(e) => updateFilter('balcony', e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-300 text-amber-500 focus:ring-amber-500 transition-all"
                    />
                    <span className="group-hover:text-black transition-colors">Balkon Var</span>
                  </label>
                  <label className="flex items-center gap-3 text-[13px] font-medium text-neutral-700 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={filters.furnished}
                      onChange={(e) => updateFilter('furnished', e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-300 text-amber-500 focus:ring-amber-500 transition-all"
                    />
                    <span className="group-hover:text-black transition-colors">Eşyalı</span>
                  </label>
                  <label className="flex items-center gap-3 text-[13px] font-medium text-neutral-700 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={filters.credit_eligible}
                      onChange={(e) => updateFilter('credit_eligible', e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-300 text-amber-500 focus:ring-amber-500 transition-all"
                    />
                    <span className="group-hover:text-black transition-colors">Krediye Uygun</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Arsa Özellikleri (ARSA) */}
        {filters.category === "ARSA" && (
          <div className="p-5">
            <button 
              onClick={() => toggleExpand('details')}
              className="w-full flex items-center justify-between text-[13px] font-bold text-neutral-800 mb-3 hover:text-black transition-colors"
            >
              Arsa Özellikleri
              {expanded.details ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expanded.details && (
              <div className="space-y-4 mt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">İmar Durumu</label>
                  <select 
                    value={filters.zoning_status}
                    onChange={(e) => updateFilter('zoning_status', e.target.value)}
                    className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                  >
                    <option value="">Seçiniz</option>
                    {ZONING_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Tapu Durumu</label>
                  <select 
                    value={filters.title_deed_status}
                    onChange={(e) => updateFilter('title_deed_status', e.target.value)}
                    className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                  >
                    <option value="">Seçiniz</option>
                    {TITLE_DEED_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Ada No</label>
                    <input 
                      type="text" 
                      value={filters.ada_no}
                      onChange={(e) => updateFilter('ada_no', e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Parsel No</label>
                    <input 
                      type="text" 
                      value={filters.parsel_no}
                      onChange={(e) => updateFilter('parsel_no', e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Takaslı</label>
                  <select 
                    value={filters.swap_option}
                    onChange={(e) => updateFilter('swap_option', e.target.value)}
                    className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                  >
                    <option value="">Seçiniz</option>
                    {SWAP_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-5 bg-white border-t border-neutral-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] relative z-10">
        <button 
          onClick={handleApply}
          disabled={loadingCount}
          className="w-full bg-amber-400 hover:bg-amber-500 text-black font-bold py-3.5 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] hover:shadow-lg hover:shadow-amber-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loadingCount ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Hesaplanıyor...
            </span>
          ) : (
            previewCount > 0 ? `${previewCount} İlanı Göster` : "Sonuçları Göster"
          )}
        </button>
      </div>
    </aside>
  );
}
