import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Check, Home, Heart, X } from "lucide-react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import logoImg from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import Seo from "../components/Seo";
import {
  fetchListingById,
  fetchFavorites,
  addFavorite,
  removeFavorite,
} from "../api/listings";
import {
  fetchFavoriteConsultants,
  addFavoriteConsultant,
  removeFavoriteConsultant,
} from "../api/consultants";

const CATEGORY_LABELS = {
  IC_OZELLIKLER: "İç Özellikler",
  DIS_OZELLIKLER: "Dış Özellikler",
  MUHIT: "Muhit",
  ULASIM: "Ulaşım",
  MANZARA: "Manzara",
  KONUT_TIPI: "Konut Tipi",
  ENGELLI_UYGUNLUK: "Engelliye Uygunluk",
};
const DUKKAN_MAGAZA_DETAIL_GROUPS = [
  {
    id: "KULLANIM_AMACI",
    label: "Kullanım Amacı",
    items: [
      "Ayakkabıcı & Lostra", "Çay Ocağı", "Çiğ Köfteci", "Market",
      "Mefruşatçı & Perdeci", "Motosiklet Servis & Bakım", "Muayenehane", "Otomotiv",
      "Oyun Kafe", "Prova & Kayıt Stüdyosu", "Su Bayi", "Tamirhane",
      "Tekel Bayi", "Tüp Bayi",
    ],
  },
  {
    id: "GENEL_OZELLIKLER",
    label: "Genel Özellikler",
    items: [
      "Güvenlik Kamerası", "Jeneratör", "Su Deposu", "Yangın Alarmı",
      "Hırsız Alarmı", "Hidrofor", "Mutfak", "WC",
    ],
  },
  {
    id: "ALT_YAPI",
    label: "Alt Yapı",
    items: [
      "ADSL", "Wi-Fi", "Kablo TV", "Uydu",
      "Intercom", "Telefon Hattı", "Faks - Telefon Hattı", "Sanayi Elektriği",
    ],
  },
];
const DEPO_ANTREPO_DETAIL_GROUPS = [
  {
    id: "GENEL_OZELLIKLER",
    label: "Genel Özellikler",
    items: [
      "Asansör", "Güvenlik Kamerası", "Jeneratör", "Su Deposu",
      "Yangın Merdiveni", "Yangın Alarmı", "Hırsız Alarmı", "Hidrofor",
      "Açık Otopark", "Kapalı Otopark", "Bahçe", "Mutfak", "WC",
    ],
  },
  {
    id: "ALT_YAPI",
    label: "Alt Yapı",
    items: ["ADSL", "Wi-Fi", "Kablo TV", "Uydu", "Intercom", "Telefon Hattı"],
  },
];
const KOMPLE_BINA_DETAIL_GROUPS = [
  {
    id: "KULLANIM_AMACI",
    label: "Kullanım Amacı",
    items: [
      "Anaokulu", "Atölye", "Banka", "Büro & Ofis",
      "Cafe & Bar", "Dershane & Kurs", "İmalathane", "Kuaför & Güzellik Merkezi",
      "Muayenehane", "Pastane & Fırın", "Poliklinik", "Restoran & Lokanta",
      "Sağlık Merkezi & Hastane", "Sinema & Konferans Salonu", "Spor Tesisi", "Yurt",
    ],
  },
  {
    id: "BINA_OZELLIKLERI",
    label: "Bina Özellikleri",
    items: [
      "Açık Otopark", "Asansör", "Güvenlik Kamerası", "Helikopter Sahası",
      "Hırsız Alarmı", "Hidrofor", "Jeneratör", "Kapalı Otopark",
      "Su Deposu", "Su Yalıtımı", "Yangın Alarmı", "Yangın Merdiveni",
    ],
  },
  {
    id: "DIS_CEPHE_OZELLIKLERI",
    label: "Dış Cephe Özellikleri",
    items: ["Ahşap Kaplama", "BTB Kaplama", "Cam Giydirme", "Siding Kaplama", "Taş Kaplama"],
  },
  {
    id: "MANZARA",
    label: "Manzara",
    items: ["Deniz", "Doğa", "Şehir"],
  },
  {
    id: "ALT_YAPI",
    label: "Alt Yapı",
    items: ["ADSL", "Intercom", "Kablo TV", "Telefon Hattı", "Uydu", "Wi-Fi"],
  },
  {
    id: "YAKINLIK",
    label: "Yakınlık",
    items: ["Cami", "Hastane", "Havaalanı", "Kilise", "Market", "Restoran", "Sağlık Ocağı", "Toplu Taşıma", "Veteriner"],
  },
];
const ARSA_DETAIL_GROUPS = [
  {
    id: "ALT_YAPI",
    label: "Altyapı",
    items: [
      "Elektrik", "Sanayi Elektriği", "Su", "Telefon",
      "Doğalgaz", "Kanalizasyon", "Arıtma", "Sondaj & Kuyu",
      "Zemin Etüdü", "Yolu Açılmış", "Yolu Açılmamış", "Yolu Yok",
    ],
  },
  {
    id: "KONUM",
    label: "Konum",
    items: ["Ana Yola Yakın", "Denize Sıfır", "Denize Yakın", "Havaalanına Yakın", "Toplu Ulaşıma Yakın"],
  },
  {
    id: "GENEL_OZELLIKLER",
    label: "Genel Özellikler",
    items: ["İfrazlı", "Parselli", "Projeli", "Köşe Parsel"],
  },
  {
    id: "MANZARA",
    label: "Manzara",
    items: ["Şehir", "Deniz", "Doğa", "Boğaz", "Göl"],
  },
];

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

