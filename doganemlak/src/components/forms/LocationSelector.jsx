import { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, GeoJSON, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import {
  MapPin,
  Map,
  MapPinned,
  FileText,
  Loader2,
  Expand,
  Shrink,
  School,
  Hospital,
  TramFront,
} from "lucide-react";
import samsunData from "../../data/samsun-geo.json";

const SAMSUN_CENTER = [41.2928, 36.3313];
const DEFAULT_ZOOM = 13;
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const SAMSUN_BOUNDS = {
  minLat: 40.8,
  maxLat: 41.7,
  minLng: 35.1,
  maxLng: 37.3,
};
const SAMSUN_BOUNDARY_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Samsun Bounds" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [SAMSUN_BOUNDS.minLng, SAMSUN_BOUNDS.minLat],
            [SAMSUN_BOUNDS.maxLng, SAMSUN_BOUNDS.minLat],
            [SAMSUN_BOUNDS.maxLng, SAMSUN_BOUNDS.maxLat],
            [SAMSUN_BOUNDS.minLng, SAMSUN_BOUNDS.maxLat],
            [SAMSUN_BOUNDS.minLng, SAMSUN_BOUNDS.minLat],
          ],
        ],
      },
    },
  ],
};

function buildSuggestedAddress(rawAddress) {
  if (!rawAddress) return "";
  const road = rawAddress.road || rawAddress.pedestrian || rawAddress.path || "";
  const houseNumber = rawAddress.house_number || "";
  const suburb = rawAddress.suburb || rawAddress.neighbourhood || rawAddress.quarter || "";
  const district = rawAddress.town || rawAddress.city_district || rawAddress.county || "Samsun";
  return [road, houseNumber, suburb, district].filter(Boolean).join(", ");
}

function hasValidCoordinates(coordinates) {
  const lat = coordinates?.lat;
  const lng = coordinates?.lng;
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng)
  );
}

function isWithinSamsunBounds(lat, lng) {
  return (
    lat >= SAMSUN_BOUNDS.minLat &&
    lat <= SAMSUN_BOUNDS.maxLat &&
    lng >= SAMSUN_BOUNDS.minLng &&
    lng <= SAMSUN_BOUNDS.maxLng
  );
}

function buildNearbyPreview(lat, lng) {
  const latOffset = Math.abs((lat % 1) * 10);
  const lngOffset = Math.abs((lng % 1) * 10);
  const schoolDistance = (0.3 + ((latOffset + lngOffset) % 1.9)).toFixed(1);
  const hospitalDistance = (0.6 + ((latOffset * 1.2 + lngOffset) % 2.4)).toFixed(1);
  const tramDistance = (0.2 + ((latOffset + lngOffset * 1.4) % 1.6)).toFixed(1);

  return [
    { key: "school", label: `Okul ~${schoolDistance} km`, icon: "school" },
    { key: "hospital", label: `Hastane ~${hospitalDistance} km`, icon: "hospital" },
    { key: "tram", label: `Tramvay ~${tramDistance} km`, icon: "tram" },
  ];
}

