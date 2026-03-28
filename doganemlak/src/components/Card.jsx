import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Maximize2, BedDouble, Heart } from "lucide-react";
import { Link } from "react-router-dom";

function formatPrice(price, currency = "TRY", listingType = "SATILIK") {
  if (price == null || price === "" || (typeof price === "number" && !Number.isFinite(price))) {
    return "Fiyat sorunuz";
  }
  const formatted = new Intl.NumberFormat("tr-TR").format(price);
  const suffix = currency === "TRY" ? " ₺" : ` ${currency}`;
  return listingType === "KIRALIK" ? `${formatted}${suffix}/ay` : `${formatted}${suffix}`;
}

function locationString(location) {
  if (!location) return "";
  return [location.city, location.district, location.neighborhood].filter(Boolean).join(", ");
}

function resolveAbsoluteMediaUrl(url) {
  if (!url || typeof url !== "string") return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  const api = import.meta.env.VITE_API_URL;
  const origin = (api || "").replace(/\/api\/?$/, "");
  if (!origin) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${origin}${path}`;
}

export default function Card({ listing, isFavorite, onFavoriteClick, favoriteLoading, neutralInk }) {
  if (!listing?._id) return null;
  const id       = listing._id;
  const title    = listing.title;
  const location = locationString(listing.location);
  const price    = formatPrice(listing.price, listing.currency, listing.listing_type);
  const isRental = listing.listing_type === "KIRALIK";
  const roomCount = listing.room_count ?? null;
  const area     = listing.m2_brut != null ? `${listing.m2_brut} m²`
                 : listing.m2_net  != null ? `${listing.m2_net} m²`  : null;
  const fallbackImage =
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop";
  const cardImages = useMemo(() => {
    const imgs = Array.isArray(listing?.media?.images) ? listing.media.images : [];
    const filtered = imgs.filter(Boolean);
    return filtered.length ? filtered : [fallbackImage];
  }, [listing]);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  useEffect(() => {
    setActiveImageIdx(0);
  }, [id, cardImages.length]);

  const image = cardImages[activeImageIdx] || fallbackImage;
  const listingImageAlt = `${title || "Emlak İlanı"} - Doğan Emlak Samsun`;
  const showFavorite = typeof onFavoriteClick === "function";
  const titleClass = neutralInk
    ? "font-montserrat font-semibold text-neutral-950 text-base mb-2 line-clamp-2 group-hover:text-neutral-800 transition-colors tracking-tight"
    : "font-montserrat font-semibold text-text-dark text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors tracking-tight";
  const metaClass = neutralInk ? "flex flex-wrap items-center gap-x-3 gap-y-1 text-neutral-600 text-xs mb-3" : "flex flex-wrap items-center gap-x-3 gap-y-1 text-muted text-xs mb-3";
  const iconMeta = neutralInk ? "text-neutral-500" : "text-muted";
  const priceClass = neutralInk ? "font-semibold text-neutral-950 text-lg" : "font-bold text-text-dark text-lg";
  const noClass = neutralInk ? "text-xs text-neutral-600" : "text-xs text-muted";

  return (
    <div className="group bg-surface rounded-2xl overflow-hidden border border-border shadow-card hover:shadow-card-hover hover:border-bordeaux/25 transition-all duration-300">
      {/* Fotoğraf */}
      <div className="relative aspect-[4/3] overflow-hidden bg-accent/80">
        {cardImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveImageIdx((prev) => (prev === 0 ? cardImages.length - 1 : prev - 1));
              }}
              aria-label="Önceki fotoğraf"
              className="hidden group-hover:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-text-dark/70 text-white p-1.5 hover:bg-text-dark transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveImageIdx((prev) => (prev === cardImages.length - 1 ? 0 : prev + 1));
              }}
              aria-label="Sonraki fotoğraf"
              className="hidden group-hover:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-text-dark/70 text-white p-1.5 hover:bg-text-dark transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
        <Link to={`/ilan/${id}`} className="block w-full h-full">
          <img
            src={resolveAbsoluteMediaUrl(image) || image}
            alt={listingImageAlt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        {showFavorite && (
          <button
            type="button"
            onClick={onFavoriteClick}
            disabled={favoriteLoading}
            aria-label={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
            aria-pressed={!!isFavorite}
            className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-transparent p-0 transition hover:opacity-90 active:scale-95 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            <Heart
              className={`h-[22px] w-[22px] transition-colors drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] ${
                isFavorite ? "fill-red-600" : "fill-transparent"
              }`}
              strokeWidth={2.5}
              stroke="#ffffff"
            />
          </button>
        )}
        {/* Satılık / Kiralık etiketi */}
        <span
          className={`pointer-events-none absolute top-3 left-3 z-[1] px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide shadow-sm
            ${isRental
              ? "bg-surface text-text-dark border border-border"
              : "bg-text-dark text-white"
            }`}
        >
          {isRental ? "Kiralık" : "Satılık"}
        </span>
      </div>

      {/* İçerik */}
      <Link to={`/ilan/${id}`} className="block p-4">
        <h3 className={titleClass}>
          {title}
        </h3>

        <div className={metaClass}>
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${iconMeta}`} />
              {location}
            </span>
          )}
          {roomCount && (
            <span className="flex items-center gap-1">
              <BedDouble className={`w-3.5 h-3.5 flex-shrink-0 ${iconMeta}`} />
              {roomCount}
            </span>
          )}
          {area && (
            <span className="flex items-center gap-1">
              <Maximize2 className={`w-3.5 h-3.5 flex-shrink-0 ${iconMeta}`} />
              {area}
            </span>
          )}
        </div>

        {/* Fiyat */}
        <div className="flex items-center justify-between gap-2 mt-1">
          <p className={priceClass}>
            {price}
          </p>
          <span className={noClass}>
            No: {listing.listing_no ?? id?.slice(-6)}
          </span>
        </div>
      </Link>
    </div>
  );
}
