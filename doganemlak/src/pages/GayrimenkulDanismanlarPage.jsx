import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchPublicConsultants } from "../api/consultants";

function consultantDisplayName(c) {
  return [c.first_name, c.last_name].filter(Boolean).join(" ") || c.username || "—";
}

export default function GayrimenkulDanismanlarPage() {
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-10 font-sans">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b-2 border-bordeaux/30">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-dark">
              Gayrimenkul Danışmanlarımız
            </h1>
            <p className="text-sm text-text-dark/60 mt-1 max-w-2xl">
              Sistemde kayıtlı tüm yetkili danışmanlarımızla iletişime geçebilirsiniz.
            </p>
          </div>
          <Link
            to="/"
            className="text-sm font-medium text-primary hover:underline whitespace-nowrap"
          >
            ← Ana sayfa
          </Link>
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
                className="rounded-2xl border border-border bg-surface shadow-sm p-4 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  {c.profile_image ? (
                    <img
                      src={c.profile_image}
                      alt=""
                      className="w-14 h-14 rounded-full object-cover flex-shrink-0 border border-accent/30"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-lg flex-shrink-0 bg-gradient-to-br from-bordeaux to-[#5c1520]">
                      {(c.first_name?.[0] || c.username?.[0] || "D").toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-text-dark truncate">{consultantDisplayName(c)}</p>
                    <p className="text-xs text-text-dark/50 truncate">@{c.username}</p>
                  </div>
                </div>
                {c.phone && (
                  <a
                    href={`tel:${c.phone}`}
                    className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <span aria-hidden>📞</span> {c.phone}
                  </a>
                )}
                {c.email && (
                  <a
                    href={`mailto:${c.email}`}
                    className="text-xs text-text-dark/60 hover:text-primary truncate"
                  >
                    {c.email}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
