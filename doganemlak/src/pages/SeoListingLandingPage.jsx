import { useState, useEffect, useMemo, useRef } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { Filter } from "lucide-react";
import { fetchListings } from "../api/listings";
import Card from "../components/Card";
import Seo from "../components/Seo";
import { resolveSeoLanding } from "../constants/seoLandings";

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
  const { pathname } = useLocation();
  const segment = pathname.replace(/^\/+|\/+$/g, "").split("/")[0] || "";
  // resolveSeoLanding her çağrıda yeni obje döndürür; [config] ile useEffect sonsuz döner — segment ile stabilize et
  const config = useMemo(() => resolveSeoLanding(segment), [segment]);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);

  const siteUrl = (import.meta.env.VITE_SITE_URL || "https://www.doganemlak.com").replace(/\/$/, "");
  const canonicalUrl = config ? `${siteUrl}/${config.offerSlug}` : siteUrl;

  useEffect(() => {
    if (!config) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchListings({
      page: 1,
      limit: 24,
      city: config.apiCitySearch,
      listing_type: config.listing_type,
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
  }, [config?.offerSlug, config?.listing_type, config?.apiCitySearch]);

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
        <header className="mb-6 pb-4 border-b-2 border-bordeaux/30">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-bordeaux font-sans mb-3">
            {config.h1}
          </h1>
          <p className="text-text-dark/80 text-sm sm:text-base max-w-3xl leading-relaxed">
            {config.intro}
          </p>
        </header>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-2 border-b border-border">
          <h2 className="text-lg font-bold text-text-dark font-sans">İlan listesi</h2>
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border border-bordeaux/25 text-text-dark font-medium hover:bg-bordeaux hover:text-white hover:border-bordeaux focus:outline-none transition-colors text-sm"
            >
              <Filter className="w-5 h-5" />
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
          <p className="text-text-dark/70 font-sans">Bu kriterlere uygun ilan bulunmuyor.</p>
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
