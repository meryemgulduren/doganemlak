import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logoImg from "../assets/logo.png";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register, error, setError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await register(username.trim(), email.trim(), password);
      if (result.success) {
        navigate("/", { replace: true });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans grid grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col items-center justify-center px-6 py-12 md:px-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md flex flex-col gap-8 mt-8 md:mt-12"
        >
          <h1 className="text-4xl font-extrabold text-text-dark uppercase tracking-wide text-center">
            Kayıt Ol
          </h1>

          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-700 text-sm font-sans">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-5">
            <label htmlFor="username" className="sr-only">
              Kullanıcı Adı
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="Kullanıcı Adı"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-5 py-4 text-base rounded-md bg-transparent border border-text-dark text-text-dark placeholder:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all font-sans"
            />
            <label htmlFor="email" className="sr-only">
              E-posta Adresi
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="E-posta Adresi"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-5 py-4 text-base rounded-md bg-transparent border border-text-dark text-text-dark placeholder:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all font-sans"
            />
            <label htmlFor="password" className="sr-only">
              Şifre
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 pr-11 py-4 text-base rounded-md bg-transparent border border-text-dark text-text-dark placeholder:text-text-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-text-dark/70 hover:text-text-dark"
                aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 text-lg rounded-md bg-text-dark text-background font-sans font-semibold hover:bg-text-dark/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Kayıt yapılıyor..." : "Kayıt Ol"}
          </button>
        </form>

        <p className="mt-10 text-center text-text-dark text-base font-sans">
          Zaten hesabınız var mı?{" "}
          <Link
            to="/login"
            className="text-text-dark font-semibold hover:text-primary underline underline-offset-2 transition-colors"
          >
            Giriş Yap
          </Link>
        </p>
      </div>

      <div className="flex items-center justify-center px-6 py-12 md:px-12 bg-background border-l border-accent/30">
        <Link to="/" className="flex items-center justify-center" aria-label="Ana sayfaya dön">
          <img
            src={logoImg}
            alt="Doğan Emlak"
            className="h-52 w-auto object-contain md:h-72"
          />
        </Link>
      </div>
    </div>
  );
}
