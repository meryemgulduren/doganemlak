import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { fetchAdminAdmins, createAdminUser, updateAdminUser, deleteAdminUser, uploadProfileImage } from "../../api/admin";

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

const EMPTY_EDIT_FORM = {
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  phone: "+90 ",
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
        className="peer w-full px-4 py-3.5 text-sm rounded-md border border-border bg-surface text-text-dark placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
      />
      <label
        htmlFor={id}
        className="absolute left-4 -top-2.5 bg-surface px-1 text-xs font-medium text-muted transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-primary pointer-events-none"
      >
        {label} {required && <span className="text-danger">*</span>}
      </label>
    </div>
  );
}

/** Şifre göster/gizle (göz ikonu) — Admin ekleme formu */
function PasswordField({ label, id, value, onChange, required }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={label}
        autoComplete="new-password"
        className="peer w-full px-4 py-3.5 pr-11 text-sm rounded-md border border-border bg-surface text-text-dark placeholder-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
      />
      <label
        htmlFor={id}
        className="absolute left-4 -top-2.5 bg-surface px-1 text-xs font-medium text-muted transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-primary pointer-events-none"
      >
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-muted hover:text-text-dark hover:bg-accent/40 focus:outline-none focus:ring-2 focus:ring-primary/40"
        aria-label={visible ? "Şifreyi gizle" : "Şifreyi göster"}
      >
        {visible ? <EyeOff className="w-5 h-5" aria-hidden /> : <Eye className="w-5 h-5" aria-hidden />}
      </button>
    </div>
  );
}

