import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Filter } from "lucide-react";
import { fetchListings } from "../api/listings";
import Card from "../components/Card";

export default function HomePage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

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
        search: searchParamStr || undefined
    })
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
  }, [categoryParam, listingTypeParam, subTypeParam, searchParamStr]);

  return (
    <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 py-10 font-sans">
      <div className="max-w-[1600px] mx-auto flex gap-6">
        <aside className="hidden md:block w-64 flex-shrink-0 bg-surface border border-border rounded-xl p-4 shadow-sm">
          <nav className="space-y-6 text-sm text-text-dark">
            <div>
              <h3 className="text-xs font-semibold tracking-wide text-text-dark/70 mb-2">
                MESAJLAR VE BİLGİLENDİRMELER
              </h3>
              <ul className="space-y-1">
                <li>
                  <button className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-brand/10 hover:text-brand flex items-center gap-2 group transition-colors">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#F3C35C" }} />
                    <span>Mesajlar</span>
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-brand/10 hover:text-brand flex items-center gap-2 group transition-colors">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#F3C35C" }} />
                    <span>Sorularım Ve Cevaplarım</span>
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-brand/10 hover:text-brand flex items-center gap-2 group transition-colors">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#F3C35C" }} />
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
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-brand/10 hover:text-brand flex items-center gap-2 block group transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#F3C35C" }} />
                    <span>Favori İlanlar</span>
                  </Link>
                </li>
                <li>
                  <button className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-brand/10 hover:text-brand flex items-center gap-2 group transition-colors">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#F3C35C" }} />
                    <span>Favori Aramalar</span>
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-brand/10 hover:text-brand flex items-center gap-2 group transition-colors">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#F3C35C" }} />
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
                  <button className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-brand/10 hover:text-brand flex items-center gap-2 group transition-colors">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#F3C35C" }} />
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
                  <button className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-brand/10 hover:text-brand flex items-center gap-2 group transition-colors">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#F3C35C" }} />
                    <span>Ayarlar</span>
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-brand/10 hover:text-brand flex items-center gap-2 group transition-colors">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#F3C35C" }} />
                    <span>Sorun/Öneri Bildirimi</span>
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-brand/10 hover:text-brand flex items-center gap-2 group transition-colors">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#F3C35C" }} />
                    <span>Hakkında</span>
                  </button>
                </li>
                <li>
                  <button className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-brand/10 hover:text-brand flex items-center gap-2 group transition-colors">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#F3C35C" }} />
                    <span>Kişisel Verilerin Korunması</span>
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        <section className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-2 border-b-2 border-[#F3C35C]">
            <h2 className="text-2xl font-extrabold text-text-dark font-sans">
              Öne Çıkan İlanlar
            </h2>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border border-border text-text-dark font-medium hover:bg-primary hover:text-white hover:border-primary focus:outline-none transition-colors text-sm"
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
