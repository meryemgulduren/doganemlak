import { MapPin, Layout, Maximize2, Tag } from "lucide-react";
import { Link } from "react-router-dom";

function formatPrice(price, currency = "TRY", listingType = "SATILIK") {
  const formatted = new Intl.NumberFormat("tr-TR").format(price);
  const suffix = currency === "TRY" ? " ₺" : ` ${currency}`;
  return listingType === "KIRALIK" ? `${formatted}${suffix}/ay` : `${formatted}${suffix}`;
}

function locationString(location) {
  if (!location) return "";
  const parts = [location.city, location.district, location.neighborhood].filter(Boolean);
  return parts.join(", ");
}

export default function Card({ listing }) {
  const id = listing._id;
  const title = listing.title;
  const location = locationString(listing.location);
  const price = formatPrice(listing.price, listing.currency, listing.listing_type);
  const type = listing.listing_type === "KIRALIK" ? "Kiralık" : "Satılık";
  const roomCount = listing.room_count ?? "-";
  const area = listing.m2_brut != null ? `${listing.m2_brut} m²` : listing.m2_net != null ? `${listing.m2_net} m²` : "-";
  const image =
    listing.media?.images?.[0] ||
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop";

  return (
    <Link
      to={`/ilan/${id}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-accent/30 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 font-sans"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary/10">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-text-dark text-background text-sm font-sans font-medium">
          {type}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-sans font-semibold text-text-dark text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <div className="flex flex-wrap items-center gap-3 text-text-dark text-sm font-sans">
          {location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 flex-shrink-0 text-text-dark" />
              {location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Layout className="w-4 h-4 flex-shrink-0 text-text-dark" />
            {roomCount}
          </span>
          <span className="flex items-center gap-1">
            <Maximize2 className="w-4 h-4 flex-shrink-0 text-text-dark" />
            {area}
          </span>
        </div>
        <p className="mt-3 font-sans font-bold text-text-dark text-xl">{price}</p>
        <span className="inline-flex items-center gap-1.5 mt-2 text-text-dark text-sm font-sans">
          <Tag className="w-4 h-4 text-text-dark" />
          İlan No: {listing.listing_no ?? id}
        </span>
      </div>
    </Link>
  );
}
