import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { SlidersHorizontal, TurkishLira, X } from "lucide-react";
import { fetchListings } from "../api/listings";
import Card from "../components/Card";
import Seo from "../components/Seo";
import Pagination from "../components/Pagination";
import { useListingFavorites } from "../hooks/useListingFavorites";
import FilterSidebar from "../components/FilterSidebar";

function buildHomeOrganizationJsonLd(siteUrl) {
  const phone = import.meta.env.VITE_ORG_PHONE || undefined;
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Doğan Emlak",
    url: siteUrl,
    ...(phone ? { telephone: phone } : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Samsun",
      addressCountry: "TR",
    },
    areaServed: { "@type": "City", name: "Samsun" },
  };
}

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, isFavorite, isLoadingFavorite, toggleFavorite } = useListingFavorites();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 30 });
  const [sortBy, setSortBy] = useState(null);
  const [listingFilterOpen, setListingFilterOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const pageParam = Math.max(1, Number(searchParams.get("page") || 1));

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Tüm searchParams'ları objeye çevirip fetchListings'e gönder
    const params = Object.fromEntries(searchParams.entries());
    if (!params.page) params.page = pageParam;
    if (!params.limit) params.limit = 30;

    fetchListings(params)
      .then((res) => {
        if (!cancelled && res.success) {
          setListings(res.data || []);
          setPagination(
            res.pagination || {
              page: pageParam,
              totalPages: 1,
              total: 0,
              limit: 30,
            }
          );
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "İlanlar yüklenemedi.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [searchParams, pageParam]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sortedListings = useMemo(() => {
    const list = [...listings];
    const getDateValue = (item) => new Date(item?.listing_date || item?.createdAt || 0).getTime() || 0;
    const getPriceValue = (item) => Number(item?.price || 0);

    if (sortBy === "price_desc") {
      list.sort((a, b) => getPriceValue(b) - getPriceValue(a));
    } else if (sortBy === "price_asc") {
      list.sort((a, b) => getPriceValue(a) - getPriceValue(b));
    } else if (sortBy === "date_desc") {
      list.sort((a, b) => getDateValue(b) - getDateValue(a));
    } else if (sortBy === "date_asc") {
      list.sort((a, b) => getDateValue(a) - getDateValue(b));
    }

    return list;
  }, [listings, sortBy]);

  const sortOptions = [
    { id: "price_desc", label: "Fiyata göre (Önce en yüksek)" },
    { id: "price_asc", label: "Fiyata göre (Önce en düşük)" },
    { id: "date_desc", label: "Tarihe göre (Önce en yeni ilan)" },
    { id: "date_asc", label: "Tarihe göre (Önce en eski ilan)" },
  ];

  const siteUrl = (import.meta.env.VITE_SITE_URL || "https://www.doganemlak.com").replace(/\/$/, "");
  const canonicalUrl = `${siteUrl}${location.pathname === "/" ? "/" : location.pathname}`;
  const isIlanlarOnly = location.pathname.startsWith("/ilanlar");
  const homeTitle = isIlanlarOnly
    ? "Tüm İlanlar | Doğan Emlak Samsun"
    : "Doğan Emlak Samsun | Kiralık ve Satılık Emlak İlanları";
  const homeDescription = isIlanlarOnly
    ? "Samsun ve çevresindeki güncel kiralık ve satılık emlak ilanları. Daire, arsa ve iş yeri seçeneklerini Doğan Emlak’ta inceleyin."
    : "Samsun’da kiralık ve satılık daire, arsa, iş yeri ilanları. Doğan Emlak ile güvenli emlak arayışınızı kolaylaştırın.";

  return (
    <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-10 font-sans antialiased bg-background text-neutral-950 [font-feature-settings:'liga'_1,'kern'_1]">
      <Seo
        title={homeTitle}
        description={homeDescription}
        canonical={canonicalUrl}
        jsonLd={buildHomeOrganizationJsonLd(siteUrl)}
      />
      <div className="max-w-[1600px] mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          {listingFilterOpen && (
            <FilterSidebar className="hidden lg:block lg:shrink-0" totalCount={pagination.total} />
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="mt-2 sm:mt-0 flex flex-nowrap sm:flex-wrap items-center justify-between gap-2 sm:gap-4 mb-6 pb-2 border-b border-neutral-200">
              <h2 className="min-w-0 font-montserrat text-xl sm:text-2xl font-semibold text-black tracking-tight">
                {isIlanlarOnly ? "Tüm İlanlar" : "Öne Çıkan İlanlar"}
              </h2>
              <div className="shrink-0 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setListingFilterOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 px-3 py-2 rounded-full border border-amber-300 bg-amber-100 text-xs font-semibold text-black hover:bg-amber-200 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filtrele
                </button>

                <button 
                  type="button"
                  onClick={() => setListingFilterOpen((prev) => !prev)}
                  className="hidden lg:inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border border-amber-300 bg-amber-100 text-sm font-semibold text-black hover:bg-amber-200 transition-colors"
                >
                  <SlidersHorizontal className="w-4.5 h-4.5" />
                  {listingFilterOpen ? "Filtreyi Kapat" : "İlanları Filtrele"}
                </button>

                <div className="relative" ref={filterRef}>
                  <button
                    type="button"
                    onClick={() => setFilterOpen((prev) => !prev)}
                    className="group inline-flex items-center gap-2.5 pl-3 pr-4 py-2.5 sm:pl-4 sm:pr-5 rounded-full border border-neutral-300 bg-white text-black shadow-sm hover:shadow-md hover:border-amber-400 transition-all text-[12px] sm:text-[13px] font-medium tracking-tight"
                  >
                    <SlidersHorizontal
                      className="w-[18px] h-[18px] shrink-0 text-neutral-600 transition-colors"
                      strokeWidth={1.75}
                    />
                    Sırala
                  </button>
                  {filterOpen && (
                    <div className="absolute right-0 top-full mt-2 w-[280px] bg-white border border-neutral-200 rounded-lg shadow-card z-40 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => {
                          setSortBy(null);
                          setFilterOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-100 border-b border-neutral-100"
                      >
                        Sıralamayı Sıfırla
                      </button>
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSortBy(opt.id);
                            setFilterOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-medium border-b border-neutral-100 last:border-b-0 transition-colors ${
                            sortBy === opt.id
                              ? "text-black bg-neutral-100"
                              : "text-neutral-800 hover:bg-neutral-50"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <p className="text-neutral-600 font-medium font-sans">İlanlar yükleniyor...</p>
            ) : sortedListings.length === 0 ? (
              <div className="py-12 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-300">
                <p className="text-neutral-500 font-medium">Bu kriterlere uygun ilan bulunamadı.</p>
                <button 
                   onClick={() => setSearchParams({})}
                   className="mt-4 text-amber-600 font-semibold hover:underline"
                >
                  Filtreleri Temizle
                </button>
              </div>
            ) : (
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 ${
                  listingFilterOpen
                    ? "lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                    : "lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-5"
                }`}
              >
                {sortedListings.map((listing) => (
                  <Card
                    key={listing._id}
                    listing={listing}
                    neutralInk
                    isFavorite={isFavorite(listing._id)}
                    favoriteLoading={isLoadingFavorite(listing._id)}
                    onFavoriteClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!isLoggedIn) {
                        navigate("/login");
                        return;
                      }
                      toggleFavorite(listing._id);
                    }}
                  />
                ))}
              </div>
            )}

            <Pagination
              currentPage={pagination.page || pageParam}
              totalPages={pagination.totalPages || 1}
              onPageChange={(p) => {
                const next = new URLSearchParams(searchParams);
                next.set("page", String(p));
                setSearchParams(next);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        </div>
      </div>

      {listingFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-[120]">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            onClick={() => setListingFilterOpen(false)}
            aria-label="Filtre panelini kapat"
          />
          <div className="absolute right-0 top-0 h-full w-[92%] max-w-[420px] bg-white shadow-2xl border-l border-neutral-200 p-3 overflow-y-auto">
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-sm font-semibold text-neutral-900">İlanları Filtrele</p>
              <button
                type="button"
                onClick={() => setListingFilterOpen(false)}
                className="p-2 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                aria-label="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <FilterSidebar totalCount={pagination.total} />
          </div>
        </div>
      )}
    </div>
  );
}
