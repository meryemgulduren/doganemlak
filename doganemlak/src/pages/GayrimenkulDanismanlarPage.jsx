import { useState, useEffect } from "react";
import { Mail, Phone, Heart } from "lucide-react";
import { fetchPublicConsultants } from "../api/consultants";
import { useFavorites } from "../context/FavoriteContext";

function consultantDisplayName(c) {
  return [c.first_name, c.last_name].filter(Boolean).join(" ") || c.username || "—";
}

function consultantInitials(c) {
  const first = (c.first_name?.[0] || c.username?.[0] || "D").toUpperCase();
  const last = (c.last_name?.[0] || "").toUpperCase();
  return last ? `${first}${last}` : first;
}

export default function GayrimenkulDanismanlarPage() {
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isConsultantFavorite, toggleConsultantFavorite, isLoadingConsultantFavorite } = useFavorites();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchPublicConsultants()
      .then((res) => {
        if (!cancelled && res.success && Array.isArray(res.data)) setConsultants(res.data);
        else if (!cancelled) setConsultants([]);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Danışmanlar yüklenemedi.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-10 font-sans bg-background">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b-2 border-bordeaux/30">
          <div>
            <h1 className="font-montserrat text-2xl sm:text-3xl font-semibold text-black tracking-tight">
              Gayrimenkul Danışmanlarımız
            </h1>
            <p className="text-sm text-text-dark/60 mt-1 max-w-2xl">
              Sistemde kayıtlı tüm yetkili danışmanlarımızla iletişime geçebilirsiniz.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-text-dark/70">Danışmanlar yükleniyor...</p>
        ) : consultants.length === 0 ? (
          <p className="text-text-dark/70">Henüz kayıtlı danışman bulunmuyor.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {consultants.map((c) => (
              <div
                key={c._id}
                className="rounded-2xl border border-border bg-surface shadow-sm p-4 flex flex-col gap-3 relative group"
              >
                <button
                  onClick={() => toggleConsultantFavorite(c._id)}
                  disabled={isLoadingConsultantFavorite(c._id)}
                  className={`absolute top-3 right-3 p-2 rounded-full border bg-white/80 shadow-sm transition-all duration-300 hover:scale-110 active:scale-95 ${
                    isConsultantFavorite(c._id)
                      ? "text-bordeaux border-bordeaux/20 bg-bordeaux/5"
                      : "text-zinc-400 border-border hover:text-zinc-600"
                  } ${isLoadingConsultantFavorite(c._id) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  title={isConsultantFavorite(c._id) ? "Favorilerden Çıkar" : "Favorilere Ekle"}
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${
                      isConsultantFavorite(c._id) ? "fill-current" : ""
                    }`}
                  />
                </button>

                <div className="flex items-stretch gap-3">
                  {c.profile_image ? (
                    <img
                      src={c.profile_image}
                      alt=""
                      className="w-24 h-32 rounded-lg object-cover flex-shrink-0 border border-accent/30"
                    />
                  ) : (
                    <div className="w-24 h-32 rounded-lg flex items-center justify-center font-bold text-text-dark text-2xl leading-none flex-shrink-0 bg-gradient-to-br from-amber-100 to-yellow-200">
                      {consultantInitials(c)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1 flex flex-col justify-center gap-2">
                    <p className="font-semibold text-text-dark truncate">{consultantDisplayName(c)}</p>
                    {c.phone && (
                      <a
                        href={`tel:${c.phone}`}
                        className="text-sm font-medium text-zinc-700 hover:text-zinc-900 inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-4 h-4 flex-shrink-0 text-zinc-500" /> {c.phone}
                      </a>
                    )}
                    {c.email && (
                      <a
                        href={`mailto:${c.email}`}
                        className="text-sm font-medium text-zinc-600 hover:text-zinc-900 inline-flex items-center gap-1.5 truncate transition-colors"
                      >
                        <Mail className="w-4 h-4 flex-shrink-0 text-zinc-500" />
                        {c.email}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
