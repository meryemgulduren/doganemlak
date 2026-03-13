import { Search, LogIn, UserPlus, X, LogOut, User, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoImg from "../assets/logo.png";
import SearchSuggestions from "./SearchSuggestions";
import { useAuth } from "../context/AuthContext";
import { fetchCategories } from "../api/admin";

const PLACEHOLDER = "Kelime veya İlan No ile Ara";

export default function Navbar() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesData, setCategoriesData] = useState(null);
  const searchContainerRef = useRef(null);
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSuggestionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    
    // Kategorileri getir
    fetchCategories().then(res => {
      if (res && res.success && res.data) {
        setCategoriesData(res.data);
      }
    }).catch(err => console.error("Kategoriler yüklenirken hata:", err));

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const triggerSearch = (cats = selectedCategories, query = searchQuery) => {
    setSuggestionsOpen(false);
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    
    if (cats.length > 0) {
      params.set("category", cats[0].id);
      if (cats.length > 1) {
        params.set("listing_type", cats[1].id);
      }
      if (cats.length > 2) {
        params.set("sub_type", cats[2].id);
      }
    }
    
    navigate(`/ilanlar?${params.toString()}`);
  };

  const handleSelectMain = (item) => {
    const newCats = [item];
    setSelectedCategories(newCats);
    // Ana kategorinin alt tipleri (listing tipleri) varsa açık bırak, yoksa kapat
    const hasNext = categoriesData?.listingTypes?.length > 0;
    if (!hasNext) {
       triggerSearch(newCats);
    }
  };

  const handleSelectSub = (sub) => {
    if (sub.level === 2) {
      // İlan Tipi (Satılık/Kiralık) seçildi
      const mainCat = selectedCategories[0];
      const newCats = [mainCat, sub];
      setSelectedCategories(newCats);
      const hasNext = categoriesData?.subTypes?.[mainCat.id]?.length > 0;
      if (!hasNext) {
         triggerSearch(newCats);
      }
    } else if (sub.level === 3) {
      // Alt tip seçildi (Daire vs), artık arat diyoruz
      const newCats = [...selectedCategories.slice(0, 2), sub];
      setSelectedCategories(newCats);
      triggerSearch(newCats);
    }
  };

  const handleSelectAllInCategory = () => {
    triggerSearch(selectedCategories);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    triggerSearch();
  };

  const displayText = selectedCategories.map(c => c.label).join(" › ");
  const hasSelection = selectedCategories.length > 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-border pt-1 pb-2 shadow-sm">
      <nav className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex-shrink-0 -ml-1">
          <img src={logoImg} alt="Doğan Emlak" className="h-[72px] w-auto object-contain" />
        </Link>

        {/* Arama kutusu */}
        <div className="flex-1 max-w-2xl mx-4" ref={searchContainerRef}>
          <form
            onSubmit={handleFormSubmit}
            className="relative flex items-center rounded-xl border border-border bg-accent/20 pl-10 pr-4 py-2.5 min-h-[2.75rem] focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary focus-within:bg-white transition-all cursor-text"
            onClick={() => setSuggestionsOpen(true)}
          >
            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2" aria-label="Ara">
              <Search className="w-5 h-5 text-secondary pointer-events-none" />
            </button>
            {hasSelection ? (
              <>
                <span className="flex-1 font-semibold text-text-dark truncate">{displayText}</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSelectedCategories([]); setSuggestionsOpen(true); }}
                  className="flex-shrink-0 p-1 rounded-md text-muted hover:text-danger hover:bg-danger/10 transition-colors"
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
                className="flex-1 min-w-0 bg-transparent text-text-dark placeholder:text-muted focus:outline-none border-none text-base"
                aria-label="Arama"
              />
            )}
            <SearchSuggestions
              isOpen={suggestionsOpen}
              selectedCategories={selectedCategories}
              categoriesData={categoriesData}
              onSelectMain={handleSelectMain}
              onSelectSub={handleSelectSub}
              onSelectAllInCategory={handleSelectAllInCategory}
            />
          </form>
        </div>

        {/* Sağ butonlar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isLoggedIn && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-accent/40 text-text-dark font-medium hover:bg-primary hover:text-white transition-colors"
                aria-expanded={menuOpen}
              >
                <User className="w-5 h-5" />
                <span className="max-w-[100px] truncate hidden sm:block">{user.username}</span>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" aria-hidden onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 py-1.5 w-52 bg-surface border border-border rounded-xl shadow-card-hover z-50">
                    <div className="px-3 py-2 border-b border-border text-xs text-muted truncate mb-1">
                      {user.email}
                    </div>
                    {user.role === "ADMIN" && (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-text-dark hover:bg-accent/50 hover:text-primary transition-colors rounded-lg mx-1"
                      >
                        <Settings className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}
                    <Link
                      to="/favorilerim"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-text-dark hover:bg-accent/50 transition-colors rounded-lg mx-1"
                    >
                      ❤️ Favorilerim
                    </Link>
                    <button
                      type="button"
                      onClick={() => { setMenuOpen(false); logout(); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors rounded-lg mx-1"
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-text-dark text-sm font-medium hover:border-primary hover:text-primary transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Giriş
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold shadow-sm transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Kayıt Ol
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
