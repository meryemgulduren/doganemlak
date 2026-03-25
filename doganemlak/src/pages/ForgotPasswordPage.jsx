import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import logoImg from "../assets/logo.png";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      const data = await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      setMessage(data.message || "E-posta adresinize şifre sıfırlama bağlantısı gönderildi.");
    } catch (err) {
      setError(err.data?.message || err.message || "Bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

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
            <h1 className="font-montserrat text-3xl sm:text-4xl font-semibold text-text-dark tracking-tight mb-2">
              Şifremi Unuttum
            </h1>
            <p className="text-sm text-muted">
              Kayıtlı e-posta adresinizi girin, şifre sıfırlama bağlantısı göndereceğiz.
            </p>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm font-medium">
              {error}
            </div>
          )}

          {message && (
            <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm font-medium">
              {message}
            </div>
          )}

          {!message && (
            <>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="peer w-full px-4 py-3.5 text-base rounded-md border border-border bg-surface text-text-dark placeholder-transparent focus:outline-none focus:ring-2 focus:ring-amber-200/50 focus:border-amber-300 transition-all"
                  placeholder="E-posta Adresi"
                />
                <label
                  htmlFor="email"
                  className="absolute left-4 -top-2.5 bg-surface px-1 text-xs font-medium text-muted transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-text-dark pointer-events-none"
                >
                  E-posta Adresi
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 mt-2 text-base rounded-md bg-amber-200 text-text-dark font-semibold hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200/60 focus:ring-offset-2 focus:ring-offset-surface transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
              >
                {submitting ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
              </button>
            </>
          )}

          <p className="text-center text-sm text-muted">
            <Link to="/login" className="font-semibold text-black hover:text-black/80 hover:underline">
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