function buildListingSeoTitle(listing) {
  const city = listing?.location?.city || "Samsun";
  const district = listing?.location?.district || "Merkez";
  const listingType = listing?.listing_type === "KIRALIK" ? "Kiralık" : "Satılık";
  const roomPart = listing?.room_count ? `${listing.room_count} ` : "";
  const propertyType =
    listing?.category === "ARSA"
      ? "Arsa"
      : listing?.property_type === "IS_YERI"
        ? "İş Yeri"
        : "Daire";
  return `${city} ${district} ${listingType} ${roomPart}${propertyType} | Doğan Emlak`
    .replace(/\s+/g, " ")
    .trim();
}

function buildListingSeoDescription(listing) {
  const city = listing?.location?.city || "Samsun";
  const district = listing?.location?.district || "Merkez";
  const neighborhood = listing?.location?.neighborhood ? `${listing.location.neighborhood}, ` : "";
  const listingType = listing?.listing_type === "KIRALIK" ? "kiralık" : "satılık";
  const roomPart = listing?.room_count ? `${listing.room_count} ` : "";
  const shortDescription = (listing?.description || "").replace(/\s+/g, " ").trim();
  const base = `${city} ${district} bölgesinde ${neighborhood}${listingType} ${roomPart}daire ilanı.`;
  if (!shortDescription) return base;
  return `${base} ${shortDescription}`.slice(0, 160);
}

