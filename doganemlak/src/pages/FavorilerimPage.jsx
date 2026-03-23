import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { fetchFavorites } from "../api/listings";
import Card from "../components/Card";

export default function FavorilerimPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchFavorites()
      .then((res) => {
        if (!cancelled && res.success) {
          setListings(Array.isArray(res.data) ? res.data : []);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Favoriler yüklenemedi.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const filteredListings = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const search = (params.get("search") || "").trim().toLowerCase();
    const category = params.get("category");
    const listingType = params.get("listing_type");
    const subType = params.get("sub_type");

    return listings.filter((listing) => {
      if (category && listing.category !== category) return false;
      if (listingType && listing.listing_type !== listingType) return false;
      if (subType && listing.subType !== subType) return false;
      if (!search) return true;

      const searchableText = [
        listing.title,
        listing.listing_no,
        listing.location?.city,
        listing.location?.district,
        listing.location?.neighborhood,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(search);
    });
  }, [listings, location.search]);

  if (loading) return <p className="text-text-dark/70 font-sans p-6">Yükleniyor...</p>;
  if (error) return <p className="text-danger font-sans p-6">{error}</p>;

  return (
    <div className="w-full px-3 sm:px-4 lg:px-6 py-6 font-sans bg-background">
      <div className="mb-6 pb-3 border-b-2 border-bordeaux/30">
        <h2 className="text-2xl font-extrabold text-text-dark">Favori İlanlarım</h2>
      </div>
      {listings.length === 0 ? (
        <p className="text-text-dark/70">Henüz favori ilanınız yok.</p>
      ) : filteredListings.length === 0 ? (
        <p className="text-text-dark/70">Arama kriterlerine uygun favori ilan bulunamadı.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredListings.map((listing) => (
            <Card key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
