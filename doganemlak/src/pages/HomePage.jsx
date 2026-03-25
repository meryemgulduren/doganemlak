import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { SlidersHorizontal, TurkishLira } from "lucide-react";
import { fetchListings } from "../api/listings";
import Card from "../components/Card";
import Seo from "../components/Seo";
import Pagination from "../components/Pagination";
import { useListingFavorites } from "../hooks/useListingFavorites";

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
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [priceMinInput, setPriceMinInput] = useState("");
  const [priceMaxInput, setPriceMaxInput] = useState("");
  const [priceFilterError, setPriceFilterError] = useState("");
  const filterRef = useRef(null);
  const priceRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const listingTypeParam = searchParams.get("listing_type");
  const subTypeParam = searchParams.get("sub_type");
  const searchParamStr = searchParams.get("search");
  const cityParam = searchParams.get("city");
  const minPriceParam = searchParams.get("min_price");
  const maxPriceParam = searchParams.get("max_price");
  const pageParam = Math.max(1, Number(searchParams.get("page") || 1));

  const normalizePriceDigits = (v) => String(v ?? "").replace(/[^\d]/g, "");
  const formatPriceInput = (v) => {
    const digits = normalizePriceDigits(v);
    if (!digits) return "";
    return new Intl.NumberFormat("tr-TR").format(Number(digits));
  };
  const parsePriceQuery = (v) => {
    const digits = normalizePriceDigits(v);
    if (!digits) return undefined;
    const n = Number(digits);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchListings({
      page: pageParam,
      limit: 30,
      category: categoryParam || undefined,
      listing_type: listingTypeParam || undefined,
      sub_type: subTypeParam || undefined,
      search: searchParamStr || undefined,
      city: cityParam || undefined,
      minPrice: parsePriceQuery(minPriceParam),
      maxPrice: parsePriceQuery(maxPriceParam),
    })
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
  }, [categoryParam, listingTypeParam, subTypeParam, searchParamStr, cityParam, minPriceParam, maxPriceParam, pageParam]);

  useEffect(() => {
    setPriceMinInput(formatPriceInput(minPriceParam ?? ""));
    setPriceMaxInput(formatPriceInput(maxPriceParam ?? ""));
  }, [minPriceParam, maxPriceParam]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
      if (priceRef.current && !priceRef.current.contains(event.target)) {
        setPriceOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applyPriceFilter = () => {
    const minN = parsePriceQuery(priceMinInput);
    const maxN = parsePriceQuery(priceMaxInput);
    if (minN != null && maxN != null && minN > maxN) {
      setPriceFilterError("Minimum fiyat, maksimum fiyattan büyük olamaz.");
      return;
    }
    setPriceFilterError("");
    const next = new URLSearchParams(searchParams);
    if (minN != null) next.set("min_price", String(Math.floor(minN)));
    else next.delete("min_price");
    if (maxN != null) next.set("max_price", String(Math.floor(maxN)));
    else next.delete("max_price");
    setSearchParams(next, { replace: true });
    setPriceOpen(false);
  };

  const clearPriceFilter = () => {
    setPriceMinInput("");
    setPriceMaxInput("");
    setPriceFilterError("");
    const next = new URLSearchParams(searchParams);
    next.delete("min_price");
    next.delete("max_price");
    setSearchParams(next, { replace: true });
    setPriceOpen(false);
  };

  const hasActivePriceFilter = Boolean(minPriceParam || maxPriceParam);

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
        <div className="mt-2 sm:mt-0 flex flex-nowrap sm:flex-wrap items-center justify-between gap-2 sm:gap-4 mb-6 pb-2 border-b border-neutral-200">
          <h2 className="min-w-0 font-montserrat text-xl sm:text-2xl font-semibold text-black tracking-tight">
            Öne Çıkan İlanlar
          </h2>
          <div className="shrink-0 flex flex-nowrap sm:flex-wrap items-center justify-end gap-2">
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => {
                  setFilterOpen((prev) => !prev);
                  setPriceOpen(false);
                }}
                aria-expanded={filterOpen}
                aria-haspopup="listbox"
                className="group inline-flex items-center gap-2.5 pl-3 pr-4 py-2.5 sm:pl-4 sm:pr-5 rounded-full border border-amber-300/80 bg-amber-100/80 text-black shadow-sm hover:shadow-md hover:border-amber-400/90 hover:bg-amber-200/80 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 focus-visible:ring-offset-2 transition-[box-shadow,background-color,border-color] text-[12px] sm:text-[13px] font-medium tracking-tight"
              >
                <SlidersHorizontal
                  className="w-[18px] h-[18px] shrink-0 text-neutral-800 group-hover:text-neutral-900 transition-colors"
                  strokeWidth={1.75}
                  aria-hidden
                />
                Filtre Seç
              </button>
              {filterOpen && (
                <div className="absolute right-0 sm:left-auto sm:right-0 top-full mt-2 w-[min(100vw-1.25rem,280px)] sm:min-w-[280px] bg-white border border-neutral-200 rounded-lg shadow-card z-40 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy(null);
                      setFilterOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-neutral-800 hover:bg-neutral-100 border-b border-neutral-100"
                  >
                    Filtreyi Sıfırla
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

            <div className="relative" ref={priceRef}>
              <button
                type="button"
                onClick={() => {
                  setPriceOpen((prev) => !prev);
                  setFilterOpen(false);
                }}
                aria-expanded={priceOpen}
                aria-haspopup="dialog"
                className={`group inline-flex items-center gap-2.5 pl-3 pr-4 py-2.5 sm:pl-4 sm:pr-5 rounded-full border bg-amber-100/80 text-black shadow-sm hover:shadow-md hover:border-amber-400/90 hover:bg-amber-200/80 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 focus-visible:ring-offset-2 transition-[box-shadow,background-color,border-color] text-[12px] sm:text-[13px] font-medium tracking-tight ${
                  hasActivePriceFilter ? "border-amber-400/90 ring-1 ring-amber-300/50" : "border-amber-300/80"
                }`}
              >
                <TurkishLira
                  className="w-[18px] h-[18px] shrink-0 text-neutral-800 group-hover:text-neutral-900 transition-colors"
                  strokeWidth={1.75}
                  aria-hidden
                />
                Fiyat
              </button>
              {priceOpen && (
                <div className="absolute right-0 sm:left-auto sm:right-0 top-full mt-2 w-[min(100vw-1.25rem,320px)] bg-white border border-neutral-200 rounded-lg shadow-card z-40 overflow-hidden p-4 space-y-3">
                  <p className="text-xs font-medium text-neutral-600">Fiyat aralığı (₺)</p>
                  {priceFilterError && (
                    <p className="text-xs text-danger font-medium">{priceFilterError}</p>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="home-price-min" className="sr-only">
                        Minimum fiyat
                      </label>
                      <input
                        id="home-price-min"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9.]*"
                        placeholder="Min"
                        value={priceMinInput}
                        onChange={(e) => {
                          setPriceMinInput(formatPriceInput(e.target.value));
                          setPriceFilterError("");
                        }}
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-black placeholder:text-neutral-400 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200/50"
                      />
                    </div>
                    <div>
                      <label htmlFor="home-price-max" className="sr-only">
                        Maksimum fiyat
                      </label>
                      <input
                        id="home-price-max"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9.]*"
                        placeholder="Max"
                        value={priceMaxInput}
                        onChange={(e) => {
                          setPriceMaxInput(formatPriceInput(e.target.value));
                          setPriceFilterError("");
                        }}
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-black placeholder:text-neutral-400 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200/50"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={applyPriceFilter}
                      className="inline-flex flex-1 min-w-[7rem] items-center justify-center rounded-full bg-yellow-300 px-4 py-2 text-sm font-semibold text-black shadow-sm hover:bg-yellow-400 transition-colors"
                    >
                      Ara
                    </button>
                    {hasActivePriceFilter && (
                      <button
                        type="button"
                        onClick={clearPriceFilter}
                        className="inline-flex items-center justify-center rounded-full border border-amber-300/80 bg-amber-100/70 px-4 py-2 text-sm font-medium text-black hover:bg-amber-200/70 transition-colors"
                      >
                        Temizle
                      </button>
                    )}
                  </div>
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
          <p className="text-neutral-600 font-medium">İlanlar yükleniyor...</p>
        ) : sortedListings.length === 0 ? (
          <p className="text-neutral-600 font-medium">Henüz ilan bulunmuyor.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
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
  );
}
