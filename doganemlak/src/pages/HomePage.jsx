import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Filter } from "lucide-react";
import { fetchListings } from "../api/listings";
import Card from "../components/Card";

export default function HomePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchListings({ page: 1, limit: 24 })
      .then((res) => {
        if (!cancelled && res.success) {
          setListings(res.data || []);
          setPagination(res.pagination || { page: 1, totalPages: 1, total: 0 });
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "İlanlar yüklenemedi.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-10 font-sans">
      <div className="max-w-[1600px] mx-auto flex gap-6">
        <aside className="hidden md:block w-64 flex-shrink-0 bg-white/80 border border-accent/40 rounded-xl p-4 shadow-sm">
          <nav className="space-y-6 text-sm text-text-dark">
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-text-dark/70 mb-2">
                MESAJLAR VE BİLGİLENDİRMELER
              </h3>
              <ul className="space-y-1">
                <li>
                  <button className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-accent/40 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full border border-text-dark" />
                    <span>Mesajlar</span>
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-accent/40 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full border border-text-dark" />
                    <span>Sorularım Ve Cevaplarım</span>
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-accent/40 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full border border-text-dark" />
                    <span>Bilgilendirmeler</span>
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-text-dark/70 mb-2">
                FAVORİLER
              </h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    to="/favorilerim"
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-accent/40 flex items-center gap-2 block"
                  >
                    <span className="w-1 h-1 rounded-full border border-text-dark" />
                    <span>Favori İlanlar</span>
                  </Link>
                </li>
                <li>
                  <button className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-accent/40 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full border border-text-dark" />
                    <span>Favori Aramalar</span>
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-accent/40 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full border border-text-dark" />
                    <span>Favori Satıcılar</span>
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-text-dark/70 mb-2">
                HESABIM
              </h3>
              <ul className="space-y-1">
                <li>
                  <button className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-accent/40 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full border border-text-dark" />
                    <span>Hesap Bilgilerim</span>
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-text-dark/70 mb-2">
                DİĞER
              </h3>
              <ul className="space-y-1">
                <li>
                  <button className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-accent/40 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full border border-text-dark" />
                    <span>Ayarlar</span>
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-accent/40 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full border border-text-dark" />
                    <span>Sorun/Öneri Bildirimi</span>
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-accent/40 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full border border-text-dark" />
                    <span>Hakkında</span>
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-accent/40 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full border border-text-dark" />
                    <span>Kişisel Verilerin Korunması</span>
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        <section className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-2 border-b-2 border-accent">
            <h2 className="text-2xl font-extrabold text-text-dark font-sans">
              Öne Çıkan İlanlar
            </h2>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg border border-text-dark text-text-dark font-sans font-medium hover:bg-text-dark hover:text-background focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filtre Seç
            </button>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-700 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-text-dark/70 font-sans">İlanlar yükleniyor...</p>
          ) : listings.length === 0 ? (
            <p className="text-text-dark/70 font-sans">Henüz ilan bulunmuyor.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <Card key={listing._id} listing={listing} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
