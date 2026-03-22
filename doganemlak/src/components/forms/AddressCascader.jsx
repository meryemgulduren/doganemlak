import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { getCities, getDistricts, getNeighborhoods } from "../../api/city";

/**
 * Harita merkezini ve zoom seviyesini programatik olarak değiştirmek için yardımcı bileşen.
 */
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

/**
 * Harita üzerindeki tıklamaları yakalayan yardımcı bileşen.
 */
function MapEvents({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

export default function AddressCascader({ value, onChange }) {
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  
  const [mapCenter, setMapCenter] = useState([38.9637, 35.2433]); // Türkiye merkezi
  const [mapZoom, setMapZoom] = useState(6);

  const current = value || { 
    city: "", 
    district: "", 
    neighborhood: "", 
    address_details: "",
    coordinates: { lat: null, lng: null } 
  };

  // İlk yüklemede illeri getir
  useEffect(() => {
    getCities().then(res => {
      if (res.success) setCities(res.data);
    });
  }, []);

  // İl değiştiğinde ilçeleri getir ve haritayı zoomla
  useEffect(() => {
    if (current.city) {
      getDistricts(current.city).then(res => {
        if (res.success) setDistricts(res.data);
      });
      
      const city = cities.find(c => c.name === current.city);
      if (city && city.coordinates) {
        const [lat, lng] = city.coordinates.split(",").map(Number);
        setMapCenter([lat, lng]);
        setMapZoom(9);
      }
    } else {
      setDistricts([]);
      setNeighborhoods([]);
    }
  }, [current.city, cities]);

  // İlçe değiştiğinde mahalleleri getir ve haritayı zoomla
  useEffect(() => {
    if (current.city && current.district) {
      getNeighborhoods(current.city, current.district).then(res => {
        if (res.success) setNeighborhoods(res.data);
      });

      const dist = districts.find(d => d.name === current.district);
      if (dist && dist.coordinates) {
        const [lat, lng] = dist.coordinates.split(",").map(Number);
        setMapCenter([lat, lng]);
        setMapZoom(13);
      }
    } else {
      setNeighborhoods([]);
    }
  }, [current.district, current.city, districts]);

  const updateField = (key, val) => {
    if (key === "city") {
      onChange({ ...current, city: val, district: "", neighborhood: "" });
    } else if (key === "district") {
      onChange({ ...current, district: val, neighborhood: "" });
    } else {
      onChange({ ...current, [key]: val });
    }
  };

  const handleMapClick = (latlng) => {
    onChange({
      ...current,
      coordinates: { lat: latlng.lat, lng: latlng.lng }
    });
  };

  const inputCls = "w-full px-3 py-2 border border-border rounded-xl text-sm bg-surface text-text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none";
  const labelCls = "block text-xs font-semibold text-muted mb-1.5 ml-1";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelCls}>İl</label>
          <div className="relative">
            <select
              className={inputCls}
              value={current.city || ""}
              onChange={(e) => updateField("city", e.target.value)}
            >
              <option value="">İl Seçiniz</option>
              {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        <div>
          <label className={labelCls}>İlçe</label>
          <div className="relative">
            <select
              className={inputCls}
              value={current.district || ""}
              onChange={(e) => updateField("district", e.target.value)}
              disabled={!current.city}
            >
              <option value="">İlçe Seçiniz</option>
              {districts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        <div>
          <label className={labelCls}>Mahalle</label>
          <div className="relative">
            <select
              className={inputCls}
              value={current.neighborhood || ""}
              onChange={(e) => updateField("neighborhood", e.target.value)}
              disabled={!current.district}
            >
              <option value="">Mahalle Seçiniz</option>
              {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className={labelCls}>Konum İşaretleyin (Haritaya Tıklayın)</label>
        <div className="h-72 w-full rounded-2xl overflow-hidden border border-border shadow-inner relative z-0">
          <MapContainer center={mapCenter} zoom={mapZoom} className="h-full w-full" scrollWheelZoom={true}>
            <TileLayer 
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
            />
            <ChangeView center={mapCenter} zoom={mapZoom} />
            <MapEvents onClick={handleMapClick} />
            {current.coordinates?.lat && current.coordinates?.lng && (
              <Marker position={[current.coordinates.lat, current.coordinates.lng]} />
            )}
          </MapContainer>
          
          <div className="absolute bottom-3 left-3 z-[1000] bg-surface/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-[11px] font-medium text-muted shadow-lg border border-border">
            {current.coordinates?.lat 
              ? `${current.coordinates.lat.toFixed(6)}, ${current.coordinates.lng.toFixed(6)}` 
              : "Lütfen bir nokta seçin"}
          </div>
        </div>
      </div>

      <div>
        <label className={labelCls}>Açık Adres Detayı</label>
        <textarea
          value={current.address_details || ""}
          onChange={(e) => updateField("address_details", e.target.value)}
          placeholder="Sokak, bina no, kat, daire gibi detayları yazabilirsiniz..."
          className={`${inputCls} resize-none py-3`}
          rows={2}
        />
      </div>
    </div>
  );
}