function AdminCard({ admin, onDelete, onEdit, deletingId, editingId }) {
  const fullName = [admin.first_name, admin.last_name].filter(Boolean).join(" ") || "—";
  const isDeleting = deletingId === admin._id;
  const isEditing = editingId === admin._id;
  const photo = admin.profile_image;

  return (
    <div className="bg-surface border border-border rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        {photo ? (
          <img
            src={photo}
            alt=""
            className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-border"
          />
        ) : (
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0 bg-gradient-to-br from-bordeaux to-[#5c1520]">
            {(admin.first_name?.[0] || admin.username?.[0] || "A").toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-semibold text-text-dark text-sm">{fullName}</p>
          <p className="text-xs text-muted">{admin.username} · {admin.email}</p>
          {admin.phone && <p className="text-xs text-muted/80 mt-0.5">📞 {admin.phone}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={() => onEdit(admin)}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
            isEditing
              ? "border-primary/35 text-primary bg-primary/10"
              : "border-border text-text-dark hover:bg-accent/40"
          }`}
        >
          Düzenle
        </button>
        <button
          type="button"
          onClick={() => onDelete(admin._id)}
          disabled={isDeleting}
          className="text-xs px-3 py-1.5 rounded-lg border border-danger/30 text-danger hover:bg-danger/10 transition-colors disabled:opacity-50"
        >
          {isDeleting ? "Siliniyor..." : "Sil"}
        </button>
      </div>
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
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
  const [editSaving, setEditSaving] = useState(false);
  const [editProfileFile, setEditProfileFile] = useState(null);
  const [editProfilePreview, setEditProfilePreview] = useState(null);
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);

  const loadAdmins = () => {
    setLoadingList(true);
    fetchAdminAdmins()
      .then((res) => { if (res.success) setAdmins(res.data); })
      .catch(() => {})
      .finally(() => setLoadingList(false));
  };

  useEffect(() => { loadAdmins(); }, []);

  useEffect(() => {
    if (!profileFile) {
      setProfilePreview(null);
      return;
    }
    const url = URL.createObjectURL(profileFile);
    setProfilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [profileFile]);

  useEffect(() => {
    if (!editProfileFile) {
      setEditProfilePreview(null);
      return;
    }
    const url = URL.createObjectURL(editProfileFile);
    setEditProfilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [editProfileFile]);

  const set = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));
  const setEdit = (key) => (val) => setEditForm((prev) => ({ ...prev, [key]: val }));

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
      let profile_image = null;
      if (profileFile) {
        profile_image = await uploadProfileImage(profileFile);
      }
      await createAdminUser({
        ...payload,
        ...(profile_image ? { profile_image } : {}),
      });
      setSuccess("Admin başarıyla eklendi.");
      setForm(EMPTY_FORM);
      setProfileFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
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

  const handleStartEdit = (admin) => {
    setError(null);
    setSuccess(null);
    setEditingId(admin._id);
    setEditForm({
      first_name: admin.first_name || "",
      last_name: admin.last_name || "",
      username: admin.username || "",
      email: admin.email || "",
      phone: admin.phone || "+90 ",
    });
    setEditProfileFile(null);
    setEditProfilePreview(admin.profile_image || null);
    if (editFileInputRef.current) editFileInputRef.current.value = "";
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(EMPTY_EDIT_FORM);
    setEditProfileFile(null);
    setEditProfilePreview(null);
    if (editFileInputRef.current) editFileInputRef.current.value = "";
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setError(null);
    setSuccess(null);
    setEditSaving(true);
    try {
      let profile_image = editProfilePreview || null;
      if (editProfileFile) {
        profile_image = await uploadProfileImage(editProfileFile);
      }

      await updateAdminUser(editingId, {
        ...editForm,
        profile_image,
      });
      setSuccess("Admin profili güncellendi.");
      loadAdmins();
      handleCancelEdit();
    } catch (err) {
      setError(err.message || "Admin güncellenemedi.");
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-xl font-bold text-text-dark text-center">Adminler</h2>

      {/* ── Yeni Admin Formu ── */}
      <div className="bg-surface border border-border rounded-2xl shadow-sm p-6">
        <h3 className="text-base font-semibold text-text-dark mb-5">Yeni Admin Ekle</h3>

        {error   && <p className="mb-3 text-sm text-danger bg-danger/10 px-3 py-2 rounded-lg border border-danger/20">{error}</p>}
        {success && <p className="mb-3 text-sm text-success bg-success/10 px-3 py-2 rounded-lg border border-success/20">{success}</p>}

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
          <div className="sm:col-span-2">
            <p className="text-xs font-medium text-muted mb-2">Profil fotoğrafı (isteğe bağlı)</p>
            <div className="flex flex-wrap items-center gap-4">
              <div
                className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-accent/30 flex-shrink-0"
              >
                {profilePreview ? (
                  <img src={profilePreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-muted text-center px-1">Önizleme</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="text-sm text-muted file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/15 file:text-primary hover:file:bg-primary/25"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setProfileFile(f || null);
                  }}
                />
                {profileFile && (
                  <button
                    type="button"
                    className="text-xs text-danger hover:underline w-fit"
                    onClick={() => {
                      setProfileFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    Fotoğrafı kaldır
                  </button>
                )}
              </div>
            </div>
          </div>
          <PasswordField label="Şifre" id="password" value={form.password} onChange={set("password")} required />
          <PasswordField label="Şifre Tekrar" id="confirmPassword" value={form.confirmPassword} onChange={set("confirmPassword")} required />

          <div className="sm:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-bordeaux to-[#5c1520] text-white text-sm font-semibold shadow-sm hover:opacity-95 transition-all disabled:opacity-60"
            >
              {saving ? "Ekleniyor..." : "Admin Ekle"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Admin Profil Düzenleme ── */}
      {editingId && (
        <div className="bg-surface border border-border rounded-2xl shadow-sm p-6">
          <h3 className="text-base font-semibold text-text-dark mb-5">Admin Profili Düzenle</h3>
          <form onSubmit={handleSubmitEdit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="İsim" id="edit_first_name" value={editForm.first_name} onChange={setEdit("first_name")} />
            <InputField label="Soyisim" id="edit_last_name" value={editForm.last_name} onChange={setEdit("last_name")} />
            <InputField label="Kullanıcı Adı" id="edit_username" value={editForm.username} onChange={setEdit("username")} required />
            <InputField label="E-posta" id="edit_email" type="email" value={editForm.email} onChange={setEdit("email")} required />
            <InputField
              label="Telefon"
              id="edit_phone"
              value={editForm.phone}
              onChange={(val) => {
                if (val && !val.startsWith("+90 ")) {
                  if (val.startsWith("+90")) setEdit("phone")("+90 " + val.slice(3).trimStart());
                  else if (val.startsWith("0")) setEdit("phone")("+90 " + val.slice(1));
                  else setEdit("phone")("+90 " + val);
                } else {
                  if (val === "+9" || val === "+" || val === "") setEdit("phone")("");
                  else setEdit("phone")(val);
                }
              }}
            />
            <div className="sm:col-span-2">
              <p className="text-xs font-medium text-muted mb-2">Profil fotoğrafı</p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-accent/30 flex-shrink-0">
                  {editProfilePreview ? (
                    <img src={editProfilePreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-muted text-center px-1">Önizleme</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="text-sm text-muted file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/15 file:text-primary hover:file:bg-primary/25"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      setEditProfileFile(f || null);
                    }}
                  />
                  {editProfilePreview && (
                    <button
                      type="button"
                      className="text-xs text-danger hover:underline w-fit"
                      onClick={() => {
                        setEditProfileFile(null);
                        setEditProfilePreview(null);
                        if (editFileInputRef.current) editFileInputRef.current.value = "";
                      }}
                    >
                      Fotoğrafı kaldır
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-5 py-2.5 rounded-xl border border-border text-text-dark text-sm font-semibold hover:bg-accent/40 transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={editSaving}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {editSaving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Mevcut Adminler ── */}
      <div>
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
          Mevcut Adminler ({admins.length})
        </h3>
        {loadingList ? (
          <p className="text-sm text-muted">Yükleniyor...</p>
        ) : admins.length === 0 ? (
          <p className="text-sm text-muted italic">Kayıtlı admin bulunamadı.</p>
        ) : (
          <div className="space-y-2">
            {admins.map((admin) => (
              <AdminCard
                key={admin._id}
                admin={admin}
                onEdit={handleStartEdit}
                onDelete={handleDelete}
                deletingId={deletingId}
                editingId={editingId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
