import { MapPin, Layout, Maximize2, BedDouble } from "lucide-react";
import { Link } from "react-router-dom";

function formatPrice(price, currency = "TRY", listingType = "SATILIK") {
  const formatted = new Intl.NumberFormat("tr-TR").format(price);
  const suffix = currency === "TRY" ? " ₺" : ` ${currency}`;
  return listingType === "KIRALIK" ? `${formatted}${suffix}/ay` : `${formatted}${suffix}`;
}

function locationString(location) {
  if (!location) return "";
  return [location.city, location.district, location.neighborhood].filter(Boolean).join(", ");
}

export default function Card({ listing }) {
  if (!listing?._id) return null;
  const id       = listing._id;
  const title    = listing.title;
  const location = locationString(listing.location);
  const price    = formatPrice(listing.price, listing.currency, listing.listing_type);
  const isRental = listing.listing_type === "KIRALIK";
  const roomCount = listing.room_count ?? null;
  const area     = listing.m2_brut != null ? `${listing.m2_brut} m²`
                 : listing.m2_net  != null ? `${listing.m2_net} m²`  : null;
  const image    = listing.media?.images?.[0] ||
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop";

  return (
    <Link
      to={`/ilan/${id}`}
      className="group block bg-surface rounded-2xl overflow-hidden border border-border shadow-card hover:shadow-card-hover hover:border-bordeaux/25 transition-all duration-300"
    >
      {/* Fotoğraf */}
      <div className="relative aspect-[4/3] overflow-hidden bg-accent/80">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Satılık / Kiralık etiketi */}
        <span
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide shadow-sm
            ${isRental
              ? "bg-surface text-text-dark border border-border"
              : "bg-text-dark text-white"
            }`}
        >
          {isRental ? "Kiralık" : "Satılık"}
        </span>
      </div>

      {/* İçerik */}
      <div className="p-4">
        <h3 className="font-semibold text-text-dark text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted text-xs mb-3">
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-muted" />
              {location}
            </span>
          )}
          {roomCount && (
            <span className="flex items-center gap-1">
              <BedDouble className="w-3.5 h-3.5 flex-shrink-0 text-muted" />
              {roomCount}
            </span>
          )}
          {area && (
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5 flex-shrink-0 text-muted" />
              {area}
            </span>
          )}
        </div>

        {/* Fiyat */}
        <div className="flex items-center justify-between gap-2 mt-1">
          <p className="font-bold text-text-dark text-lg">
            {price}
          </p>
          <span className="text-xs text-muted">
            No: {listing.listing_no ?? id?.slice(-6)}
          </span>
        </div>
      </div>
    </Link>
  );
}
