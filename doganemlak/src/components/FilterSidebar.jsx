import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronUp, Search, X, User } from "lucide-react";
import samsunData from "../data/samsun-geo.json";
import { fetchPublicConsultants } from "../api/consultants";

const ROOM_COUNT_OPTIONS = ["1+0", "1+1", "2+1", "3+1", "4+1", "4+2", "5+1", "5+2", "6+1", "6+2", "7+2", "8+2", "9+2", "9+ üstü"];
const BUILDING_AGE_OPTIONS = ["0", "1-5", "6-10", "11-15", "16-20", "21-25", "26-30", "31 ve üzeri"];
const HEATING_OPTIONS = ["Yok", "Soba", "Kat Kaloriferi", "Doğalgaz Sobası", "Merkezi", "Merkezi (Pay Ölçer)", "Kombi", "Yerden Isıtma"];
const USING_STATUS_OPTIONS = ["Boş", "Kiracılı", "Mal Sahibi"];
const PROPERTY_CONDITION_OPTIONS = ["Sıfır", "İkinci El"];
const HAS_TENANT_OPTIONS = ["Evet", "Hayır"];
const GROUND_SURVEY_OPTIONS = ["Var", "Yok"];
const BINA_TYPE_OPTIONS = ["Apartman", "İş Hanı", "Müstakil", "Villa"];
const KONUT_DAIRE_BUILDING_AGE_OPTIONS = ["0", "1-5", "6-10", "11-15", "16-20", "21-25", "26-30", "31 ve üzeri"];
const FLOOR_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"];
const TOTAL_FLOOR_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11-15", "16-20", "20+"];
/** Konut > Daire: görseldeki isıtma listesi (HEATING_OPTIONS ile aynı) */
const KONUT_DAIRE_HEATING_OPTIONS = [...HEATING_OPTIONS];
const BATHROOM_OPTIONS = ["1", "2", "3", "4", "5", "6", "6 Üzeri"];
const KITCHEN_OPTIONS = ["Açık (Amerikan)", "Kapalı"];
const PARKING_OPTIONS = ["Açık Otopark", "Kapalı Otopark", "Açık & Kapalı Otopark", "Yok"];
const APARTMENT_COUNT_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
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
    { value: "DEPO", label: "Depo / Antrepo" },
    { value: "KOMPLE_BINA", label: "Komple Bina" }
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
    subType: searchParams.get("subType") || searchParams.get("sub_type") || "",
    listing_type: searchParams.get("listing_type") || "",
    city: searchParams.get("city") || "Samsun",
    district: searchParams.get("district") || "",
    neighborhood: searchParams.get("neighborhood") || "",
    minPrice: searchParams.get("min_price") || "",
    maxPrice: searchParams.get("max_price") || "",
    min_m2_brut: searchParams.get("min_m2_brut") || "",
    max_m2_brut: searchParams.get("max_m2_brut") || "",
    min_m2_net: searchParams.get("min_m2_net") || "",
    max_m2_net: searchParams.get("max_m2_net") || "",
    min_open_area_m2: searchParams.get("min_open_area_m2") || "",
    max_open_area_m2: searchParams.get("max_open_area_m2") || "",
    min_total_floors: searchParams.get("min_total_floors") || "",
    max_total_floors: searchParams.get("max_total_floors") || "",
    room_count: searchParams.get("room_count") ? searchParams.get("room_count").split(",") : [],
    building_age: searchParams.get("building_age") || "",
    heating_type: searchParams.get("heating_type") ? searchParams.get("heating_type").split(",") : [],
    floor_number: searchParams.get("floor_number") ? searchParams.get("floor_number").split(",") : [],
    total_floors: searchParams.get("total_floors") ? searchParams.get("total_floors").split(",") : [],
    bathroom_count: searchParams.get("bathroom_count") ? searchParams.get("bathroom_count").split(",") : [],
    apartment_count: searchParams.get("apartment_count") || "",
    using_status: searchParams.get("using_status") || "",
    property_condition: searchParams.get("property_condition") || "",
    has_tenant: searchParams.get("has_tenant") || "",
    ground_survey: searchParams.get("ground_survey") || "",
    bina_type: searchParams.get("bina_type") || "",
    balcony: searchParams.get("balcony") === "true",
    furnished: searchParams.get("furnished") === "true",
    credit_eligible: searchParams.get("credit_eligible") === "true",
    kitchen_type: searchParams.get("kitchen_type") ? searchParams.get("kitchen_type").split(",") : [],
    balcony_type: searchParams.get("balcony_type") ? searchParams.get("balcony_type").split(",") : [],
    elevator_type: searchParams.get("elevator_type") ? searchParams.get("elevator_type").split(",") : [],
    parking_type: searchParams.get("parking_type") ? searchParams.get("parking_type").split(",") : [],
    furnished_choice: searchParams.get("furnished_choice") || "",
    in_site_choice: searchParams.get("in_site_choice") || "",
    credit_eligible_choice:
      searchParams.get("credit_eligible_choice") ||
      (searchParams.get("credit_eligible") === "true"
        ? "Evet"
        : searchParams.get("credit_eligible") === "false"
          ? "Hayır"
          : ""),
    swap_choice: searchParams.get("swap_choice") || "",
    admin_id: searchParams.get("admin_id") || "",
    zoning_status: searchParams.get("zoning_status") || "",
    title_deed_status: searchParams.get("title_deed_status") || "",
    swap_option: searchParams.get("swap_option") || "",
    min_ada_no: searchParams.get("min_ada_no") || "",
    max_ada_no: searchParams.get("max_ada_no") || "",
    min_parsel_no: searchParams.get("min_parsel_no") || "",
    max_parsel_no: searchParams.get("max_parsel_no") || "",
    kaks_emsal: searchParams.get("kaks_emsal") || "",
    gabari: searchParams.get("gabari") || "",
  });

  const [consultants, setConsultants] = useState([]);
  const [previewCount, setPreviewCount] = useState(totalCount);
  const [loadingCount, setLoadingCount] = useState(false);

  const buildParamsFromFilters = (state) => {
    const params = new URLSearchParams();

    Object.entries(state).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) params.set(key, value.join(","));
        return;
      }
      if (typeof value === "boolean") {
        if (value) params.set(key, "true");
        return;
      }
      if (value != null && String(value).trim() !== "") {
        if (key === "minPrice") params.set("min_price", value);
        else if (key === "maxPrice") params.set("max_price", value);
        else params.set(key, value);
      }
    });

    // DAIRE dalındaki UI yardımcı alanlarını API'nin gerçek alanlarına çevir (boolean kolonlar).
    const boolMap = [
      ["furnished_choice", "furnished"],
      ["in_site_choice", "in_site"],
      ["credit_eligible_choice", "credit_eligible"],
    ];
    boolMap.forEach(([sourceKey, targetKey]) => {
      const value = state[sourceKey];
      if (value === "Evet") params.set(targetKey, "true");
      else if (value === "Hayır") params.set(targetKey, "false");
    });

    if (!String(state.credit_eligible_choice || "").trim()) {
      if (state.credit_eligible === true) params.set("credit_eligible", "true");
      else params.delete("credit_eligible");
    }

    // Takaslı: DB'de swap_option string "Evet"/"Hayır" (boolean değil).
    if (state.swap_choice === "Evet") params.set("swap_option", "Evet");
    else if (state.swap_choice === "Hayır") params.set("swap_option", "Hayır");

    if (Array.isArray(state.balcony_type) && state.balcony_type.length > 0) {
      const hasVar = state.balcony_type.includes("Var");
      const hasYok = state.balcony_type.includes("Yok");
      if (hasVar && !hasYok) params.set("balcony", "true");
      if (hasYok && !hasVar) params.set("balcony", "false");
    }

    if (Array.isArray(state.elevator_type) && state.elevator_type.length > 0) {
      params.set("elevator", state.elevator_type.join(","));
    }
    if (Array.isArray(state.parking_type) && state.parking_type.length > 0) {
      params.set("parking", state.parking_type.join(","));
    }
    // Yardımcı alanları URL'e taşımayalım
    [
      "furnished_choice",
      "in_site_choice",
      "credit_eligible_choice",
      "swap_choice",
      "balcony_type",
      "elevator_type",
      "parking_type",
    ].forEach((k) => params.delete(k));

    return params;
  };

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
        const params = buildParamsFromFilters(filters);
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
    const params = buildParamsFromFilters(filters);
    for (const key of new Set([...next.keys(), ...params.keys()])) {
      if (params.has(key)) next.set(key, params.get(key));
      else next.delete(key);
    }
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
      min_m2_net: "",
      max_m2_net: "",
      min_open_area_m2: "",
      max_open_area_m2: "",
      min_total_floors: "",
      max_total_floors: "",
      room_count: [],
      building_age: "",
      heating_type: [],
      floor_number: [],
      total_floors: [],
      bathroom_count: [],
      apartment_count: "",
      using_status: "",
      property_condition: "",
      has_tenant: "",
      ground_survey: "",
      bina_type: "",
      balcony: false,
      furnished: false,
      credit_eligible: false,
      kitchen_type: [],
      balcony_type: [],
      elevator_type: [],
      parking_type: [],
      furnished_choice: "",
      in_site_choice: "",
      credit_eligible_choice: "",
      swap_choice: "",
      admin_id: "",
      zoning_status: "",
      title_deed_status: "",
      swap_option: "",
      min_ada_no: "",
      max_ada_no: "",
      min_parsel_no: "",
      max_parsel_no: "",
      kaks_emsal: "",
      gabari: "",
    });
    setSearchParams({});
  };

  const selectedDistrictData = samsunData.districts.find(d => d.name === filters.district);
  const currentSubTypes = SUB_TYPE_OPTIONS[filters.category] || [];
  const isSaleOrRentOrAll =
    !filters.listing_type ||
    filters.listing_type === "SATILIK" ||
    filters.listing_type === "KIRALIK";
  const isKonutDaireBranch =
    filters.category === "KONUT" &&
    (filters.subType === "DAIRE" || filters.subType === "RESIDENCE") &&
    isSaleOrRentOrAll;
  const isKonutVillaBranch =
    filters.category === "KONUT" &&
    filters.subType === "MUSTAKIL_VILLA" &&
    isSaleOrRentOrAll;
  const isKonutYazlikBranch =
    filters.category === "KONUT" &&
    filters.subType === "YAZLIK" &&
    isSaleOrRentOrAll;

  const isArsaBranch =
    filters.category === "ARSA" &&
    isSaleOrRentOrAll;

  const isBinaBranch =
    filters.category === "BINA" &&
    isSaleOrRentOrAll;

  const isIsYeriOfisBranch =
    filters.category === "IS_YERI" &&
    filters.subType === "OFIS" &&
    isSaleOrRentOrAll;
  const isIsYeriDukkanBranch =
    filters.category === "IS_YERI" &&
    (filters.subType === "DUKKAN" || filters.subType === "DUKKAN_MAGAZA") &&
    isSaleOrRentOrAll;
  const isIsYeriDepoBranch =
    filters.category === "IS_YERI" &&
    (filters.subType === "DEPO" || filters.subType === "DEPO_ANTREPO");
  const isIsYeriKompleBinaBranch =
    filters.category === "IS_YERI" &&
    filters.subType === "KOMPLE_BINA" &&
    isSaleOrRentOrAll;

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
                    heating_type: [],
                    floor_number: [],
                    total_floors: [],
                    bathroom_count: [],
                    apartment_count: "",
                    using_status: "",
                    property_condition: "",
                    has_tenant: "",
                    ground_survey: "",
                    bina_type: "",
                    balcony: false,
                    furnished: false,
                    credit_eligible: false,
                    kitchen_type: [],
                    balcony_type: [],
                    elevator_type: [],
                    parking_type: [],
                    furnished_choice: "",
                    in_site_choice: "",
                    credit_eligible_choice: "",
                    swap_choice: "",
                    zoning_status: "",
                    title_deed_status: "",
                    swap_option: "",
                    min_ada_no: "",
                    max_ada_no: "",
                    min_parsel_no: "",
                    max_parsel_no: "",
                    min_open_area_m2: "",
                    max_open_area_m2: "",
                    min_total_floors: "",
                    max_total_floors: "",
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
            Adres
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
            Fiyat
            {expanded.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {expanded.price && (
            <div className="mt-1">
              <div className="inline-flex items-center justify-center rounded-md bg-slate-500 text-white text-xs font-semibold px-3 py-1.5 mb-3">
                TL
              </div>
              <div className="grid grid-cols-2 items-center gap-3">
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

        {/* Konut > Daire > Satılık/Kiralık (özel detaylar) */}
        {isKonutDaireBranch && (
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
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">m² (Brüt)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.min_m2_brut}
                      onChange={(e) => updateFilter("min_m2_brut", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.max_m2_brut}
                      onChange={(e) => updateFilter("max_m2_brut", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">m² (Net)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.min_m2_net}
                      onChange={(e) => updateFilter("min_m2_net", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.max_m2_net}
                      onChange={(e) => updateFilter("max_m2_net", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    />
                  </div>
                </div>

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

                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Bina Yaşı</label>
                  <select
                    value={filters.building_age}
                    onChange={(e) => updateFilter("building_age", e.target.value)}
                    className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                  >
                    <option value="">Seçiniz</option>
                    {KONUT_DAIRE_BUILDING_AGE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Bulunduğu Kat</label>
                  <div className="grid grid-cols-1 gap-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {FLOOR_OPTIONS.map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-[13px] text-neutral-600 hover:text-black cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.floor_number.includes(opt)}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...filters.floor_number, opt]
                              : filters.floor_number.filter((v) => v !== opt);
                            updateFilter("floor_number", next);
                          }}
                          className="w-4 h-4 rounded border-neutral-300 text-amber-500 focus:ring-amber-500 transition-all"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Kat Sayısı</label>
                  <div className="grid grid-cols-1 gap-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {TOTAL_FLOOR_OPTIONS.map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-[13px] text-neutral-600 hover:text-black cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.total_floors.includes(opt)}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...filters.total_floors, opt]
                              : filters.total_floors.filter((v) => v !== opt);
                            updateFilter("total_floors", next);
                          }}
                          className="w-4 h-4 rounded border-neutral-300 text-amber-500 focus:ring-amber-500 transition-all"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Isıtma</label>
                  <div className="grid grid-cols-1 gap-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {KONUT_DAIRE_HEATING_OPTIONS.map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-[13px] text-neutral-600 hover:text-black cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.heating_type.includes(opt)}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...filters.heating_type, opt]
                              : filters.heating_type.filter((v) => v !== opt);
                            updateFilter("heating_type", next);
                          }}
                          className="w-4 h-4 rounded border-neutral-300 text-amber-500 focus:ring-amber-500 transition-all"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Banyo Sayısı</label>
                  <div className="grid grid-cols-1 gap-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {BATHROOM_OPTIONS.map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-[13px] text-neutral-600 hover:text-black cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.bathroom_count.includes(opt)}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...filters.bathroom_count, opt]
                              : filters.bathroom_count.filter((v) => v !== opt);
                            updateFilter("bathroom_count", next);
                          }}
                          className="w-4 h-4 rounded border-neutral-300 text-amber-500 focus:ring-amber-500 transition-all"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Mutfak</label>
                  <div className="grid grid-cols-1 gap-y-2">
                    {KITCHEN_OPTIONS.map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-[13px] text-neutral-600 hover:text-black cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.kitchen_type.includes(opt)}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...filters.kitchen_type, opt]
                              : filters.kitchen_type.filter((v) => v !== opt);
                            updateFilter("kitchen_type", next);
                          }}
                          className="w-4 h-4 rounded border-neutral-300 text-amber-500 focus:ring-amber-500 transition-all"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Balkon</label>
                    <div className="space-y-2">
                      {["Var", "Yok"].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 text-[13px] text-neutral-600 hover:text-black cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.balcony_type.includes(opt)}
                            onChange={(e) => {
                              const next = e.target.checked
                                ? [...filters.balcony_type, opt]
                                : filters.balcony_type.filter((v) => v !== opt);
                              updateFilter("balcony_type", next);
                            }}
                            className="w-4 h-4 rounded border-neutral-300 text-amber-500 focus:ring-amber-500 transition-all"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Asansör</label>
                    <div className="space-y-2">
                      {["Var", "Yok"].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 text-[13px] text-neutral-600 hover:text-black cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.elevator_type.includes(opt)}
                            onChange={(e) => {
                              const next = e.target.checked
                                ? [...filters.elevator_type, opt]
                                : filters.elevator_type.filter((v) => v !== opt);
                              updateFilter("elevator_type", next);
                            }}
                            className="w-4 h-4 rounded border-neutral-300 text-amber-500 focus:ring-amber-500 transition-all"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Otopark</label>
                  <div className="space-y-2">
                    {PARKING_OPTIONS.map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-[13px] text-neutral-600 hover:text-black cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.parking_type.includes(opt)}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...filters.parking_type, opt]
                              : filters.parking_type.filter((v) => v !== opt);
                            updateFilter("parking_type", next);
                          }}
                          className="w-4 h-4 rounded border-neutral-300 text-amber-500 focus:ring-amber-500 transition-all"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Eşyalı</label>
                  <div className="space-y-2">
                    {["Evet", "Hayır"].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-[13px] text-neutral-600 hover:text-black cursor-pointer">
                        <input
                          type="radio"
                          name="furnished_choice"
                          checked={filters.furnished_choice === opt}
                          onChange={() => updateFilter("furnished_choice", opt)}
                          className="w-4 h-4 border-neutral-300 text-amber-500 focus:ring-amber-500 transition-all"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Kullanım Durumu</label>
                  <div className="space-y-2">
                    {USING_STATUS_OPTIONS.map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-[13px] text-neutral-600 hover:text-black cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.using_status.split(",").includes(opt)}
                          onChange={(e) => {
                            const arr = filters.using_status ? filters.using_status.split(",").filter(Boolean) : [];
                            const next = e.target.checked ? [...arr, opt] : arr.filter((v) => v !== opt);
                            updateFilter("using_status", next.join(","));
                          }}
                          className="w-4 h-4 rounded border-neutral-300 text-amber-500 focus:ring-amber-500 transition-all"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Site İçerisinde</label>
                    <div className="space-y-2">
                      {["Evet", "Hayır"].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 text-[13px] text-neutral-600 hover:text-black cursor-pointer">
                          <input
                            type="radio"
                            name="in_site_choice"
                            checked={filters.in_site_choice === opt}
                            onChange={() => updateFilter("in_site_choice", opt)}
                            className="w-4 h-4 border-neutral-300 text-amber-500 focus:ring-amber-500 transition-all"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Krediye Uygun</label>
                    <div className="space-y-2">
                      {["Evet", "Hayır"].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 text-[13px] text-neutral-600 hover:text-black cursor-pointer">
                          <input
                            type="radio"
                            name="credit_eligible_choice"
                            checked={filters.credit_eligible_choice === opt}
                            onChange={() => updateFilter("credit_eligible_choice", opt)}
                            className="w-4 h-4 border-neutral-300 text-amber-500 focus:ring-amber-500 transition-all"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Tapu Durumu</label>
                  <select
                    value={filters.title_deed_status}
                    onChange={(e) => updateFilter("title_deed_status", e.target.value)}
                    className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                  >
                    <option value="">Seçiniz</option>
                    {TITLE_DEED_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Takaslı</label>
                  <div className="space-y-2">
                    {["Evet", "Hayır"].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-[13px] text-neutral-600 hover:text-black cursor-pointer">
                        <input
                          type="radio"
                          name="swap_choice"
                          checked={filters.swap_choice === opt}
                          onChange={() => updateFilter("swap_choice", opt)}
                          className="w-4 h-4 border-neutral-300 text-amber-500 focus:ring-amber-500 transition-all"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Konut > Müstakil Ev/Villa veya Yazlık — yalnızca Satılık veya Kiralık */}
        {(isKonutVillaBranch || isKonutYazlikBranch) && (
          <div className="p-5">
            <button
              onClick={() => toggleExpand("details")}
              className="w-full flex items-center justify-between text-[13px] font-bold text-neutral-800 mb-3 hover:text-black transition-colors"
            >
              Konut Özellikleri
              {expanded.details ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expanded.details && (
              <div className="space-y-5 mt-1">
                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">m² (Brüt)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.min_m2_brut}
                      onChange={(e) => updateFilter("min_m2_brut", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.max_m2_brut}
                      onChange={(e) => updateFilter("max_m2_brut", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">m² (Net)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.min_m2_net}
                      onChange={(e) => updateFilter("min_m2_net", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.max_m2_net}
                      onChange={(e) => updateFilter("max_m2_net", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Açık Alan m²</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.min_open_area_m2}
                      onChange={(e) => updateFilter("min_open_area_m2", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.max_open_area_m2}
                      onChange={(e) => updateFilter("max_open_area_m2", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">Oda Sayısı</label>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {ROOM_COUNT_OPTIONS.map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-[13px] text-neutral-600 hover:text-black cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.room_count.includes(opt)}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...filters.room_count, opt]
                              : filters.room_count.filter((v) => v !== opt);
                            updateFilter("room_count", next);
                          }}
                          className="w-4 h-4 rounded border-neutral-300 text-amber-500 focus:ring-amber-500 transition-all"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Bina Yaşı</label>
                    <select
                      value={filters.building_age}
                      onChange={(e) => updateFilter("building_age", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    >
                      <option value="">Seçiniz</option>
                      {BUILDING_AGE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Kat Sayısı</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.min_total_floors}
                        onChange={(e) => updateFilter("min_total_floors", e.target.value)}
                        className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.max_total_floors}
                        onChange={(e) => updateFilter("max_total_floors", e.target.value)}
                        className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Isıtma</label>
                    <select
                      value={filters.heating_type[0] || ""}
                      onChange={(e) => updateFilter("heating_type", e.target.value ? [e.target.value] : [])}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    >
                      <option value="">Seçiniz</option>
                      {HEATING_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Banyo Sayısı</label>
                    <select
                      value={filters.bathroom_count[0] || ""}
                      onChange={(e) => updateFilter("bathroom_count", e.target.value ? [e.target.value] : [])}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    >
                      <option value="">Seçiniz</option>
                      {BATHROOM_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Mutfak</label>
                    <select
                      value={filters.kitchen_type[0] || ""}
                      onChange={(e) => updateFilter("kitchen_type", e.target.value ? [e.target.value] : [])}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    >
                      <option value="">Seçiniz</option>
                      {KITCHEN_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Otopark</label>
                    <select
                      value={filters.parking_type[0] || ""}
                      onChange={(e) => updateFilter("parking_type", e.target.value ? [e.target.value] : [])}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    >
                      <option value="">Seçiniz</option>
                      {PARKING_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Kullanım Durumu</label>
                    <select
                      value={filters.using_status}
                      onChange={(e) => updateFilter("using_status", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    >
                      <option value="">Seçiniz</option>
                      {USING_STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Tapu Durumu</label>
                    <select
                      value={filters.title_deed_status}
                      onChange={(e) => updateFilter("title_deed_status", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    >
                      <option value="">Seçiniz</option>
                      {TITLE_DEED_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Krediye Uygun</label>
                    <select
                      value={filters.credit_eligible_choice}
                      onChange={(e) => updateFilter("credit_eligible_choice", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    >
                      <option value="">Seçiniz</option>
                      <option value="Evet">Evet</option>
                      <option value="Hayır">Hayır</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Takaslı</label>
                    <select
                      value={filters.swap_option}
                      onChange={(e) => updateFilter("swap_option", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    >
                      <option value="">Seçiniz</option>
                      {SWAP_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Gayrimenkul Detayları (genel KONUT) */}
        {filters.category === "KONUT" && !isKonutDaireBranch && !isKonutVillaBranch && !isKonutYazlikBranch && (
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
              </div>
            )}
          </div>
        )}

        {/* İş Yeri > Ofis/Büro, Dükkan/Mağaza, Depo/Antrepo, Komple Bina — yalnızca Satılık veya Kiralık */}
        {(isIsYeriOfisBranch || isIsYeriDukkanBranch || isIsYeriDepoBranch || isIsYeriKompleBinaBranch) && (
          <div className="p-5">
            <button
              onClick={() => toggleExpand("details")}
              className="w-full flex items-center justify-between text-[13px] font-bold text-neutral-800 mb-3 hover:text-black transition-colors"
            >
              İş Yeri Özellikleri
              {expanded.details ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expanded.details && (
              <div className="space-y-4 mt-1">
                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">m² (Net)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.min_m2_net}
                      onChange={(e) => updateFilter("min_m2_net", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.max_m2_net}
                      onChange={(e) => updateFilter("max_m2_net", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    />
                  </div>
                </div>

                {isIsYeriKompleBinaBranch && (
                  <div>
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2 block">m² (Brüt)</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.min_m2_brut}
                        onChange={(e) => updateFilter("min_m2_brut", e.target.value)}
                        className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.max_m2_brut}
                        onChange={(e) => updateFilter("max_m2_brut", e.target.value)}
                        className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {!isIsYeriKompleBinaBranch && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Oda Sayısı</label>
                      <select
                        value={filters.room_count[0] || ""}
                        onChange={(e) => updateFilter("room_count", e.target.value ? [e.target.value] : [])}
                        className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                      >
                        <option value="">Seçiniz</option>
                        {ROOM_COUNT_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Bina Yaşı</label>
                    <select
                      value={filters.building_age}
                      onChange={(e) => updateFilter("building_age", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    >
                      <option value="">Seçiniz</option>
                      {BUILDING_AGE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Isıtma</label>
                    <select
                      value={filters.heating_type[0] || ""}
                      onChange={(e) => updateFilter("heating_type", e.target.value ? [e.target.value] : [])}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    >
                      <option value="">Seçiniz</option>
                      {HEATING_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  {!isIsYeriKompleBinaBranch ? (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Bulunduğu Kat</label>
                      <input
                        type="number"
                        value={filters.floor_number[0] || ""}
                        onChange={(e) => updateFilter("floor_number", e.target.value ? [e.target.value] : [])}
                        className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Kat Sayısı</label>
                      <input
                        type="number"
                        value={filters.total_floors[0] || ""}
                        onChange={(e) => updateFilter("total_floors", e.target.value ? [e.target.value] : [])}
                        className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                      />
                    </div>
                  )}
                </div>

                {isIsYeriKompleBinaBranch && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Bina Tipi</label>
                    <select
                      value={filters.bina_type}
                      onChange={(e) => updateFilter("bina_type", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    >
                      <option value="">Seçiniz</option>
                      {BINA_TYPE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Kullanım Durumu</label>
                    <select
                      value={filters.using_status}
                      onChange={(e) => updateFilter("using_status", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    >
                      <option value="">Seçiniz</option>
                      {USING_STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Durumu</label>
                    <select
                      value={filters.property_condition}
                      onChange={(e) => updateFilter("property_condition", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    >
                      <option value="">Seçiniz</option>
                      {PROPERTY_CONDITION_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Kiracılı</label>
                    <select
                      value={filters.has_tenant}
                      onChange={(e) => updateFilter("has_tenant", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    >
                      <option value="">Seçiniz</option>
                      {HAS_TENANT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Krediye Uygun</label>
                    <select
                      value={filters.credit_eligible_choice}
                      onChange={(e) => updateFilter("credit_eligible_choice", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    >
                      <option value="">Seçiniz</option>
                      <option value="Evet">Evet</option>
                      <option value="Hayır">Hayır</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Tapu Durumu</label>
                    <select
                      value={filters.title_deed_status}
                      onChange={(e) => updateFilter("title_deed_status", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    >
                      <option value="">Seçiniz</option>
                      {TITLE_DEED_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Takaslı</label>
                    <select
                      value={filters.swap_option}
                      onChange={(e) => updateFilter("swap_option", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    >
                      <option value="">Seçiniz</option>
                      {SWAP_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {(isIsYeriDepoBranch || isIsYeriKompleBinaBranch) && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Zemin Etüdü</label>
                    <select
                      value={filters.ground_survey}
                      onChange={(e) => updateFilter("ground_survey", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    >
                      <option value="">Seçiniz</option>
                      {GROUND_SURVEY_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bina — yalnızca Satılık veya Kiralık seçildiğinde */}
        {isBinaBranch && (
          <div className="p-5">
            <button
              onClick={() => toggleExpand("details")}
              className="w-full flex items-center justify-between text-[13px] font-bold text-neutral-800 mb-3 hover:text-black transition-colors"
            >
              Gayrimenkul Detayları
              {expanded.details ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expanded.details && (
              <div className="space-y-4 mt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Kat Sayısı</label>
                    <input
                      type="number"
                      value={filters.total_floors[0] || ""}
                      onChange={(e) => updateFilter("total_floors", e.target.value ? [e.target.value] : [])}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Bir Kattaki Daire</label>
                    <select
                      value={filters.apartment_count}
                      onChange={(e) => updateFilter("apartment_count", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    >
                      <option value="">Seçiniz</option>
                      {APARTMENT_COUNT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Isıtma Tipi</label>
                  <select
                    value={filters.heating_type[0] || ""}
                    onChange={(e) => updateFilter("heating_type", e.target.value ? [e.target.value] : [])}
                    className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                  >
                    <option value="">Seçiniz</option>
                    {HEATING_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Bina Yaşı</label>
                    <select
                      value={filters.building_age}
                      onChange={(e) => updateFilter("building_age", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    >
                      <option value="">Seçiniz</option>
                      {BUILDING_AGE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Asansör</label>
                    <select
                      value={filters.elevator_type[0] || ""}
                      onChange={(e) => updateFilter("elevator_type", e.target.value ? [e.target.value] : [])}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    >
                      <option value="">Seçiniz</option>
                      {["Var", "Yok"].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Otopark</label>
                    <select
                      value={filters.parking_type[0] || ""}
                      onChange={(e) => updateFilter("parking_type", e.target.value ? [e.target.value] : [])}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    >
                      <option value="">Seçiniz</option>
                      {PARKING_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Tapu Durumu</label>
                  <select
                    value={filters.title_deed_status}
                    onChange={(e) => updateFilter("title_deed_status", e.target.value)}
                    className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                  >
                    <option value="">Seçiniz</option>
                    {TITLE_DEED_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Krediye Uygun</label>
                  <select
                    value={filters.credit_eligible_choice}
                    onChange={(e) => updateFilter("credit_eligible_choice", e.target.value)}
                    className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                  >
                    <option value="">Seçiniz</option>
                    <option value="Evet">Evet</option>
                    <option value="Hayır">Hayır</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Takaslı</label>
                  <select
                    value={filters.swap_option}
                    onChange={(e) => updateFilter("swap_option", e.target.value)}
                    className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                  >
                    <option value="">Seçiniz</option>
                    {SWAP_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Arsa — yalnızca Satılık veya Kiralık seçildiğinde (ilan detayı ile aynı alanlar) */}
        {isArsaBranch && (
          <div className="p-5">
            <button
              onClick={() => toggleExpand("details")}
              className="w-full flex items-center justify-between text-[13px] font-bold text-neutral-800 mb-3 hover:text-black transition-colors"
            >
              Gayrimenkul Detayları
              {expanded.details ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expanded.details && (
              <div className="space-y-4 mt-1">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Ada No</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.min_ada_no}
                        onChange={(e) => updateFilter("min_ada_no", e.target.value)}
                        className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.max_ada_no}
                        onChange={(e) => updateFilter("max_ada_no", e.target.value)}
                        className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Parsel No</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        placeholder="Min"
                        value={filters.min_parsel_no}
                        onChange={(e) => updateFilter("min_parsel_no", e.target.value)}
                        className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={filters.max_parsel_no}
                        onChange={(e) => updateFilter("max_parsel_no", e.target.value)}
                        className="w-full text-sm border border-neutral-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Kaks (Emsal)</label>
                    <select
                      value={filters.kaks_emsal}
                      onChange={(e) => updateFilter("kaks_emsal", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    >
                      <option value="">Seçiniz</option>
                      {KAKS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Gabari</label>
                    <select
                      value={filters.gabari}
                      onChange={(e) => updateFilter("gabari", e.target.value)}
                      className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                    >
                      <option value="">Seçiniz</option>
                      {GABARI_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">İmar Durumu</label>
                  <select
                    value={filters.zoning_status}
                    onChange={(e) => updateFilter("zoning_status", e.target.value)}
                    className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                  >
                    <option value="">Seçiniz</option>
                    {ZONING_STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Tapu Durumu</label>
                  <select
                    value={filters.title_deed_status}
                    onChange={(e) => updateFilter("title_deed_status", e.target.value)}
                    className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                  >
                    <option value="">Seçiniz</option>
                    {TITLE_DEED_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Krediye Uygun</label>
                  <select
                    value={filters.credit_eligible_choice}
                    onChange={(e) => updateFilter("credit_eligible_choice", e.target.value)}
                    className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                  >
                    <option value="">Seçiniz</option>
                    <option value="Evet">Evet</option>
                    <option value="Hayır">Hayır</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Takaslı</label>
                  <select
                    value={filters.swap_option}
                    onChange={(e) => updateFilter("swap_option", e.target.value)}
                    className="w-full text-sm border border-neutral-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition-all bg-white"
                  >
                    <option value="">Seçiniz</option>
                    {SWAP_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
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
            "İlanları Göster"
          )}
        </button>
      </div>
    </aside>
  );
}
