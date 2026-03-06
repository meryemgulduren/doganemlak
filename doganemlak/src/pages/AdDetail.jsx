import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Image as ImageIcon, Video, Check, Home, Heart } from "lucide-react";
import logoImg from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import {
  fetchListingById,
  fetchFavorites,
  addFavorite,
  removeFavorite,
  fetchReviews,
  createReview,
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
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState(null);

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

  const loadReviews = useCallback(() => {
    fetchReviews(id)
      .then((res) => {
        if (res.success && Array.isArray(res.data)) setReviews(res.data);
      })
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!id) return;
    loadReviews();
  }, [id, loadReviews]);

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

  const images = listing.media?.images?.length
    ? listing.media.images
    : ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&h=600&fit=crop"];

  const handlePrev = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };
  const handleNext = () => {
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const featuresByCategory = (listing.features || []).reduce((acc, f) => {
    const cat = f.category || "OTHER";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(f);
    return acc;
  }, {});

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
            <div className="relative bg-secondary/10 rounded-xl overflow-hidden mb-3">
              <img
                src={images[activeImageIndex]}
                alt={listing.title}
                className="w-full max-h-[380px] object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-text-dark/70 text-white rounded-full p-1.5 hover:bg-text-dark transition-colors"
                    aria-label="Önceki fotoğraf"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-text-dark/70 text-white rounded-full p-1.5 hover:bg-text-dark transition-colors"
                    aria-label="Sonraki fotoğraf"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full bg-text-dark/80 text-background text-xs font-medium">
                {activeImageIndex + 1} / {images.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs sm:text-sm mb-4">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-text-dark/70 text-background font-medium hover:bg-text-dark"
              >
                <ImageIcon className="w-4 h-4" />
                Büyük Fotoğraf
              </button>
              {listing.media?.videos?.length > 0 && (
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-text-dark/70 text-background font-medium hover:bg-text-dark"
                >
                  <Video className="w-4 h-4" />
                  Video
                </button>
              )}
            </div>
            <div className="border-t border-accent/40 pt-3 mt-1">
              <p className="text-xs sm:text-sm leading-relaxed text-text-dark uppercase tracking-wide whitespace-pre-line">
                {listing.description || "-"}
              </p>
            </div>
          </div>

          <div className="lg:w-2/5 bg-white rounded-2xl border border-accent/60 shadow-sm p-4 sm:p-5">
            <div className="mb-4 border-b border-gray-200 pb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-medium text-text-dark/70 mb-1">Fiyat</div>
                <div className="text-xl sm:text-2xl font-bold text-text-dark">
                  {formatPrice(listing.price, listing.currency, listing.listing_type)}
                </div>
              </div>
              <button
                type="button"
                onClick={handleFavoriteToggle}
                disabled={favoriteLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary text-primary text-xs sm:text-sm font-medium hover:bg-primary hover:text-white transition-colors disabled:opacity-60"
              >
                <Heart className={`w-4 h-4 ${isFavorite ? "fill-primary" : ""}`} />
                {isLoggedIn ? (isFavorite ? "Favorilerden Çıkar" : "Favorilerime Ekle") : "Favorilere eklemek için giriş yapın"}
              </button>
            </div>
            <div className="divide-y divide-gray-200 text-xs sm:text-sm">
              <InfoRow label="İlan No" value={listing.listing_no} valueClassName="text-red-600 font-semibold" />
              <InfoRow label="İlan Tarihi" value={formatDate(listing.listing_date)} />
              <InfoRow label="Emlak Tipi" value={listing.listing_type === "KIRALIK" ? "Kiralık" : "Satılık"} />
              <InfoRow label="m² (Brüt)" value={listing.m2_brut} />
              <InfoRow label="m² (Net)" value={listing.m2_net} />
              <InfoRow label="Oda Sayısı" value={listing.room_count} />
              <InfoRow label="Bulunduğu Kat" value={listing.floor_number} />
              <InfoRow label="Kat Sayısı" value={listing.total_floors} />
              <InfoRow label="Bina Yaşı" value={listing.building_age} />
              <InfoRow label="Isıtma" value={listing.heating_type} />
              <InfoRow label="Banyo Sayısı" value={listing.bathroom_count} />
              <InfoRow label="Balkon" value={listing.balcony ? "Var" : "Yok"} />
              <InfoRow label="Eşyalı" value={listing.furnished ? "Evet" : "Hayır"} />
              <InfoRow label="Site İçerisinde" value={listing.in_site ? "Evet" : "Hayır"} />
              <InfoRow label="Kullanım Durumu" value={listing.using_status} />
              <InfoRow label="Krediye Uygun" value={listing.credit_eligible ? "Evet" : "Hayır"} />
            </div>
          </div>
        </section>

        {/* Yorumlar */}
        <section className="bg-white rounded-2xl border border-accent/60 shadow-sm p-4 sm:p-5 mt-6">
          <h2 className="text-base sm:text-lg font-semibold text-text-dark mb-3">Yorumlar</h2>
          {reviews.length === 0 && !reviewMessage && (
            <p className="text-sm text-text-dark/70">Henüz onaylı yorum yok.</p>
          )}
          {reviewMessage && (
            <p className="text-sm text-primary mb-3">{reviewMessage}</p>
          )}
          <ul className="space-y-3 mb-4">
            {reviews.map((r) => (
              <li key={r._id} className="border-b border-accent/30 pb-3 last:border-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-text-dark">{r.user_id?.username ?? "Kullanıcı"}</span>
                  <span className="text-text-dark/70">• {r.rating}/5</span>
                  <span className="text-text-dark/60 text-xs">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString("tr-TR") : ""}
                  </span>
                </div>
                <p className="text-text-dark text-sm mt-1">{r.comment_text}</p>
              </li>
            ))}
          </ul>
          {isLoggedIn ? (
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Puan (1-5)</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="w-full max-w-[120px] px-3 py-2 border border-accent/60 rounded-lg text-text-dark bg-white"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">Yorum</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={3}
                  required
                  className="w-full px-3 py-2 border border-accent/60 rounded-lg text-text-dark bg-white resize-none"
                  placeholder="Yorumunuzu yazın..."
                />
              </div>
              <button
                type="submit"
                disabled={reviewSubmitting || !reviewText.trim()}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
              >
                {reviewSubmitting ? "Gönderiliyor..." : "Gönder"}
              </button>
            </form>
          ) : (
            <p className="text-sm text-text-dark/70">
              Yorum yapmak için <Link to="/login" className="text-primary underline">giriş yapın</Link>.
            </p>
          )}
        </section>

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
      </div>
    </div>
  );
}

function InfoRow({ label, value, valueClassName = "" }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-text-dark/80">{label}</span>
      <span className={`text-text-dark font-medium ${valueClassName}`}>
        {value ?? "-"}
      </span>
    </div>
  );
}
