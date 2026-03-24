import { useState, useEffect } from "react";
import { getToken } from "../../api/client";

const API = import.meta.env.VITE_API_URL;

const STATUS_LABELS = {
  BEKLEMEDE: { label: "Beklemede", cls: "bg-yellow-100 text-yellow-800" },
  INCELENIYOR: { label: "İnceleniyor", cls: "bg-blue-100 text-blue-800" },
  COZULDU: { label: "Çözüldü", cls: "bg-green-100 text-green-800" },
};
const TYPE_LABELS = {
  TALEP: "Talep",
  SIKAYET: "Şikayet",
};

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);
      if (filterType) params.set("type", filterType);
      const res = await fetch(`${API}/admin/complaints?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (data.success) setComplaints(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [filterStatus, filterType]);

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API}/admin/complaints/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setComplaints((prev) =>
          prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-text-dark">Talep / Şikayet Yönetimi</h1>

      {/* Filtreler */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-border px-3 py-1.5 text-sm bg-white"
        >
          <option value="">Tüm Durumlar</option>
          <option value="BEKLEMEDE">Beklemede</option>
          <option value="INCELENIYOR">İnceleniyor</option>
          <option value="COZULDU">Çözüldü</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-lg border border-border px-3 py-1.5 text-sm bg-white"
        >
          <option value="">Tüm Türler</option>
          <option value="TALEP">Talep</option>
          <option value="SIKAYET">Şikayet</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-muted">Yükleniyor...</p>
      ) : complaints.length === 0 ? (
        <p className="text-sm text-muted">Henüz talep/şikayet yok.</p>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => {
            const st = STATUS_LABELS[c.status] || STATUS_LABELS.BEKLEMEDE;
            return (
              <div
                key={c._id}
                className="bg-white rounded-xl border border-border p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary">
                      {TYPE_LABELS[c.type] || c.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${st.cls}`}>
                      {st.label}
                    </span>
                  </div>
                  <span className="text-xs text-muted">{formatDate(c.createdAt)}</span>
                </div>

                <p className="text-sm text-text-dark mb-3 whitespace-pre-line">{c.text}</p>

                {c.images && c.images.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    {c.images.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt="" className="w-16 h-16 rounded-lg object-cover border border-border hover:opacity-80 transition-opacity" />
                      </a>
                    ))}
                  </div>
                )}

                {c.user && (
                  <p className="text-xs text-muted mb-3">
                    👤 {c.user.username || c.user.email}
                    {c.user.phone ? ` • ${c.user.phone}` : ""}
                  </p>
                )}

                {/* Durum güncelle */}
                <div className="flex gap-2">
                  {["BEKLEMEDE", "INCELENIYOR", "COZULDU"].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(c._id, s)}
                      disabled={c.status === s}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        c.status === s
                          ? "bg-gray-200 text-gray-500 cursor-default"
                          : "bg-white border border-border text-text-dark hover:bg-accent/30"
                      }`}
                    >
                      {STATUS_LABELS[s].label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
