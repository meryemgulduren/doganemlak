import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchAdminListings, deleteAdminListing } from "../../api/admin";

export default function AdminListingsPage() {
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtreler
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    listing_type: "",
  });

  const load = (page = 1) => {
    setLoading(true);
    fetchAdminListings({ page, limit: 15, ...filters })
      .then((res) => {
        if (res.success) {
          setListings(res.data || []);
          setPagination(res.pagination || { page: 1, totalPages: 1, total: 0 });
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      load(1);
    }, 400); // 400ms debounce
    return () => clearTimeout(timeoutId);
  }, [filters]); // Filtre değiştiğinde bir süre sonra yeniden yükle

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`"${title}" ilanını silmek istediğinize emin misiniz?`)) return;
    try {
      await deleteAdminListing(id);
      setListings((prev) => prev.filter((l) => l._id !== id));
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    } catch (err) {
      alert(err.message || "Silinemedi.");
    }
  };

  if (loading && listings.length === 0) return <p className="text-text-dark/70">Yükleniyor...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-text-dark">Tüm İlanlar</h2>
        <Link
          to="/admin/ilan-yeni"
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 whitespace-nowrap"
        >
          Yeni İlan
        </Link>
      </div>

      {/* Filtreleme Alanı */}
      <div className="bg-white p-4 rounded-xl border border-accent/40 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="İlan No veya Başlık ara..."
            className="w-full px-4 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <select
          name="listing_type"
          value={filters.listing_type}
          onChange={handleFilterChange}
          className="px-4 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Tüm Tipler</option>
          <option value="SATILIK">Satılık</option>
          <option value="KIRALIK">Kiralık</option>
          <option value="GUNLUK_KIRALIK">Günlük Kiralık</option>
        </select>
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="px-4 py-2 text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">Tüm Durumlar</option>
          <option value="ACTIVE">Aktif (ACTIVE)</option>
          <option value="PASSIVE">Pasif (PASSIVE)</option>
          <option value="PENDING">Bekliyor (PENDING)</option>
        </select>
      </div>

      <div className="bg-white border border-accent/40 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-accent/20 text-text-dark font-medium">
            <tr>
              <th className="px-4 py-3">İlan No</th>
              <th className="px-4 py-3">Başlık</th>
              <th className="px-4 py-3">Tip</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {listings.length > 0 ? (
              listings.map((listing) => (
                <tr key={listing._id} className="border-t border-accent/30 hover:bg-black/[0.02]">
                  <td className="px-4 py-2 font-medium">{listing.listing_no}</td>
                  <td className="px-4 py-2 max-w-[200px] truncate" title={listing.title}>{listing.title}</td>
                  <td className="px-4 py-2">{listing.listing_type}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      listing.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      listing.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      to={`/admin/ilan-duzenle/${listing._id}`}
                      className="text-primary hover:underline mr-4 font-medium"
                    >
                      Düzenle
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(listing._id, listing.title)}
                      className="text-red-500 hover:underline font-medium"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-muted">
                  Arama kriterlerinize uygun ilan bulunamadı.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {pagination.totalPages > 1 && (
        <div className="flex gap-2 justify-center pb-4">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => load(pagination.page - 1)}
            className="px-3 py-1.5 rounded-lg border border-accent/60 disabled:opacity-50 hover:bg-accent/20 text-sm font-medium transition-colors"
          >
            Önceki
          </button>
          <span className="py-1.5 px-2 text-sm font-medium text-text-dark/80">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => load(pagination.page + 1)}
            className="px-3 py-1.5 rounded-lg border border-accent/60 disabled:opacity-50 hover:bg-accent/20 text-sm font-medium transition-colors"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  );
}
