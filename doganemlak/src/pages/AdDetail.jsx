import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Image as ImageIcon, Video, Check, Home, Heart, X, MapPin } from "lucide-react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet marker simgesi için düzeltme
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;
import logoImg from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import {
  fetchListingById,
  fetchFavorites,
  addFavorite,
  removeFavorite,
} from "../api/listings";

const CATEGORY_LABELS = {
  IC_OZELLIKLER: "İç Özellikler",
  DIS_OZELLIKLER: "Dış Özellikler",
  MUHIT: "Muhit",
  ULASIM: "Ulaşım",
  MANZARA: "Manzara",
  KONUT_TIPI: "Konut Tipi",
  ENGELLI_UYGUNLUK: "Engelliye Uygunluk",
};

function formatPrice(price, currency = "TRY", listingType = "SATILIK") {
  const formatted = new Intl.NumberFormat("tr-TR").format(price);
  const suffix = currency === "TRY" ? " TL" : ` ${currency}`;
  return listingType === "KIRALIK" ? `${formatted}${suffix}/ay` : `${formatted}${suffix}`;
}

function locationString(location) {
  if (!location) return "";
  const parts = [location.city, location.district, location.neighborhood].filter(Boolean);
  return parts.join(", ");
}

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("tr-TR");
}

export default function AdDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Lightbox States
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchListingById(id)
      .then((res) => {
        if (!cancelled && res.success) setListing(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "İlan yüklenemedi.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;
    fetchFavorites()
      .then((res) => {
        if (!cancelled && res.success && Array.isArray(res.data)) {
          setFavoriteIds(new Set(res.data.map((l) => l._id)));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [isLoggedIn, id]);

  const mediaList = useMemo(() => {
    const list = [
      ...(listing?.media?.images || []).map(url => ({ type: 'image', url })),
      ...(listing?.media?.videos || []).map(url => ({ type: 'video', url }))
    ];
    if (list.length === 0) {
      list.push({ type: 'image', url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&h=600&fit=crop" });
    }
    return list;
  }, [listing]);

  // Lightbox Handlers
  const openLightbox = (index = 0) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = "hidden"; // Prevent background scrolling
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = "auto";
  };

  const nextLightboxImage = (e) => {
    e?.stopPropagation(); // prevent modal click
    setLightboxIndex((prev) => (prev + 1) % mediaList.length);
  };

  const prevLightboxImage = (e) => {
    e?.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") setLightboxIndex((prev) => (prev + 1) % mediaList.length);
      if (e.key === "ArrowLeft") setLightboxIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, mediaList.length]);

  const isFavorite = favoriteIds.has(id);

  const handleFavoriteToggle = async () => {
    if (!isLoggedIn) {
      navigate("/login", { state: { from: { pathname: `/ilan/${id}` } } });
      return;
    }
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await removeFavorite(id);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        await addFavorite(id);
        setFavoriteIds((prev) => new Set([...prev, id]));
      }
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim() || !isLoggedIn) return;
    setReviewSubmitting(true);
    setReviewMessage(null);
    try {
      const res = await createReview(id, { comment_text: reviewText.trim(), rating: reviewRating });
      setReviewMessage(res.message || "Yorumunuz gönderildi.");
      setReviewText("");
      setReviewRating(5);
      loadReviews();
    } catch (err) {
      setReviewMessage(err.message || "Yorum gönderilemedi.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background font-sans">
        <p className="text-text-dark/70">İlan yükleniyor...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-background font-sans">
        <div className="bg-white/90 border border-accent/60 rounded-2xl px-6 py-8 shadow-sm text-center space-y-3">
          <p className="text-lg font-semibold text-text-dark">
            {error || "İlan bulunamadı"}
          </p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  const handlePrev = () => {
    setActiveImageIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
  };
  const handleNext = () => {
    setActiveImageIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
  };


  const featuresByCategory = (listing.features || []).reduce((acc, f) => {
    const cat = f.category || "OTHER";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(f);
    return acc;
  }, {});

  const currentMedia = mediaList[activeImageIndex];

  return (
    <div className="min-h-screen bg-background pt-6 pb-10 font-sans">
      <div className="max-w-[1280px] mx-auto px-3 sm:px-4 lg:px-6 relative">
        <header className="mb-4 sm:mb-6 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="Doğan Emlak Group"
              className="h-20 sm:h-24 w-auto object-contain fixed left-1 top-1 z-20"
            />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-text-dark leading-snug">
              {listing.title}
            </h1>
            <p className="mt-1 text-sm text-text-dark/70">
              {locationString(listing.location)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="absolute right-0 top-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-text-dark/40 text-text-dark text-xs sm:text-sm bg-white/80 hover:bg-text-dark hover:text-background transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            Ana Sayfa
          </button>
        </header>

        <section className="flex flex-col lg:flex-row gap-6 lg:gap-8 mb-6">
          <div className="lg:w-3/5 bg-white rounded-2xl border border-accent/60 shadow-sm p-3 sm:p-4">
            <div className="relative bg-secondary/10 rounded-xl overflow-hidden mb-3 group cursor-pointer" onClick={() => openLightbox(activeImageIndex)}>
              {currentMedia.type === 'video' ? (
                <div className="relative w-full aspect-video max-h-[380px] bg-black flex items-center justify-center">
                  <video
                    src={currentMedia.url}
                    className="w-full h-full object-contain"
                    muted
                    playsInline
                  />
                  {/* Play Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                    <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-xl">
                      <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-white border-b-[12px] border-b-transparent ml-2" />
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={currentMedia.url}
                  alt={listing.title}
                  className="w-full max-h-[380px] object-cover"
                />
              )}
              
              {mediaList.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-text-dark/70 text-white rounded-full p-1.5 hover:bg-text-dark transition-colors z-10"
                    aria-label="Önceki"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-text-dark/70 text-white rounded-full p-1.5 hover:bg-text-dark transition-colors z-10"
                    aria-label="Sonraki"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full bg-text-dark/80 text-background text-xs font-medium z-10">
                {activeImageIndex + 1} / {mediaList.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs sm:text-sm mb-4">
              <button
                type="button"
                onClick={() => openLightbox(activeImageIndex)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-text-dark/70 text-background font-medium hover:bg-text-dark"
              >
                {currentMedia.type === 'video' ? <Video className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                {currentMedia.type === 'video' ? "Videoyu Oynat" : "Büyük Fotoğraf"}
              </button>
            </div>
            <div className="border-t border-accent/40 pt-3 mt-1">
              <p className="text-xs sm:text-sm leading-relaxed text-text-dark uppercase tracking-wide whitespace-pre-line">
                {listing.description || "-"}
              </p>
            </div>
          </div>

          <div className="lg:w-2/5 bg-surface rounded-2xl border border-border shadow-card p-4 sm:p-5">
            <div className="mb-4 border-b border-border pb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-medium text-muted mb-1">Fiyat</div>
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {formatPrice(listing.price, listing.currency, listing.listing_type)}
                </div>
              </div>
              <button
                type="button"
                onClick={handleFavoriteToggle}
                disabled={favoriteLoading}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-medium transition-colors disabled:opacity-60
                  ${ isFavorite
                    ? "bg-danger border-danger text-white hover:bg-danger/90"
                    : "border-danger text-danger hover:bg-danger hover:text-white"
                  }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? "fill-white" : ""}`} />
                {isLoggedIn ? (isFavorite ? "Favorilerden Çıkar" : "Favorilerime Ekle") : "Giriş yapın"}
              </button>
            </div>
            <div className="divide-y divide-border text-xs sm:text-sm">
              <InfoRow label="İlan No" value={listing.listing_no} valueClassName="text-red-600 font-semibold" />
              <InfoRow label="İlan Tarihi" value={formatDate(listing.listing_date)} />
              <InfoRow label="Emlak Tipi" value={listing.listing_type === "KIRALIK" ? "Kiralık" : "Satılık"} />
              <InfoRow label="m² (Brüt)" value={listing.m2_brut} />
              <InfoRow label="m² (Net)" value={listing.m2_net} />
              <InfoRow label="Oda Sayısı" value={listing.room_count} />
              {listing.subType !== "MUSTAKIL_VILLA" && (
                <InfoRow label="Bulunduğu Kat" value={listing.floor_number} />
              )}
              {listing.subType === "MUSTAKIL_VILLA" && (() => {
                // specifications Map'ten veya top-level alandan oku
                const rawSpecs = listing.specifications;
                const specValue = rawSpecs instanceof Object
                  ? (rawSpecs.open_area_m2 ?? (rawSpecs.get ? rawSpecs.get("open_area_m2") : undefined))
                  : undefined;
                const val = listing.open_area_m2 ?? specValue;
                return val != null && val !== "" ? (
                  <InfoRow label="Açık Alan m²" value={val} />
                ) : null;
              })()}
              <InfoRow label="Kat Sayısı" value={listing.total_floors} />
              <InfoRow label="Bina Yaşı" value={listing.building_age} />
              <InfoRow label="Isıtma" value={listing.heating_type} />
              <InfoRow label="Banyo Sayısı" value={listing.bathroom_count} />
              <InfoRow label="Balkon" value={listing.balcony ? "Var" : "Yok"} />
              <InfoRow label="Eşyalı" value={listing.furnished ? "Evet" : "Hayır"} />
              <InfoRow label="Site İçerisinde" value={listing.in_site ? "Evet" : "Hayır"} />
              <InfoRow label="Kullanım Durumu" value={listing.using_status} />
              <InfoRow label="Krediye Uygun" value={listing.credit_eligible ? "Evet" : "Hayır"} />
              {/* İş Yeri alanları — property_type her zaman doğru kaydediliyor */}
              {listing.property_type === "IS_YERI" && (
                <>
                  <InfoRow label="Durumu" value={listing.property_condition} />
                  <InfoRow label="Kiracılı" value={listing.has_tenant} />
                  <InfoRow
                    label="Takaslı"
                    value={listing.specifications?.swap_option ?? listing.swap_option}
                  />
                  <InfoRow
                    label="Aidat (TL)"
                    value={listing.dues ?? listing.specifications?.dues}
                  />
                  <InfoRow
                    label="Tapu Durumu"
                    value={listing.title_deed_status ?? listing.specifications?.title_deed_status}
                  />
                  <InfoRow
                    label="Taşınmaz No"
                    value={listing.specifications?.registry_number ?? listing.registry_number}
                  />
                </>
              )}
            </div>

            {/* ── Yetkili Danışman ── */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Yetkili Danışman</p>
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-base flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #C5A25D, #a8874a)" }}
                >
                  {listing.admin_id
                    ? (listing.admin_id.first_name?.[0] || listing.admin_id.username?.[0] || "D").toUpperCase()
                    : "D"}
                </div>
                <div className="space-y-0.5 min-w-0">
                  {/* İsim Soyisim */}
                  <p className="font-semibold text-sm text-text-dark truncate">
                    {listing.admin_id
                      ? ([listing.admin_id.first_name, listing.admin_id.last_name].filter(Boolean).join(" ") || listing.admin_id.username || "—")
                      : "—"}
                  </p>
                  {/* Telefon */}
                  {listing.admin_id?.phone ? (
                    <a
                      href={`tel:${listing.admin_id.phone}`}
                      className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {listing.admin_id.phone}
                    </a>
                  ) : (
                    <p className="text-xs text-gray-400">—</p>
                  )}
                  {/* E-posta */}
                  {listing.admin_id?.email ? (
                    <a
                      href={`mailto:${listing.admin_id.email}`}
                      className="flex items-center gap-1 text-xs text-text-dark/60 hover:text-primary transition-colors truncate"
                    >
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {listing.admin_id.email}
                    </a>
                  ) : (
                    <p className="text-xs text-gray-400">—</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dükkan & Mağaza - Ticari Özellikler */}
        {listing.property_type === "IS_YERI" &&
          listing.subType === "DUKKAN_MAGAZA" && (() => {
            // top-level veya specifications map'ten oku
            const commercialFeats =
              (Array.isArray(listing.commercial_features) && listing.commercial_features.length > 0)
                ? listing.commercial_features
                : Array.isArray(listing.specifications?.commercial_features)
                  ? listing.specifications.commercial_features
                  : [];
            if (commercialFeats.length === 0) return null;
            return (
              <section className="bg-white rounded-2xl border border-accent/60 shadow-sm p-4 sm:p-5">
                <h2 className="text-base sm:text-lg font-semibold text-text-dark mb-3">Ticari Özellikler</h2>
                <div className="flex flex-wrap gap-2">
                  {commercialFeats.map((feat) => (
                    <span
                      key={feat}
                      className="inline-block px-3 py-1 rounded-full text-xs font-medium border border-accent/50 bg-accent/10 text-text-dark"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </section>
            );
          })()}



        {Object.keys(featuresByCategory).length > 0 && (
          <section className="bg-white rounded-2xl border border-accent/60 shadow-sm p-4 sm:p-5 mt-6">
            <h2 className="text-base sm:text-lg font-semibold text-text-dark mb-3">Özellikler</h2>
            <div className="space-y-4 sm:space-y-5">
              {Object.entries(featuresByCategory).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-text-dark mb-1.5">
                    {CATEGORY_LABELS[category] || category}
                  </h3>
                  <div className="bg-background/70 rounded-xl border border-accent/40 px-3 sm:px-4 py-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 text-xs sm:text-sm">
                      {items.map((item) => (
                        <div key={item._id} className="flex items-center gap-1.5 font-semibold text-text-dark">
                          <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span>{item.label || item.key}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Harita Konumu ── */}
        {listing.location?.coordinates?.lat && listing.location?.coordinates?.lng && (
          <section className="bg-white rounded-2xl border border-accent/60 shadow-sm p-4 sm:p-5 mt-6 overflow-hidden">
            <h2 className="text-base sm:text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Konum
            </h2>
            <div className="h-64 sm:h-96 w-full rounded-2xl overflow-hidden border border-border shadow-inner z-0">
              <MapContainer 
                center={[listing.location.coordinates.lat, listing.location.coordinates.lng]} 
                zoom={15} 
                className="h-full w-full"
                scrollWheelZoom={false}
              >
                <TileLayer 
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                />
                <Marker position={[listing.location.coordinates.lat, listing.location.coordinates.lng]} />
              </MapContainer>
            </div>
            <div className="mt-3 text-xs text-muted flex justify-between items-center px-1">
              <span>{locationString(listing.location)}</span>
              <span className="font-mono">{listing.location.coordinates.lat.toFixed(6)}, {listing.location.coordinates.lng.toFixed(6)}</span>
            </div>
          </section>
        )}
      </div>

      {/* --- Lightbox Modal --- */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center animate-fade-in"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-5 right-5 text-white/70 hover:text-white p-2 transition-colors z-[1000] bg-black/50 rounded-full"
            aria-label="Kapat"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Current Media */}
          <div className="relative w-full max-w-5xl h-full max-h-screen p-4 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {mediaList[lightboxIndex].type === 'video' ? (
              <video
                src={mediaList[lightboxIndex].url}
                className="max-w-full max-h-full rounded-lg shadow-2xl"
                controls
                autoPlay
                playsInline
              />
            ) : (
              <img
                src={mediaList[lightboxIndex].url}
                alt={`${listing.title} Fotoğraf ${lightboxIndex + 1}`}
                className="max-w-full max-h-full object-contain select-none rounded-lg shadow-2xl"
              />
            )}
          </div>

          {/* Left Arrow */}
          {mediaList.length > 1 && (
            <button
              type="button"
              onClick={prevLightboxImage}
              className="absolute left-4 sm:left-10 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors z-[1000] bg-black/20 hover:bg-black/50 rounded-full"
              aria-label="Önceki"
            >
              <ChevronLeft className="w-10 h-10 sm:w-16 sm:h-16" />
            </button>
          )}

          {/* Right Arrow */}
          {mediaList.length > 1 && (
            <button
              type="button"
              onClick={nextLightboxImage}
              className="absolute right-4 sm:right-10 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors z-[1000] bg-black/20 hover:bg-black/50 rounded-full"
              aria-label="Sonraki"
            >
              <ChevronRight className="w-10 h-10 sm:w-16 sm:h-16" />
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full text-white/90 text-sm font-medium tracking-widest z-[1000] border border-white/10">
            {lightboxIndex + 1} / {mediaList.length}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, valueClassName = "" }) {
  // Değer yoksa hiç gösterme
  if (value === null || value === undefined || value === "") return null;

  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-text-dark/80">{label}</span>
      <span className={`text-text-dark font-medium ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
}
