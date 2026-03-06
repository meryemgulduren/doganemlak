import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchAdminListings, deleteAdminListing } from "../../api/admin";

export default function AdminListingsPage() {
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = (page = 1) => {
    setLoading(true);
    fetchAdminListings({ page, limit: 15 })
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
    load();
  }, []);

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-dark">Tüm İlanlar</h2>
        <Link
          to="/admin/ilan-yeni"
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90"
        >
          Yeni İlan
        </Link>
      </div>
      <div className="bg-white border border-accent/40 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-accent/20 text-text-dark font-medium">
            <tr>
              <th className="px-4 py-3">İlan No</th>
              <th className="px-4 py-3">Başlık</th>
              <th className="px-4 py-3">Tip</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing._id} className="border-t border-accent/30">
                <td className="px-4 py-2">{listing.listing_no}</td>
                <td className="px-4 py-2 max-w-[200px] truncate">{listing.title}</td>
                <td className="px-4 py-2">{listing.listing_type}</td>
                <td className="px-4 py-2">{listing.status}</td>
                <td className="px-4 py-2">
                  <Link
                    to={`/admin/ilan-duzenle/${listing._id}`}
                    className="text-primary hover:underline mr-2"
                  >
                    Düzenle
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(listing._id, listing.title)}
                    className="text-red-600 hover:underline"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination.totalPages > 1 && (
        <div className="flex gap-2 justify-center">
          <button
            type="button"
            disabled={pagination.page <= 1}
            onClick={() => load(pagination.page - 1)}
            className="px-3 py-1 rounded border border-accent/60 disabled:opacity-50"
          >
            Önceki
          </button>
          <span className="py-1 text-text-dark/80">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => load(pagination.page + 1)}
            className="px-3 py-1 rounded border border-accent/60 disabled:opacity-50"
          >
            Sonraki
          </button>
        </div>
      )}
    </div>
  );
}
