import { useState, useEffect } from "react";
import { fetchAdminAdmins, createAdminUser, deleteAdminUser } from "../../api/admin";

// ── Form başlangıç değeri ─────────────────────────────────────────────────────
const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  phone: "+90 ",
  password: "",
  confirmPassword: "",
};

// ── Alt bileşenler ────────────────────────────────────────────────────────────

function InputField({ label, id, type = "text", value, onChange, required }) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={label}
        className="peer w-full px-4 py-3.5 text-sm rounded-md border border-black bg-surface text-text-dark placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
      />
      <label
        htmlFor={id}
        className="absolute left-4 -top-2.5 bg-surface px-1 text-xs font-medium text-muted transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-primary pointer-events-none"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    </div>
  );
}

function AdminCard({ admin, onDelete, deletingId }) {
  const fullName = [admin.first_name, admin.last_name].filter(Boolean).join(" ") || "—";
  const isDeleting = deletingId === admin._id;

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #C5A25D, #a8874a)" }}>
          {(admin.first_name?.[0] || admin.username?.[0] || "A").toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">{fullName}</p>
          <p className="text-xs text-gray-500">{admin.username} · {admin.email}</p>
          {admin.phone && <p className="text-xs text-gray-400 mt-0.5">📞 {admin.phone}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onDelete(admin._id)}
        disabled={isDeleting}
        className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 flex-shrink-0"
      >
        {isDeleting ? "Siliniyor..." : "Sil"}
      </button>
    </div>
  );
}

// ── Ana sayfa ─────────────────────────────────────────────────────────────────

export default function AdminAddAdminPage() {
  const [admins, setAdmins]         = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError]           = useState(null);
  const [success, setSuccess]       = useState(null);

  const loadAdmins = () => {
    setLoadingList(true);
    fetchAdminAdmins()
      .then((res) => { if (res.success) setAdmins(res.data); })
      .catch(() => {})
      .finally(() => setLoadingList(false));
  };

  useEffect(() => { loadAdmins(); }, []);

  const set = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (form.password !== form.confirmPassword) {
      return setError("Şifreler eşleşmiyor.");
    }
    if (form.password.length < 8) {
      return setError("Şifre en az 8 karakter olmalıdır.");
    }

    setSaving(true);
    try {
      const { confirmPassword, ...payload } = form;
      await createAdminUser(payload);
      setSuccess("Admin başarıyla eklendi.");
      setForm(EMPTY_FORM);
      loadAdmins();
    } catch (err) {
      setError(err.message || "Admin eklenemedi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bu admini silmek istediğinize emin misiniz?")) return;
    setDeletingId(id);
    try {
      await deleteAdminUser(id);
      setAdmins((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      alert(err.message || "Silinemedi.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-xl font-bold text-gray-800 text-center">Adminler</h2>

      {/* ── Yeni Admin Formu ── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-700 mb-5">Yeni Admin Ekle</h3>

        {error   && <p className="mb-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
        {success && <p className="mb-3 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">{success}</p>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="İsim"     id="first_name" value={form.first_name} onChange={set("first_name")} placeholder="Ahmet" />
          <InputField label="Soyisim"  id="last_name"  value={form.last_name}  onChange={set("last_name")}  placeholder="Yılmaz" />
          <InputField label="Kullanıcı Adı" id="username" value={form.username} onChange={set("username")} required placeholder="ahmetyilmaz" />
          <InputField 
            label="Telefon"  
            id="phone"      
            value={form.phone}      
            onChange={(val) => {
              if (val && !val.startsWith("+90 ")) {
                 if (val.startsWith("+90")) {
                    set("phone")("+90 " + val.slice(3).trimStart());
                 } else if (val.startsWith("0")) {
                    set("phone")("+90 " + val.slice(1));
                 } else {
                    set("phone")("+90 " + val);
                 }
              } else {
                 // Sadece siliyor veya +90 olarak bırakıyorsa sıfırlama işlemi:
                 if (val === "+9" || val === "+" || val === "") {
                    set("phone")("");
                 } else {
                    set("phone")(val);
                 }
              }
            }}      
            placeholder="+90 555 000 00 00" 
          />
          <InputField label="E-posta"  id="email"      type="email" value={form.email} onChange={set("email")} required placeholder="admin@sirket.com" />
          <div /> {/* boş grid hücresi */}
          <InputField label="Şifre"    id="password"         type="password" value={form.password}        onChange={set("password")}        required placeholder="En az 8 karakter" />
          <InputField label="Şifre Tekrar" id="confirmPassword" type="password" value={form.confirmPassword} onChange={set("confirmPassword")} required placeholder="Şifreyi tekrar girin" />

          <div className="sm:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm transition-all disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #C5A25D, #a8874a)" }}
            >
              {saving ? "Ekleniyor..." : "Admin Ekle"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Mevcut Adminler ── */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Mevcut Adminler ({admins.length})
        </h3>
        {loadingList ? (
          <p className="text-sm text-gray-400">Yükleniyor...</p>
        ) : admins.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Kayıtlı admin bulunamadı.</p>
        ) : (
          <div className="space-y-2">
            {admins.map((admin) => (
              <AdminCard key={admin._id} admin={admin} onDelete={handleDelete} deletingId={deletingId} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
