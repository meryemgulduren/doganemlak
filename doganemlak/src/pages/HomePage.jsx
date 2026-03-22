import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter } from "lucide-react";
import { fetchListings } from "../api/listings";
import Card from "../components/Card";

export default function HomePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const listingTypeParam = searchParams.get("listing_type");
  const subTypeParam = searchParams.get("sub_type");
  const searchParamStr = searchParams.get("search");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchListings({
      page: 1,
      limit: 24,
      category: categoryParam || undefined,
      listing_type: listingTypeParam || undefined,
      sub_type: subTypeParam || undefined,
      search: searchParamStr || undefined,
    })
      .then((res) => {
        if (!cancelled && res.success) {
          setListings(res.data || []);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "İlanlar yüklenemedi.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [categoryParam, listingTypeParam, subTypeParam, searchParamStr]);

  return (
    <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-10 font-sans">
      <div className="max-w-[1600px] mx-auto w-full">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-2 border-b-2 border-bordeaux/30">
          <h2 className="text-2xl font-extrabold text-bordeaux font-sans">
            Öne Çıkan İlanlar
          </h2>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border border-bordeaux/25 text-text-dark font-medium hover:bg-bordeaux hover:text-white hover:border-bordeaux focus:outline-none transition-colors text-sm"
          >
            <Filter className="w-5 h-5" />
            Filtre Seç
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-text-dark/70 font-sans">İlanlar yükleniyor...</p>
        ) : listings.length === 0 ? (
          <p className="text-text-dark/70 font-sans">Henüz ilan bulunmuyor.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
            {listings.map((listing) => (
              <Card key={listing._id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
