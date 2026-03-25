import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { apiRequest } from "../api/client";
import logoImg from "../assets/logo.png";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Şifreler uyuşmuyor.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await apiRequest("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setMessage(data.message || "Şifreniz başarıyla güncellendi.");
    } catch (err) {
      setError(err.data?.message || err.message || "Bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background font-sans flex items-center justify-center">
        <div className="bg-surface border border-border rounded-2xl p-8 text-center max-w-md mx-4 shadow-sm">
          <h2 className="font-montserrat text-xl font-semibold text-black tracking-tight mb-3">
            Geçersiz Bağlantı
          </h2>
          <p className="text-sm text-muted mb-4">
            Şifre sıfırlama bağlantısı geçersiz veya eksik. Lütfen e-postanızdaki bağlantıyı tekrar kontrol edin.
          </p>
          <Link
            to="/sifremi-unuttum"
            className="inline-block px-5 py-2.5 rounded-md bg-bordeaux text-white font-semibold text-sm hover:bg-bordeaux/90 transition-colors"
          >
            Tekrar Dene
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans grid grid-cols-1 md:grid-cols-2">
      {/* Form tarafı */}
      <div className="relative flex flex-col items-center justify-center px-6 py-12 md:px-12 bg-surface">
        <Link
          to="/"
          className="absolute top-4 left-6 transition-transform hover:scale-105"
        >
          <img src={logoImg} alt="Doğan Emlak Logo" className="h-24 w-auto object-contain" />
        </Link>
        <form onSubmit={handleSubmit} className="w-full max-w-[30rem] flex flex-col gap-7 mt-8 md:mt-12">
          <div className="text-center mb-4">
            <h1 className="font-montserrat text-3xl sm:text-4xl font-semibold text-bordeaux tracking-tight mb-2">
              Yeni Şifre Belirle
            </h1>
            <p className="text-sm text-muted">
              Hesabınız için yeni bir şifre belirleyin.
            </p>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm font-medium">
              {error}
            </div>
          )}

          {message ? (
            <div className="space-y-4">
              <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm font-medium">
                {message}
              </div>
              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-block px-5 py-2.5 rounded-md bg-bordeaux text-white font-semibold text-sm hover:bg-bordeaux/90 transition-colors"
                >
                  Giriş Yap
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="peer w-full px-4 pr-11 py-3.5 text-base rounded-md border border-border bg-surface text-text-dark placeholder-transparent focus:outline-none focus:ring-2 focus:ring-bordeaux/20 focus:border-bordeaux transition-all"
                    placeholder="Yeni Şifre"
                  />
                  <label
                    htmlFor="password"
                    className="absolute left-4 -top-2.5 bg-surface px-1 text-xs font-medium text-muted transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-bordeaux pointer-events-none"
                  >
                    Yeni Şifre
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-muted hover:text-text-dark transition-colors"
                    aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="passwordConfirm"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                    minLength={6}
                    className="peer w-full px-4 py-3.5 text-base rounded-md border border-border bg-surface text-text-dark placeholder-transparent focus:outline-none focus:ring-2 focus:ring-bordeaux/20 focus:border-bordeaux transition-all"
                    placeholder="Şifre Tekrarı"
                  />
                  <label
                    htmlFor="passwordConfirm"
                    className="absolute left-4 -top-2.5 bg-surface px-1 text-xs font-medium text-muted transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-bordeaux pointer-events-none"
                  >
                    Şifre Tekrarı
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 mt-2 text-base rounded-md bg-bordeaux text-white font-semibold hover:bg-bordeaux/90 focus:outline-none focus:ring-2 focus:ring-bordeaux/40 focus:ring-offset-2 focus:ring-offset-surface transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              >
                {submitting ? "Güncelleniyor..." : "Şifremi Güncelle"}
              </button>
            </>
          )}

          <p className="text-center text-sm text-muted">
            <Link to="/login" className="font-semibold text-bordeaux hover:text-bordeaux/80 hover:underline">
              Giriş sayfasına dön
            </Link>
          </p>
        </form>
      </div>

      {/* Logo tarafı */}
      <div className="hidden md:flex items-center justify-center bg-[#faf8f3] border-l border-bordeaux/10">
        <Link to="/" aria-label="Ana sayfaya dön">
          <img src={logoImg} alt="Doğan Emlak" className="h-80 w-auto object-contain" />
        </Link>
      </div>
    </div>
  );
}
