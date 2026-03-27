import { useEffect, useState } from "react";
import { fetchFavoriteConsultants, fetchPublicConsultants } from "../api/consultants";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoriteContext";

export default function FavoriDanismanlarPage() {
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isLoggedIn } = useAuth();
  const { consultantFavoriteIds, toggleConsultantFavorite, isLoadingConsultantFavorite } = useFavorites();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const idsArray = Array.from(consultantFavoriteIds);
    if (idsArray.length === 0 && !isLoggedIn) {
      setConsultants([]);
      setLoading(false);
      return;
    }

    const fetchPromise = isLoggedIn
      ? fetchFavoriteConsultants()
      : fetchPublicConsultants(idsArray);

    fetchPromise
      .then((res) => {
        if (!cancelled && res.success) {
          setConsultants(Array.isArray(res.data) ? res.data : []);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Favori danışmanlar yüklenemedi.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [isLoggedIn, consultantFavoriteIds.size]);

  const handleRemove = async (id) => {
    await toggleConsultantFavorite(id);
    // State will be updated by the useEffect dependency on consultantFavoriteIds.size
  };

  const displayName = (c) =>
    [c.first_name, c.last_name].filter(Boolean).join(" ") || c.username || "—";

  const consultantInitials = (c) => {
    const first = (c.first_name?.[0] || c.username?.[0] || "D").toUpperCase();
    const last = (c.last_name?.[0] || "").toUpperCase();
    return last ? `${first}${last}` : first;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 font-sans bg-background">
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-bordeaux/30">
        <h1 className="font-montserrat text-2xl sm:text-3xl font-semibold text-black tracking-tight">
          Favori Danışmanlarım
        </h1>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-text-dark/70">Yükleniyor...</p>
      ) : consultants.length === 0 ? (
        <p className="text-text-dark/70">
          Henüz favori danışmanınız yok. İlan detayındaki{" "}
          <span className="font-semibold text-danger">❤️ Danışmanı Favorile</span> ile ekleyebilirsiniz.
        </p>
      ) : (
        <ul className="space-y-4">
          {consultants.map((c) => (
            <li
              key={c._id}
              className="flex flex-wrap items-center gap-4 p-4 rounded-2xl border border-border bg-surface shadow-sm"
            >
              {c.profile_image ? (
                <img
                  src={c.profile_image}
                  alt=""
                  className="w-16 h-24 rounded-lg object-cover flex-shrink-0 border border-border"
                />
              ) : (
                <div className="w-16 h-24 rounded-lg flex items-center justify-center font-bold text-text-dark text-2xl leading-none flex-shrink-0 bg-gradient-to-br from-amber-100 to-yellow-200">
                  {consultantInitials(c)}
                </div>
              )}
              <div className="flex-1 min-w-0 space-y-1">
                <p className="font-semibold text-text-dark">{displayName(c)}</p>
                {c.phone && (
                  <a href={`tel:${c.phone}`} className="block text-sm text-primary hover:underline">
                    {c.phone}
                  </a>
                )}
                {c.email && (
                  <a href={`mailto:${c.email}`} className="block text-sm text-text-dark/60 hover:text-primary truncate">
                    {c.email}
                  </a>
                )}
              </div>
              <button
                type="button"
                disabled={isLoadingConsultantFavorite(c._id)}
                onClick={() => handleRemove(c._id)}
                className="text-sm px-3 py-1.5 rounded-lg border border-danger/40 text-danger hover:bg-danger/10 disabled:opacity-50"
              >
                {isLoadingConsultantFavorite(c._id) ? "…" : "Favoriden çıkar"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
