import { Search, LogIn, UserPlus, X, LogOut, User, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import logoImg from "../assets/logo.png";
import SearchSuggestions from "./SearchSuggestions";
import { useAuth } from "../context/AuthContext";

const PLACEHOLDER = "Kelime veya İlan No ile Ara";

export default function Navbar() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchContainerRef = useRef(null);
  const { user, isLoggedIn, logout } = useAuth();

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSuggestionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectMain = (item) => {
    setSelectedCategories([item.label]);
    if (!item.subcategories?.length) setSuggestionsOpen(false);
  };

  const handleSelectSub = (sub) => {
    setSelectedCategories((prev) => [...prev, sub.label]);
    setSuggestionsOpen(Boolean(sub.subcategories?.length));
  };

  const handleSelectAllInCategory = () => {
    setSuggestionsOpen(false);
  };

  const displayText = selectedCategories.join(" - ");
  const hasSelection = selectedCategories.length > 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-accent/30 pt-2 pb-4 font-sans">
      <nav className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex-shrink-0 flex items-center gap-2 -ml-1">
          <img
            src={logoImg}
            alt="Doğan Emlak"
            className="h-24 w-auto object-contain"
          />
        </Link>

        <div className="flex-1 max-w-2xl mx-4" ref={searchContainerRef}>
          <div
            className="relative flex items-center rounded-xl border border-secondary/40 bg-white/80 pl-10 pr-4 py-2.5 min-h-[2.75rem] focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-shadow cursor-text"
            onClick={() => setSuggestionsOpen(true)}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary pointer-events-none z-10" />
            {hasSelection ? (
              <>
                <span className="flex-1 font-bold text-text-dark truncate font-sans text-base">
                  {displayText}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCategories([]);
                  }}
                  className="flex-shrink-0 p-1 rounded-md text-text-dark/70 hover:text-text-dark hover:bg-text-dark/10 transition-colors"
                  aria-label="Temizle"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <input
                type="search"
                placeholder={PLACEHOLDER}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSuggestionsOpen(true)}
                className="flex-1 min-w-0 bg-transparent text-text-dark placeholder:text-text-dark focus:outline-none font-sans text-base border-none"
                aria-label="Arama"
              />
            )}
            <SearchSuggestions
              isOpen={suggestionsOpen}
              selectedCategories={selectedCategories}
              onSelectMain={handleSelectMain}
              onSelectSub={handleSelectSub}
              onSelectAllInCategory={handleSelectAllInCategory}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isLoggedIn && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-text-dark font-sans font-medium hover:bg-accent/40 hover:text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-colors"
                aria-expanded={menuOpen}
                aria-haspopup="true"
              >
                <User className="w-5 h-5" />
                <span className="max-w-[120px] truncate">{user.username}</span>
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    aria-hidden="true"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 py-1 w-48 bg-white border border-accent/40 rounded-xl shadow-lg z-50 font-sans">
                    <div className="px-3 py-2 border-b border-accent/30 text-sm text-text-dark/80 truncate">
                      {user.email}
                    </div>
                    {user.role === "ADMIN" && (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="w-full inline-flex items-center gap-2 px-3 py-2 text-left text-sm text-text-dark hover:bg-accent/40 rounded-lg"
                      >
                        <Settings className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      className="w-full inline-flex items-center gap-2 px-3 py-2 text-left text-sm text-text-dark hover:bg-accent/40 rounded-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      Çıkış Yap
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-text-dark font-sans font-medium hover:bg-accent/40 hover:text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-colors"
              >
                <LogIn className="w-5 h-5" />
                Giriş Yap
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-text-dark font-sans font-medium hover:bg-accent/40 hover:text-primary focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                Kayıt Ol
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
