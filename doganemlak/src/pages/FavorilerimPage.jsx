import { useState, useEffect } from "react";
import { fetchFavorites } from "../api/listings";
import Card from "../components/Card";

export default function FavorilerimPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <p className="text-text-dark/70 font-sans p-6">Yükleniyor...</p>;
  if (error) return <p className="text-danger font-sans p-6">{error}</p>;

  return (
    <div className="w-full px-3 sm:px-4 lg:px-6 py-6 font-sans">
      <h2 className="text-2xl font-extrabold text-text-dark mb-4">Favori İlanlarım</h2>
      {listings.length === 0 ? (
        <p className="text-text-dark/70">Henüz favori ilanınız yok.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <Card key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
