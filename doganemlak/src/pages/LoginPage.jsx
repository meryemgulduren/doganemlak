import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logoImg from "../assets/logo.png";

export default function LoginPage() {
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error, setError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await login(loginInput.trim(), password);
      if (result.success) {
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      }
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
            <h1 className="font-montserrat text-4xl font-semibold text-text-dark tracking-tight mb-4">
              Giriş Yap
            </h1>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="relative">
              <input
                id="login"
                type="text"
                autoComplete="username"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                required
                className="peer w-full px-4 py-3.5 text-base rounded-md border border-border bg-surface text-text-dark placeholder-transparent focus:outline-none focus:ring-2 focus:ring-bordeaux/20 focus:border-bordeaux transition-all"
                placeholder="E-posta veya Kullanıcı Adı"
              />
              <label
                htmlFor="login"
                className="absolute left-4 -top-2.5 bg-surface px-1 text-xs font-medium text-muted transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-bordeaux pointer-events-none"
              >
                E-posta veya Kullanıcı Adı
              </label>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="peer w-full px-4 pr-11 py-3.5 text-base rounded-md border border-border bg-surface text-text-dark placeholder-transparent focus:outline-none focus:ring-2 focus:ring-bordeaux/20 focus:border-bordeaux transition-all"
                placeholder="Şifre"
              />
              <label
                htmlFor="password"
                className="absolute left-4 -top-2.5 bg-surface px-1 text-xs font-medium text-muted transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-bordeaux pointer-events-none"
              >
                Şifre
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
          </div>

          <div className="text-right -mt-2">
            <Link to="/sifremi-unuttum" className="text-sm font-medium text-black hover:text-black/80 hover:underline">
              Şifremi Unuttum
            </Link>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 mt-2 text-base rounded-md bg-amber-200 text-text-dark font-semibold hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200/60 focus:ring-offset-2 focus:ring-offset-surface transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            {submitting ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>

          <p className="text-center text-sm text-muted">
            Hesabınız yok mu?{" "}
            <Link to="/register" className="font-semibold text-black hover:text-black/80 hover:underline">
              Kayıt Ol
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
