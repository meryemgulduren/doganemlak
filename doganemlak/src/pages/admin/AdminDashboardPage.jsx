import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getToken } from "../../api/client";
import { fetchAdminStats } from "../../api/admin";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !getToken()) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchAdminStats()
      .then((res) => {
        if (!cancelled && res.success) setStats(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [user]);

  if (loading) return <p className="text-text-dark/70">Yükleniyor...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-text-dark">İstatistikler</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-accent/40 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-text-dark/70">Toplam Kullanıcı</p>
          <p className="text-2xl font-bold text-text-dark">{stats.total_users}</p>
        </div>
        <div className="bg-white border border-accent/40 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-text-dark/70">Toplam İlan</p>
          <p className="text-2xl font-bold text-text-dark">{stats.total_listings}</p>
        </div>
        <div className="bg-white border border-accent/40 rounded-xl p-4 shadow-sm">
          <p className="text-sm text-text-dark/70">Aktif İlan</p>
          <p className="text-2xl font-bold text-text-dark">{stats.active_listings}</p>
        </div>
      </div>
    </div>
  );
}