const customHomeMarkerIcon = L.divIcon({
  className: "custom-home-marker",
  html: `
    <div style="
      width: 34px;
      height: 34px;
      border-radius: 9999px;
      background: #49111c;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 25px rgba(73,17,28,0.35);
      border: 2px solid #F7F6F4;
      font-size: 18px;
      line-height: 1;
    ">⌂</div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

/**
 * Haritayı flyTo ile yumuşak animasyonla merkeze taşır.
 */
function FlyToCenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && map) {
      map.flyTo(center, zoom ?? DEFAULT_ZOOM, { duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

/**
 * Harita tıklamalarını yakalar.
 */
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

export default function LocationSelector({ value, onChange }) {
  const [mapVisible, setMapVisible] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [isResolvingNeighborhood, setIsResolvingNeighborhood] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapTargetCenter, setMapTargetCenter] = useState(SAMSUN_CENTER);
  const [mapTargetZoom, setMapTargetZoom] = useState(DEFAULT_ZOOM);
  const [nearbyPreview, setNearbyPreview] = useState([]);
  const [suggestedAddressText, setSuggestedAddressText] = useState("");

  const baseCurrent = value || {
    city: "Samsun",
    district: "",
    neighborhood: "",
    address_details: "",
    coordinates: { lat: null, lng: null },
  };
  const current = useMemo(() => {
    const confirmedByCoordinates = hasValidCoordinates(baseCurrent.coordinates);
    return {
      ...baseCurrent,
      map_selection_confirmed:
        typeof baseCurrent.map_selection_confirmed === "boolean"
          ? baseCurrent.map_selection_confirmed
          : confirmedByCoordinates,
    };
  }, [baseCurrent]);

  const samsunMapBounds = useMemo(() => {
    try {
      const featureBounds = L.geoJSON(SAMSUN_BOUNDARY_GEOJSON).getBounds();
      return featureBounds.isValid() ? featureBounds : null;
    } catch {
      return null;
    }
  }, []);

  const districts = useMemo(() => samsunData.districts, []);
  const neighborhoods = useMemo(() => {
    if (!current.district) return [];
    const district = districts.find((d) => d.name === current.district);
    return district?.neighborhoods ?? [];
  }, [current.district, districts]);

  const selectedNeighborhoodData = useMemo(() => {
    if (!current.district || !current.neighborhood) return null;
    const district = districts.find((d) => d.name === current.district);
    const nb = district?.neighborhoods?.find(
      (n) => (typeof n === "object" ? n.name : n) === current.neighborhood
    );
    if (nb && typeof nb === "object" && nb.coordinates) {
      return nb.coordinates;
    }
    if (district?.coordinates) return district.coordinates;
    return SAMSUN_CENTER;
  }, [current.district, current.neighborhood, districts]);

  useEffect(() => {
    if (!hasValidCoordinates(current.coordinates)) {
      setNearbyPreview([]);
      return;
    }
    setNearbyPreview(
      buildNearbyPreview(current.coordinates.lat, current.coordinates.lng)
    );
  }, [current.coordinates?.lat, current.coordinates?.lng]);

  const updateField = (key, val) => {
    const next = { ...current, city: "Samsun" };
    if (key === "district") {
      setSuggestedAddressText("");
      onChange({
        ...next,
        district: val,
        neighborhood: "",
        coordinates: { lat: null, lng: null },
        map_selection_confirmed: false,
      });
    } else if (key === "neighborhood") {
      setSuggestedAddressText("");
      onChange({
        ...next,
        neighborhood: val,
        coordinates: { lat: null, lng: null },
        map_selection_confirmed: false,
      });
    } else {
      onChange({ ...next, [key]: val });
    }
  };

  const fetchNeighborhoodCenter = async () => {
    if (!current.district || !current.neighborhood) return selectedNeighborhoodData || SAMSUN_CENTER;
    setIsResolvingNeighborhood(true);
    try {
      const q = encodeURIComponent(`Samsun, ${current.district}, ${current.neighborhood}`);
      const url = `${NOMINATIM_BASE}/search?format=jsonv2&q=${q}&limit=1&countrycodes=tr&addressdetails=1`;
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Nominatim search failed");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = Number(data[0].lat);
        const lng = Number(data[0].lon);
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          return [lat, lng];
        }
      }
      return selectedNeighborhoodData || SAMSUN_CENTER;
    } catch {
      return selectedNeighborhoodData || SAMSUN_CENTER;
    } finally {
      setIsResolvingNeighborhood(false);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    setIsReverseGeocoding(true);
    try {
      const url = `${NOMINATIM_BASE}/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error("Reverse geocoding failed");
      const data = await res.json();
      const suggestedAddress =
        buildSuggestedAddress(data?.address) ||
        data?.display_name ||
        current.address_details ||
        "";
      setSuggestedAddressText(suggestedAddress);
      onChange({
        ...current,
        city: "Samsun",
        coordinates: { lat, lng },
        address_details: suggestedAddress,
        map_selection_confirmed: true,
      });
    } catch {
      onChange({
        ...current,
        city: "Samsun",
        coordinates: { lat, lng },
        map_selection_confirmed: true,
      });
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const handleShowMap = async () => {
    setMapVisible(true);
    setIsMapLoading(true);
    const center = await fetchNeighborhoodCenter();
    setMapTargetCenter(center);
    setMapTargetZoom(15);
    setTimeout(() => setIsMapLoading(false), 250);
  };

  const handleMapClick = async (latlng) => {
    const lat = latlng.lat;
    const lng = latlng.lng;
    if (!isWithinSamsunBounds(lat, lng)) return;
    await reverseGeocode(lat, lng);
  };

  const handleMarkerDragEnd = async (e) => {
    const pos = e.target.getLatLng();
    if (!isWithinSamsunBounds(pos.lat, pos.lng)) return;
    await reverseGeocode(pos.lat, pos.lng);
  };

  const inputCls =
    "w-full px-3 py-2 border border-border rounded-xl text-sm bg-surface text-text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none";
  const labelCls = "block text-xs font-semibold text-muted mb-1.5 ml-1";

  const renderNearbyIcon = (type) => {
    if (type === "school") return <School className="w-3.5 h-3.5" />;
    if (type === "hospital") return <Hospital className="w-3.5 h-3.5" />;
    return <TramFront className="w-3.5 h-3.5" />;
  };

  const statusLabel = isReverseGeocoding
    ? "Adres bilgisi Nominatim'den alınıyor..."
    : isResolvingNeighborhood
      ? "Mahalle konumu aranıyor..."
      : "Harita hazırlanıyor...";

  const renderMapArea = (heightClass) => (
    <div className={`${heightClass} w-full rounded-2xl overflow-hidden border border-border shadow-inner relative z-0`}>
      {!mapVisible ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-accent/40 text-muted">
          <Map className="w-12 h-12 mb-2 opacity-50" />
          <p className="text-sm font-medium">
            Mahalle secip "Haritada Goster" butonuna basin
          </p>
          <p className="text-xs mt-1">
            Harita acildiktan sonra tiklayarak veya surukleyerek konum
            isaretleyebilirsiniz
          </p>
        </div>
      ) : (
        <>
          {(isMapLoading || isResolvingNeighborhood || isReverseGeocoding) && (
            <div className="absolute inset-0 z-[1200] bg-surface/75 backdrop-blur-[1px] flex items-center justify-center">
              <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-muted shadow">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{statusLabel}</span>
              </div>
            </div>
          )}
          <MapContainer
            center={mapTargetCenter}
            zoom={mapTargetZoom}
            className="h-full w-full"
            scrollWheelZoom
            maxBounds={samsunMapBounds || undefined}
            maxBoundsViscosity={0.9}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <GeoJSON
              data={SAMSUN_BOUNDARY_GEOJSON}
              style={() => ({
                color: "#30230D",
                weight: 2.4,
                fillColor: "#CBA24B",
                fillOpacity: 0.08,
                opacity: 0.95,
              })}
            />
            <FlyToCenter
              center={
                current.coordinates?.lat != null && current.coordinates?.lng != null
                  ? [current.coordinates.lat, current.coordinates.lng]
                  : mapTargetCenter
              }
              zoom={current.coordinates?.lat != null ? 16 : mapTargetZoom}
            />
            <MapClickHandler onMapClick={handleMapClick} />
            {current.coordinates?.lat != null &&
              current.coordinates?.lng != null && (
                <Marker
                  icon={customHomeMarkerIcon}
                  position={[
                    current.coordinates.lat,
                    current.coordinates.lng,
                  ]}
                  draggable
                  eventHandlers={{ dragend: handleMarkerDragEnd }}
                />
              )}
          </MapContainer>
        </>
      )}
      {current.coordinates?.lat != null &&
        current.coordinates?.lng != null && (
          <div className="absolute bottom-3 left-3 z-[1000] bg-surface/95 backdrop-blur-sm px-3 py-2 rounded-xl text-xs font-medium text-muted shadow-lg border border-border">
            {current.coordinates.lat.toFixed(6)},{" "}
            {current.coordinates.lng.toFixed(6)}
          </div>
        )}
    </div>
  );

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-lg shadow-text-dark/10 overflow-hidden">
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* İl - Sabit Samsun */}
          <div>
            <label className={labelCls}>
              <MapPin className="inline w-3.5 h-3.5 mr-1 text-muted" />
              İl
            </label>
            <div className="relative">
              <input
                type="text"
                className={`${inputCls} bg-accent/30 cursor-not-allowed`}
                value="Samsun"
                disabled
                readOnly
              />
            </div>
          </div>

          {/* İlçe */}
          <div>
            <label className={labelCls}>
              <MapPin className="inline w-3.5 h-3.5 mr-1 text-muted" />
              İlçe
            </label>
            <div className="relative">
              <select
                className={inputCls}
                value={current.district || ""}
                onChange={(e) => updateField("district", e.target.value)}
              >
                <option value="">İlçe Seçiniz</option>
                {districts.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Mahalle */}
          <div>
            <label className={labelCls}>
              <MapPin className="inline w-3.5 h-3.5 mr-1 text-muted" />
              Mahalle
            </label>
            <div className="relative">
              <select
                className={inputCls}
                value={current.neighborhood || ""}
                onChange={(e) => updateField("neighborhood", e.target.value)}
                disabled={!current.district}
              >
                <option value="">Mahalle Seçiniz</option>
                {neighborhoods.map((n) => {
                  const name = typeof n === "object" ? n.name : n;
                  return (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  );
                })}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Haritada Göster butonu */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShowMap}
            disabled={!current.district || !current.neighborhood}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold shadow-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Map className="w-4 h-4" />
            Haritada Göster
          </button>
          {!current.district || !current.neighborhood ? (
            <span className="text-xs text-muted">
              Önce ilçe ve mahalle seçin
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
            disabled={!mapVisible}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-text-dark text-xs font-semibold bg-surface hover:bg-accent/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isFullscreen ? <Shrink className="w-3.5 h-3.5" /> : <Expand className="w-3.5 h-3.5" />}
            {isFullscreen ? "Daralt" : "Genişlet"}
          </button>
        </div>

        {/* Harita alanı - placeholder veya harita */}
        <div className="space-y-2">
          <label className={labelCls}>
            <MapPinned className="inline w-3.5 h-3.5 mr-1 text-muted" />
            Konum İşaretleyin
          </label>
          {renderMapArea("h-72")}
          <AnimatePresence>
            {isFullscreen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[2000] bg-text-dark/45 backdrop-blur-sm p-4 md:p-8"
              >
                <motion.div
                  initial={{ y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  className="mx-auto max-w-6xl h-full rounded-2xl border border-border bg-surface shadow-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-text-dark">Harita - Tam Ekran</h4>
                    <button
                      type="button"
                      onClick={() => setIsFullscreen(false)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-text-dark text-xs font-semibold hover:bg-accent/30"
                    >
                      <Shrink className="w-3.5 h-3.5" />
                      Kapat
                    </button>
                  </div>
                  {renderMapArea("h-[70vh]")}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Açık Adres Detayı */}
        <div>
          <label className={labelCls}>
            <FileText className="inline w-3.5 h-3.5 mr-1 text-muted" />
            Açık Adres Detayı
          </label>
          <textarea
            value={current.address_details || ""}
            onChange={(e) => updateField("address_details", e.target.value)}
            placeholder="Sokak, bina no, kat, daire gibi detayları yazabilirsiniz..."
            className={`${inputCls} resize-none py-3`}
            rows={3}
          />
          {suggestedAddressText ? (
            <p className="mt-1.5 text-[11px] text-muted">
              Önerilen adres Nominatim ile otomatik dolduruldu. Dilerseniz düzenleyebilirsiniz.
            </p>
          ) : null}
        </div>

        {nearbyPreview.length > 0 && (
          <div className="rounded-xl border border-border bg-accent/25 p-3">
            <p className="text-xs font-semibold text-text-dark mb-2">Yakındaki Önemli Noktalar (Önizleme)</p>
            <div className="flex flex-wrap gap-2">
              {nearbyPreview.map((item) => (
                <span
                  key={item.key}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-text-dark"
                >
                  {renderNearbyIcon(item.icon)}
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
