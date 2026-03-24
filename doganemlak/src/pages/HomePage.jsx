import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { Filter } from "lucide-react";
import { fetchListings } from "../api/listings";
import Card from "../components/Card";
import Seo from "../components/Seo";

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
  const location = useLocation();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const listingTypeParam = searchParams.get("listing_type");
  const subTypeParam = searchParams.get("sub_type");
  const searchParamStr = searchParams.get("search");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchListings({
      page: 1,
      limit: 24,
      category: categoryParam || undefined,
      listing_type: listingTypeParam || undefined,
      sub_type: subTypeParam || undefined,
      search: searchParamStr || undefined,
    })
      .then((res) => {
        if (!cancelled && res.success) {
          setListings(res.data || []);
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
  }, [categoryParam, listingTypeParam, subTypeParam, searchParamStr]);

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
    <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-10 font-sans bg-background">
      <Seo
        title={homeTitle}
        description={homeDescription}
        canonical={canonicalUrl}
        jsonLd={buildHomeOrganizationJsonLd(siteUrl)}
      />
      <div className="max-w-[1600px] mx-auto w-full">
        <div className="mt-2 sm:mt-0 flex flex-wrap items-center justify-between gap-4 mb-6 pb-2 border-b-2 border-bordeaux/30">
          <h2 className="text-2xl font-extrabold text-bordeaux font-sans">
            Öne Çıkan İlanlar
          </h2>
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border border-bordeaux/25 text-text-dark font-medium hover:bg-bordeaux hover:text-white hover:border-bordeaux focus:outline-none transition-colors text-sm"
            >
              <Filter className="w-5 h-5" />
              Filtre Seç
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
                    className={`w-full text-left px-4 py-2.5 text-sm border-b border-border last:border-b-0 transition-colors ${
                      sortBy === opt.id
                        ? "text-bordeaux font-semibold bg-accent/35"
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

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-text-dark/70 font-sans">İlanlar yükleniyor...</p>
        ) : sortedListings.length === 0 ? (
          <p className="text-text-dark/70 font-sans">Henüz ilan bulunmuyor.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
            {sortedListings.map((listing) => (
              <Card key={listing._id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
