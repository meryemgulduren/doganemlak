import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import { fetchListings } from "../api/listings";
import Card from "../components/Card";
import Seo from "../components/Seo";
import Pagination from "../components/Pagination";
import { resolveSeoLanding } from "../constants/seoLandings";
import { useListingFavorites } from "../hooks/useListingFavorites";
import FilterSidebar from "../components/FilterSidebar";

function buildCollectionPageJsonLd({ title, description, canonicalUrl, siteUrl }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: canonicalUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "Doğan Emlak",
      url: siteUrl,
    },
  };
}

export default function SeoListingLandingPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isLoggedIn, isFavorite, isLoadingFavorite, toggleFavorite } = useListingFavorites();
  const segment = pathname.replace(/^\/+|\/+$/g, "").split("/")[0] || "";
  const config = useMemo(() => resolveSeoLanding(segment), [segment]);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 30 });
  const [sortBy, setSortBy] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = Math.max(1, Number(searchParams.get("page") || 1));

  const siteUrl = (import.meta.env.VITE_SITE_URL || "https://www.doganemlak.com").replace(/\/$/, "");
  const canonicalUrl = config ? `${siteUrl}/${config.offerSlug}` : siteUrl;

  useEffect(() => {
    if (!config) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Config parametrelerini URL parametreleriyle birleştir
    const params = {
      ...Object.fromEntries(searchParams.entries()),
      city: searchParams.get("city") || config.apiCitySearch,
      listing_type: searchParams.get("listing_type") || config.listing_type,
      page: pageParam,
      limit: 30,
    };

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
  }, [config?.offerSlug, searchParams, pageParam]);

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

  if (!config) {
    return <Navigate to="/ilanlar" replace />;
  }

  const jsonLd = buildCollectionPageJsonLd({
    title: config.title,
    description: config.description,
    canonicalUrl,
    siteUrl,
  });

  return (
    <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-10 font-sans bg-background">
      <Seo
        title={config.title}
        description={config.description}
        canonical={canonicalUrl}
        jsonLd={jsonLd}
      />
      <div className="max-w-[1600px] mx-auto w-full">
        <header className="mb-6 pb-4 border-b-2 border-amber-300">
          <h1 className="font-montserrat text-2xl sm:text-3xl font-semibold text-black tracking-tight mb-3">
            {config.h1}
          </h1>
          <p className="text-text-dark/80 text-sm sm:text-base max-w-3xl leading-relaxed">
            {config.intro}
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <FilterSidebar className="hidden lg:block lg:shrink-0" totalCount={pagination.total} />

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-2 border-b border-border">
              <h2 className="font-montserrat text-lg font-semibold text-black tracking-tight">İlan listesi</h2>
              
              <div className="shrink-0 flex items-center gap-2">
                {/* Mobil Filtre Butonu */}
                <button 
                  onClick={() => alert("Filtreleme şimdilik geniş ekranlarda aktiftir.")}
                  className="lg:hidden inline-flex items-center gap-2 px-3 py-2 rounded-full border border-amber-300 bg-amber-100 text-xs font-medium"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filtrele
                </button>

                <div className="relative" ref={filterRef}>
                  <button
                    type="button"
                    onClick={() => setFilterOpen((prev) => !prev)}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border border-neutral-300 text-text-dark font-medium hover:bg-amber-100/75 hover:text-text-dark hover:border-amber-200/90 focus:outline-none transition-colors text-sm"
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                    Sırala
                  </button>
                  {filterOpen && (
                    <div className="absolute right-0 top-full mt-2 min-w-[280px] bg-white border border-border rounded-lg shadow-card z-40 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => {
                          setSortBy(null);
                          setFilterOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-text-dark/80 hover:bg-accent/20 border-b border-border"
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
                          className={`w-full text-left px-4 py-2.5 text-sm border-b border-border last:border-b-0 transition-colors ${
                            sortBy === opt.id
                              ? "text-black font-semibold bg-accent/35"
                              : "text-primary hover:bg-accent/20"
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
              <p className="text-text-dark/70 font-sans">İlanlar yükleniyor...</p>
            ) : sortedListings.length === 0 ? (
              <div className="py-12 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-300 font-sans">
                <p className="text-text-dark/70">Bu kriterlere uygun ilan bulunmuyor.</p>
                <button 
                   onClick={() => setSearchParams({})}
                   className="mt-4 text-amber-600 font-semibold hover:underline"
                >
                  Filtreleri Temizle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                {sortedListings.map((listing) => (
                  <Card
                    key={listing._id}
                    listing={listing}
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
    </div>
  );
}
