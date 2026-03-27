import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { fetchFavorites, fetchListings } from "../api/listings";
import Card from "../components/Card";
import { useAuth } from "../context/AuthContext";
import { useListingFavorites } from "../hooks/useListingFavorites";

export default function FavorilerimPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const { favoriteIds, isLoadingFavorite, toggleFavorite } = useListingFavorites();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const idsArray = Array.from(favoriteIds);
    if (idsArray.length === 0 && !isLoggedIn) {
      setListings([]);
      setLoading(false);
      return;
    }

    const fetchPromise = isLoggedIn
      ? fetchFavorites()
      : fetchListings({ ids: idsArray });

    fetchPromise
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
  }, [isLoggedIn, favoriteIds.size]);

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
        <h2 className="font-montserrat text-xl sm:text-2xl font-semibold text-black tracking-tight">
          Favori İlanlarım
        </h2>
      </div>
      {listings.length === 0 ? (
        <p className="text-text-dark/70">Henüz favori ilanınız yok.</p>
      ) : filteredListings.length === 0 ? (
        <p className="text-text-dark/70">Arama kriterlerine uygun favori ilan bulunamadı.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {filteredListings.map((listing) => (
            <Card
              key={listing._id}
              listing={listing}
              isFavorite
              favoriteLoading={isLoadingFavorite(listing._id)}
              onFavoriteClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(listing._id).then((result) => {
                  if (result === "ok") {
                    setListings((prev) => prev.filter((l) => String(l._id) !== String(listing._id)));
                  }
                });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