function resolveAbsoluteMediaUrl(url) {
  if (!url || typeof url !== "string") return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  const api = import.meta.env.VITE_API_URL;
  const origin = api.replace(/\/api\/?$/, "");
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${origin}${path}`;
}

function buildBreadcrumbListSchema({ siteUrl, listingId, listing }) {
  const pathItems = [
    { name: "Ana Sayfa", path: "/" },
    { name: "İlanlar", path: "/ilanlar" },
  ];
  const city = (listing?.location?.city || "").trim().toLowerCase();
  if (city === "samsun" && listing?.listing_type) {
    const offerSlug = listing.listing_type === "KIRALIK" ? "kiralik" : "satilik";
    const label =
      listing.listing_type === "KIRALIK" ? "Samsun Kiralık İlanlar" : "Samsun Satılık İlanlar";
    pathItems.push({ name: label, path: `/${offerSlug}` });
  }
  pathItems.push({ name: listing?.title || "İlan", path: `/ilan/${listingId}` });

  return {
    "@type": "BreadcrumbList",
    itemListElement: pathItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}

function buildRealEstateListingSchema(listing, canonicalUrl) {
  const imageUrl = resolveAbsoluteMediaUrl(listing?.media?.images?.[0]);
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing?.title || "Emlak İlanı",
    description: listing?.description || "",
    url: canonicalUrl,
    datePosted: listing?.listing_date || listing?.createdAt || undefined,
    image: imageUrl,
    offers: {
      "@type": "Offer",
      price: Number(listing?.price || 0),
      priceCurrency: listing?.currency || "TRY",
      availability:
        listing?.status === "SOLD"
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
      itemCondition: "https://schema.org/UsedCondition",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: listing?.location?.address_details || undefined,
      addressLocality: listing?.location?.district || undefined,
      addressRegion: listing?.location?.city || undefined,
      addressCountry: "TR",
    },
  };
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
  const [favoriteConsultantIds, setFavoriteConsultantIds] = useState(new Set());
  const [consultantFavoriteLoading, setConsultantFavoriteLoading] = useState(false);

  // Lightbox States
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  /** Sol sütun: Açıklama | Video | Konum tek alanda */
  const [detailPanel, setDetailPanel] = useState("aciklama");

  useEffect(() => {
    setActiveImageIndex(0);
    setDetailPanel("aciklama");
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

  useEffect(() => {
    if (!isLoggedIn) {
      setFavoriteConsultantIds(new Set());
      return;
    }
    let cancelled = false;
    fetchFavoriteConsultants()
      .then((res) => {
        if (!cancelled && res.success && Array.isArray(res.data)) {
          setFavoriteConsultantIds(new Set(res.data.map((c) => String(c._id))));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

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

  const consultantIdRaw = listing?.admin_id?._id ?? listing?.admin_id;
  const consultantId = consultantIdRaw != null ? String(consultantIdRaw) : null;
  const currentUserId = user?._id != null ? String(user._id) : user?.id != null ? String(user.id) : null;
  const isOwnConsultantProfile = Boolean(consultantId && currentUserId && currentUserId === consultantId);
  const isConsultantFavorite = consultantId ? favoriteConsultantIds.has(consultantId) : false;

  const handleConsultantFavoriteToggle = async () => {
    if (!consultantId) return;
    if (!isLoggedIn) {
      navigate("/login", { state: { from: { pathname: `/ilan/${id}` } } });
      return;
    }
    if (isOwnConsultantProfile) return;

    setConsultantFavoriteLoading(true);
    try {
      if (isConsultantFavorite) {
        await removeFavoriteConsultant(consultantId);
        setFavoriteConsultantIds((prev) => {
          const next = new Set(prev);
          next.delete(consultantId);
          return next;
        });
      } else {
        await addFavoriteConsultant(consultantId);
        setFavoriteConsultantIds((prev) => new Set([...prev, consultantId]));
      }
    } finally {
      setConsultantFavoriteLoading(false);
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
      <div className="min-h-[60vh] flex items-center justify-center bg-[#faf8f3] font-sans">
        <p className="text-text-dark/70">İlan yükleniyor...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#faf8f3] font-sans">
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
  const isIsYeri = listing.property_type === "IS_YERI";
  const commercialFeatures =
    (Array.isArray(listing.commercial_features) && listing.commercial_features.length > 0)
      ? listing.commercial_features
      : Array.isArray(listing.specifications?.commercial_features)
        ? listing.specifications.commercial_features
        : [];
  const facadeFeatures = Array.isArray(listing.facade) ? listing.facade : [];
  const isDukkanMagaza = isIsYeri && listing.subType === "DUKKAN_MAGAZA";
  const isDepoAntrepo = isIsYeri && listing.subType === "DEPO_ANTREPO";
  const isKompleBina = isIsYeri && listing.subType === "KOMPLE_BINA";
  const showKonutBooleans = listing.category === "KONUT";
  const isBina = listing.category === "BINA" || listing.property_type === "BINA";
  const dukkanGroupedDetails = DUKKAN_MAGAZA_DETAIL_GROUPS
    .map((group) => ({
      ...group,
      selected: group.items.filter((item) => commercialFeatures.includes(item)),
    }))
    .filter((group) => group.selected.length > 0);
  const depoGroupedDetails = DEPO_ANTREPO_DETAIL_GROUPS
    .map((group) => ({
      ...group,
      selected: group.items.filter((item) => commercialFeatures.includes(item)),
    }))
    .filter((group) => group.selected.length > 0);
  const kompleBinaGroupedDetails = KOMPLE_BINA_DETAIL_GROUPS
    .map((group) => ({
      ...group,
      selected: group.items.filter((item) => commercialFeatures.includes(item)),
    }))
    .filter((group) => group.selected.length > 0);
  const groundSurveyValue =
    listing.specifications?.ground_survey ??
    listing.specifications?.groundSurvey ??
    listing.ground_survey;
  const binaTypeValue =
    listing.specifications?.bina_type ??
    listing.specifications?.binaType ??
    listing.bina_type;
  const arsaSpecs = listing.specifications || {};
  const isArsa = listing.category === "ARSA" || listing.property_type === "ARSA";
  const isKonut = listing.category === "KONUT" || listing.property_type === "DAIRE" || listing.property_type === "VILLA";
  const binaFeatureValues = Array.isArray(listing.specifications?.bina_features) ? listing.specifications.bina_features : [];
  const arsaFeatureValues = Array.isArray(arsaSpecs.arsa_features) ? arsaSpecs.arsa_features : [];
  const arsaGroupedDetails = ARSA_DETAIL_GROUPS
    .map((group) => ({
      ...group,
      selected: group.items.filter((item) => arsaFeatureValues.includes(item)),
    }))
    .filter((group) => group.selected.length > 0);

  const currentMedia = mediaList[activeImageIndex];
  const videoUrls = Array.isArray(listing.media?.videos) ? listing.media.videos : [];
  const hasMapCoords =
    Boolean(listing.location?.coordinates?.lat) && Boolean(listing.location?.coordinates?.lng);
  const siteUrl = (import.meta.env.VITE_SITE_URL || "https://www.doganemlak.com").replace(/\/$/, "");
  const canonicalUrl = `${siteUrl}/ilan/${id}`;
  const seoTitle = buildListingSeoTitle(listing);
  const seoDescription = buildListingSeoDescription(listing);
  const listingLdFull = buildRealEstateListingSchema(listing, canonicalUrl);
  const listingLdBody = { ...listingLdFull };
  delete listingLdBody["@context"];
  const breadcrumbLd = buildBreadcrumbListSchema({ siteUrl, listingId: id, listing });
  const seoJsonLd = {
    "@context": "https://schema.org",
    "@graph": [listingLdBody, breadcrumbLd],
  };
  const ogImage = resolveAbsoluteMediaUrl(listing?.media?.images?.[0]);
  const listingImageAlt = `${listing?.title || "Emlak İlanı"} - Doğan Emlak Samsun`;

  return (
    <>
      <Seo
        title={seoTitle}
        description={seoDescription}
        canonical={canonicalUrl}
        jsonLd={seoJsonLd}
        ogImage={ogImage}
      />
      <div className="min-h-screen bg-[#faf8f3] pt-6 pb-10 font-sans">
        <div className="max-w-[1280px] mx-auto px-3 sm:px-4 lg:px-6 relative">
        <nav aria-label="Sayfa konumu" className="mb-3 text-xs sm:text-sm text-text-dark/65">
          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <li>
              <Link to="/" className="text-primary hover:underline">
                Ana Sayfa
              </Link>
            </li>
            <li aria-hidden className="text-text-dark/40">
              /
            </li>
            <li>
              <Link to="/ilanlar" className="text-primary hover:underline">
                İlanlar
              </Link>
            </li>
            {(listing?.location?.city || "").trim().toLowerCase() === "samsun" &&
              listing?.listing_type && (
                <>
                  <li aria-hidden className="text-text-dark/40">
                    /
                  </li>
                  <li>
                    <Link
                      to={listing.listing_type === "KIRALIK" ? "/kiralik" : "/satilik"}
                      className="text-primary hover:underline"
                    >
                      {listing.listing_type === "KIRALIK" ? "Samsun kiralık" : "Samsun satılık"}
                    </Link>
                  </li>
                </>
              )}
            <li aria-hidden className="text-text-dark/40">
              /
            </li>
            <li className="text-text-dark font-medium truncate max-w-[12rem] sm:max-w-md">
              {listing.title}
            </li>
          </ol>
        </nav>
        <header className="mb-4 sm:mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <img
              src={logoImg}
              alt="Doğan Emlak Group"
              className="h-14 sm:h-24 w-auto object-contain shrink-0 ml-0 sm:-ml-28 md:-ml-32 lg:-ml-36"
            />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-text-dark leading-snug">
                {listing.title}
              </h1>
              <p className="mt-1 text-sm text-text-dark/70">
                {locationString(listing.location)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="self-end sm:self-start shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-text-dark/40 text-text-dark text-xs sm:text-sm bg-white/80 hover:bg-text-dark hover:text-background transition-colors shadow-sm"
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
                  alt={listingImageAlt}
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
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3">
              <button
                type="button"
                onClick={() => openLightbox(activeImageIndex)}
                className="px-2.5 py-1.5 rounded-lg border border-accent/60 bg-white text-primary text-sm font-medium transition-colors shrink-0 hover:bg-accent/30"
              >
                {currentMedia.type === "video" ? "Videoyu Oynat" : "Büyük Fotoğraf"}
              </button>
              {(
                [
                  { id: "aciklama", label: "Açıklama" },
                  { id: "video", label: "Video" },
                  { id: "konum", label: "Konum" },
                ]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDetailPanel(tab.id)}
                  className={`px-2.5 py-1.5 rounded-lg border text-sm font-medium transition-colors shrink-0 ${
                    detailPanel === tab.id
                      ? "border-primary bg-primary text-white"
                      : "border-accent/60 bg-white text-primary hover:bg-accent/30"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div
              className="rounded-xl border border-accent/50 bg-accent/20 p-3 sm:p-4 min-h-[140px]"
              aria-live="polite"
            >
              {detailPanel === "aciklama" && (
                <p className="text-sm sm:text-base leading-relaxed text-text-dark uppercase tracking-wide whitespace-pre-line">
                  {listing.description || "—"}
                </p>
              )}
              {detailPanel === "video" && (
                <div className="space-y-3">
                  {videoUrls.length > 0 ? (
                    videoUrls.map((url) => (
                      <video
                        key={url}
                        src={url}
                        controls
                        playsInline
                        className="w-full rounded-lg bg-black max-h-[280px]"
                      />
                    ))
                  ) : (
                    <p className="text-xs sm:text-sm text-text-dark/60">Bu ilan için video eklenmemiş.</p>
                  )}
                </div>
              )}
              {detailPanel === "konum" && (
                <div className="space-y-3">
                  <div className="text-sm sm:text-base text-text-dark space-y-1">
                    <p className="font-semibold text-text-dark">Adres</p>
                    <p>{locationString(listing.location) || "—"}</p>
                    {listing.location?.address_details ? (
                      <p className="text-text-dark/80 whitespace-pre-line">{listing.location.address_details}</p>
                    ) : null}
                    {hasMapCoords ? (
                      <p className="text-xs sm:text-sm text-muted font-mono pt-1">
                        {listing.location.coordinates.lat.toFixed(6)}, {listing.location.coordinates.lng.toFixed(6)}
                      </p>
                    ) : null}
                  </div>
                  {hasMapCoords ? (
                    <div className="h-52 sm:h-64 w-full rounded-xl overflow-hidden border border-border shadow-inner z-0">
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
                  ) : (
                    <p className="text-sm text-text-dark/60">
                      Haritada göstermek için koordinat bilgisi girilmemiş.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:w-2/5 bg-surface rounded-2xl border border-border shadow-card p-4 sm:p-5">
            <div className="mb-4 border-b border-border pb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-medium text-muted mb-1">Fiyat</div>
                <div className="text-xl sm:text-2xl font-bold text-text-dark">
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
              <InfoRow label="İlan No" value={listing.listing_no} valueClassName="text-bordeaux font-semibold" />
              <InfoRow label="İlan Tarihi" value={formatDate(listing.listing_date)} />
              <InfoRow label="Emlak Tipi" value={listing.listing_type === "KIRALIK" ? "Kiralık" : "Satılık"} />
              {isArsa ? (
                <>
                  <InfoRow label="m²" value={listing.m2_brut ?? arsaSpecs.m2_brut} />
                  <InfoRow label="İmar Durumu" value={arsaSpecs.zoning_status} />
                  <InfoRow label="Ada No" value={arsaSpecs.ada_no} />
                  <InfoRow label="Parsel No" value={arsaSpecs.parsel_no} />
                  <InfoRow label="Pafta No" value={arsaSpecs.pafta_no} />
                  <InfoRow label="Kaks (Emsal)" value={arsaSpecs.kaks_emsal} />
                  <InfoRow label="Gabari" value={arsaSpecs.gabari} />
                  <InfoRow
                    label="Krediye Uygun"
                    value={
                      typeof arsaSpecs.credit_eligible === "boolean"
                        ? (arsaSpecs.credit_eligible ? "Evet" : "Hayır")
                        : null
                    }
                  />
                  <InfoRow label="Tapu Durumu" value={arsaSpecs.title_deed_status ?? listing.title_deed_status} />
                  <InfoRow label="Taşınmaz Numarası" value={arsaSpecs.registry_number ?? listing.registry_number} />
                  <InfoRow label="Takaslı" value={arsaSpecs.swap_option ?? listing.swap_option} />
                </>
              ) : (
                <>
                  <InfoRow label={isBina ? "m²" : "m² (Brüt)"} value={listing.m2_brut} />
                  <InfoRow label="m² (Net)" value={isBina ? null : listing.m2_net} />
                  <InfoRow label="Oda Sayısı" value={isBina ? null : listing.room_count} />
                  {listing.subType !== "MUSTAKIL_VILLA" && (
                    <InfoRow label="Bulunduğu Kat" value={isBina ? null : listing.floor_number} />
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
                  <InfoRow
                    label="Bir Kattaki Daire"
                    value={isBina ? (listing.specifications?.apartment_count ?? null) : null}
                  />
                  <InfoRow label="Bina Tipi" value={listing.subType === "KOMPLE_BINA" ? binaTypeValue : null} />
                  <InfoRow label="Bina Yaşı" value={listing.building_age} />
                  <InfoRow label={isBina ? "Isıtma Tipi" : "Isıtma"} value={listing.heating_type} />
                  <InfoRow label="Mutfak" value={listing.category === "KONUT" ? listing.specifications?.kitchen_type : null} />
                  <InfoRow
                    label="Asansör"
                    value={
                      listing.category === "KONUT" || isBina
                        ? (listing.specifications?.elevator ?? null)
                        : null
                    }
                  />
                  <InfoRow
                    label="Otopark"
                    value={
                      listing.category === "KONUT" || isBina
                        ? (listing.specifications?.parking ?? null)
                        : null
                    }
                  />
                  <InfoRow
                    label="Takaslı"
                    value={
                      listing.category === "KONUT" || isBina
                        ? (listing.specifications?.swap_option ?? listing.swap_option)
                        : null
                    }
                  />
                  <InfoRow
                    label="Aidat (TL)"
                    value={listing.category === "KONUT" ? (listing.dues ?? listing.specifications?.dues) : null}
                  />
                  <InfoRow
                    label="Tapu Durumu"
                    value={
                      listing.category === "KONUT" || isBina
                        ? (listing.specifications?.title_deed_status ?? listing.title_deed_status)
                        : null
                    }
                  />
                  <InfoRow
                    label="Taşınmaz Numarası"
                    value={
                      listing.category === "KONUT" || isBina
                        ? (listing.specifications?.registry_number ?? listing.registry_number)
                        : null
                    }
                  />
                  <InfoRow
                    label="Cephe"
                    value={listing.category === "KONUT" && Array.isArray(listing.facade) && listing.facade.length > 0 ? listing.facade.join(", ") : null}
                  />
                  <InfoRow label="Zemin Etüdü" value={listing.subType === "KOMPLE_BINA" ? groundSurveyValue : null} />
                  <InfoRow label="Banyo Sayısı" value={isBina ? null : listing.bathroom_count} />
                  <InfoRow label="Balkon" value={showKonutBooleans ? (listing.balcony ? "Var" : "Yok") : null} />
                  <InfoRow label="Eşyalı" value={showKonutBooleans ? (listing.furnished ? "Evet" : "Hayır") : null} />
                  <InfoRow label="Site İçerisinde" value={showKonutBooleans ? (listing.in_site ? "Evet" : "Hayır") : null} />
                  <InfoRow label="Kullanım Durumu" value={isBina ? null : listing.using_status} />
                  <InfoRow
                    label="Krediye Uygun"
                    value={
                      isBina
                        ? (
                            typeof listing.specifications?.credit_eligible === "boolean"
                              ? (listing.specifications.credit_eligible ? "Evet" : "Hayır")
                              : null
                          )
                        : (listing.credit_eligible ? "Evet" : "Hayır")
                    }
                  />
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
                      <InfoRow
                        label="Zemin Etüdü"
                        value={groundSurveyValue}
                      />
                    </>
                  )}
                </>
              )}
            </div>

            {/* ── Yetkili Danışman ── */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
                  Yetkili Danışman
                </p>
                {consultantId && (
                  <button
                    type="button"
                    onClick={handleConsultantFavoriteToggle}
                    disabled={consultantFavoriteLoading || isOwnConsultantProfile}
                    title={
                      isOwnConsultantProfile
                        ? "Kendi danışman hesabınızı favoriye ekleyemezsiniz."
                        : undefined
                    }
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg border transition-colors disabled:opacity-60 ${
                      isOwnConsultantProfile
                        ? "border-border text-text-dark/40 cursor-not-allowed"
                        : isConsultantFavorite
                          ? "border-danger/50 text-danger bg-danger/5"
                          : "border-primary/40 text-primary hover:bg-primary/5"
                    }`}
                  >
                    <span aria-hidden>❤️</span>
                    {isOwnConsultantProfile
                      ? "Danışmanı Favorile"
                      : isLoggedIn
                        ? isConsultantFavorite
                          ? "Favorilerde"
                          : "Danışmanı Favorile"
                        : "Danışmanı Favorile"}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                {/* Avatar */}
                {listing.admin_id?.profile_image ? (
                  <img
                    src={listing.admin_id.profile_image}
                    alt=""
                    className="w-11 h-11 rounded-full object-cover flex-shrink-0 border border-accent/30"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-base flex-shrink-0 bg-gradient-to-br from-bordeaux to-[#5c1520]">
                    {listing.admin_id
                      ? (listing.admin_id.first_name?.[0] || listing.admin_id.username?.[0] || "D").toUpperCase()
                      : "D"}
                  </div>
                )}
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
                    <p className="text-xs text-muted">—</p>
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
                    <p className="text-xs text-muted">—</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* İş Yeri için kategoriye özel özellikler */}
        {isDukkanMagaza && (dukkanGroupedDetails.length > 0 || facadeFeatures.length > 0) && (
          <section className="bg-white rounded-2xl border border-accent/60 shadow-sm p-4 sm:p-5">
            <h2 className="text-base sm:text-lg font-semibold text-text-dark mb-3">Ticari Özellikler</h2>
            <div className="space-y-4 sm:space-y-5">
              {dukkanGroupedDetails.map((group) => (
                <div key={group.id}>
                  <h3 className="text-sm font-semibold text-text-dark mb-1.5">{group.label}</h3>
                  <div className="bg-background/70 rounded-xl border border-accent/40 px-3 sm:px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {group.selected.map((item) => (
                        <span
                          key={item}
                          className="inline-block px-3 py-1 rounded-full text-xs font-medium border border-accent/50 bg-accent/10 text-text-dark"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {facadeFeatures.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-text-dark mb-1.5">Cephe</h3>
                  <div className="bg-background/70 rounded-xl border border-accent/40 px-3 sm:px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {facadeFeatures.map((item) => (
                        <span
                          key={item}
                          className="inline-block px-3 py-1 rounded-full text-xs font-medium border border-accent/50 bg-accent/10 text-text-dark"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
        {isDepoAntrepo && (depoGroupedDetails.length > 0 || facadeFeatures.length > 0) && (
          <section className="bg-white rounded-2xl border border-accent/60 shadow-sm p-4 sm:p-5">
            <h2 className="text-base sm:text-lg font-semibold text-text-dark mb-3">Özellikler</h2>
            <div className="space-y-4 sm:space-y-5">
              {depoGroupedDetails.map((group) => (
                <div key={group.id}>
                  <h3 className="text-sm font-semibold text-text-dark mb-1.5">{group.label}</h3>
                  <div className="bg-background/70 rounded-xl border border-accent/40 px-3 sm:px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {group.selected.map((item) => (
                        <span
                          key={item}
                          className="inline-block px-3 py-1 rounded-full text-xs font-medium border border-accent/50 bg-accent/10 text-text-dark"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {facadeFeatures.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-text-dark mb-1.5">Cephe</h3>
                  <div className="bg-background/70 rounded-xl border border-accent/40 px-3 sm:px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {facadeFeatures.map((item) => (
                        <span
                          key={item}
                          className="inline-block px-3 py-1 rounded-full text-xs font-medium border border-accent/50 bg-accent/10 text-text-dark"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
        {isKompleBina && (kompleBinaGroupedDetails.length > 0 || facadeFeatures.length > 0) && (
          <section className="bg-white rounded-2xl border border-accent/60 shadow-sm p-4 sm:p-5">
            <h2 className="text-base sm:text-lg font-semibold text-text-dark mb-3">Özellikler</h2>
            <div className="space-y-4 sm:space-y-5">
              {kompleBinaGroupedDetails.map((group) => (
                <div key={group.id}>
                  <h3 className="text-sm font-semibold text-text-dark mb-1.5">{group.label}</h3>
                  <div className="bg-background/70 rounded-xl border border-accent/40 px-3 sm:px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {group.selected.map((item) => (
                        <span
                          key={item}
                          className="inline-block px-3 py-1 rounded-full text-xs font-medium border border-accent/50 bg-accent/10 text-text-dark"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {facadeFeatures.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-text-dark mb-1.5">Cephe</h3>
                  <div className="bg-background/70 rounded-xl border border-accent/40 px-3 sm:px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {facadeFeatures.map((item) => (
                        <span
                          key={item}
                          className="inline-block px-3 py-1 rounded-full text-xs font-medium border border-accent/50 bg-accent/10 text-text-dark"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
        {isIsYeri && !isDukkanMagaza && !isDepoAntrepo && !isKompleBina && commercialFeatures.length > 0 && (
          <section className="bg-white rounded-2xl border border-accent/60 shadow-sm p-4 sm:p-5">
            <h2 className="text-base sm:text-lg font-semibold text-text-dark mb-3">
              Detay Bilgisi
            </h2>
            <div className="flex flex-wrap gap-2">
              {commercialFeatures.map((feat) => (
                <span
                  key={feat}
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium border border-accent/50 bg-accent/10 text-text-dark"
                >
                  {feat}
                </span>
              ))}
            </div>
          </section>
        )}



        {isArsa && arsaGroupedDetails.length > 0 && (
          <section className="bg-white rounded-2xl border border-accent/60 shadow-sm p-4 sm:p-5 mt-6">
            <h2 className="text-base sm:text-lg font-semibold text-text-dark mb-3">Özellikler</h2>
            <div className="space-y-4 sm:space-y-5">
              {arsaGroupedDetails.map((group) => (
                <div key={group.id}>
                  <h3 className="text-sm font-semibold text-text-dark mb-1.5">{group.label}</h3>
                  <div className="bg-background/70 rounded-xl border border-accent/40 px-3 sm:px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {group.selected.map((item) => (
                        <span
                          key={item}
                          className="inline-block px-3 py-1 rounded-full text-xs font-medium border border-accent/50 bg-accent/10 text-text-dark"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {isBina && binaFeatureValues.length > 0 && (
          <section className="bg-white rounded-2xl border border-accent/60 shadow-sm p-4 sm:p-5 mt-6">
            <h2 className="text-base sm:text-lg font-semibold text-text-dark mb-3">Detay Bilgisi</h2>
            <div className="flex flex-wrap gap-2">
              {binaFeatureValues.map((feat) => (
                <span
                  key={feat}
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium border border-accent/50 bg-accent/10 text-text-dark"
                >
                  {feat}
                </span>
              ))}
            </div>
          </section>
        )}
        {!isIsYeri && !isArsa && !isBina && (Object.keys(featuresByCategory).length > 0 || (isKonut && facadeFeatures.length > 0)) && (
          <section className="bg-white rounded-2xl border border-accent/60 shadow-sm p-4 sm:p-5 mt-6">
            <h2 className="text-base sm:text-lg font-semibold text-text-dark mb-3">Özellikler</h2>
            <div className="space-y-4 sm:space-y-5">
              {isKonut && facadeFeatures.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-text-dark mb-1.5">Cephe</h3>
                  <div className="bg-background/70 rounded-xl border border-accent/40 px-3 sm:px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {facadeFeatures.map((item) => (
                        <span
                          key={item}
                          className="inline-block px-3 py-1 rounded-full text-xs font-medium border border-accent/50 bg-accent/10 text-text-dark"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
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
                  alt={listingImageAlt}
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
    </>
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
