import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logoImg from "../assets/logo.png";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const navigate = useNavigate();
  const { register, error, setError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await register(username.trim(), email.trim(), password);
      if (result.success) navigate("/", { replace: true });
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
            <h1 className="text-4xl font-extrabold text-bordeaux mb-4">Kayıt Ol</h1>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="relative">
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="peer w-full px-4 py-3.5 text-base rounded-md border border-border bg-surface text-text-dark placeholder-transparent focus:outline-none focus:ring-2 focus:ring-bordeaux/20 focus:border-bordeaux transition-all"
                placeholder="Kullanıcı Adı"
              />
              <label
                htmlFor="username"
                className="absolute left-4 -top-2.5 bg-surface px-1 text-xs font-medium text-muted transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-bordeaux pointer-events-none"
              >
                Kullanıcı Adı
              </label>
            </div>
            <div className="relative">
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="peer w-full px-4 py-3.5 text-base rounded-md border border-border bg-surface text-text-dark placeholder-transparent focus:outline-none focus:ring-2 focus:ring-bordeaux/20 focus:border-bordeaux transition-all"
                placeholder="E-posta Adresi"
              />
              <label
                htmlFor="email"
                className="absolute left-4 -top-2.5 bg-surface px-1 text-xs font-medium text-muted transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-bordeaux pointer-events-none"
              >
                E-posta Adresi
              </label>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
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

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 mt-2 text-base rounded-md bg-bordeaux text-white font-semibold hover:bg-bordeaux/90 focus:outline-none focus:ring-2 focus:ring-bordeaux/40 focus:ring-offset-2 focus:ring-offset-surface transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            {submitting ? "Kayıt yapılıyor..." : "Kayıt Ol"}
          </button>

          <p className="text-center text-sm text-muted">
            Zaten hesabınız var mı?{" "}
            <Link to="/login" className="font-semibold text-bordeaux hover:text-bordeaux/80 hover:underline">
              Giriş Yap
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
