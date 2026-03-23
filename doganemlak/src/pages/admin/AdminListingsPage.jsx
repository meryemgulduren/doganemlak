import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchAdminListings, deleteAdminListing, patchAdminListingStatus } from "../../api/admin";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Aktif" },
  { value: "PASSIVE", label: "Pasif" },
  { value: "PENDING", label: "Bekliyor" },
  { value: "SOLD", label: "Satıldı" },
];

export default function AdminListingsPage() {
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusSavingId, setStatusSavingId] = useState(null);

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

  const handleStatusChange = async (listingId, previousStatus, newStatus) => {
    if (!newStatus || newStatus === previousStatus) return;
    setStatusSavingId(listingId);
    setListings((prev) =>
      prev.map((l) => (l._id === listingId ? { ...l, status: newStatus } : l))
    );
    try {
      await patchAdminListingStatus(listingId, newStatus);
    } catch (err) {
      setListings((prev) =>
        prev.map((l) => (l._id === listingId ? { ...l, status: previousStatus } : l))
      );
      alert(err.message || "Durum güncellenemedi.");
    } finally {
      setStatusSavingId(null);
    }
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
  if (error) return <p className="text-danger">{error}</p>;

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
          <option value="SOLD">Satıldı (SOLD)</option>
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
              <th className="px-4 py-3 text-center">Görüntülenme</th>
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
                    <select
                      aria-label={`${listing.title} durumu`}
                      value={listing.status || "ACTIVE"}
                      disabled={statusSavingId === listing._id}
                      onChange={(e) =>
                        handleStatusChange(listing._id, listing.status, e.target.value)
                      }
                      className={`max-w-[140px] w-full px-2 py-1.5 rounded-md text-xs font-medium border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60 ${
                        listing.status === "ACTIVE"
                          ? "bg-green-50 text-green-800 border-green-200"
                          : listing.status === "PENDING"
                            ? "bg-yellow-50 text-yellow-800 border-yellow-200"
                            : listing.status === "SOLD"
                              ? "bg-primary/15 text-text-dark border-primary/35"
                              : "bg-accent/35 text-text-dark border-border"
                      }`}
                    >
                      {!STATUS_OPTIONS.some((o) => o.value === listing.status) && listing.status ? (
                        <option value={listing.status}>{listing.status}</option>
                      ) : null}
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-text-dark/70">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {listing.view_count ?? 0}
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
                      className="text-danger hover:underline font-medium"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-muted">
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
