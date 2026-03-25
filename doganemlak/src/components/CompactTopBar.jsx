import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, LogOut, Search, Settings, User, UserCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import logoImg from "../assets/logo.png";
import AccountInfoModal from "./AccountInfoModal";
import { useAuth } from "../context/AuthContext";
import { fetchCategories } from "../api/admin";
import SearchSuggestions from "./SearchSuggestions";

const PLACEHOLDER = "Kelime veya İlan No ile Ara";

export default function CompactTopBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [categoriesData, setCategoriesData] = useState(null);
  const searchContainerRef = useRef(null);
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isFavoritesPage = location.pathname === "/favorilerim";

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSuggestionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    fetchCategories()
      .then((res) => {
        if (res && res.success && res.data) {
          setCategoriesData(res.data);
        }
      })
      .catch(() => {});
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isFavoritesPage) return;
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get("search") || "");
  }, [isFavoritesPage, location.search]);

  const triggerSearch = (cats = selectedCategories, query = searchQuery) => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    if (cats.length > 0) {
      params.set("category", cats[0].id);
      if (cats.length > 1) params.set("listing_type", cats[1].id);
      if (cats.length > 2) params.set("sub_type", cats[2].id);
    }
    setSuggestionsOpen(false);
    navigate(`/favorilerim?${params.toString()}`);
  };

  const handleSelectMain = (item) => {
    const newCats = [item];
    setSelectedCategories(newCats);
    const hasNext = categoriesData?.listingTypes?.length > 0;
    if (!hasNext) triggerSearch(newCats);
  };

  const handleSelectSub = (sub) => {
    if (sub.level === 2) {
      const mainCat = selectedCategories[0];
      const newCats = [mainCat, sub];
      setSelectedCategories(newCats);
      const hasNext = categoriesData?.subTypes?.[mainCat.id]?.length > 0;
      if (!hasNext) triggerSearch(newCats);
    } else if (sub.level === 3) {
      const newCats = [...selectedCategories.slice(0, 2), sub];
      setSelectedCategories(newCats);
      triggerSearch(newCats);
    }
  };

  const displayText = selectedCategories.map((c) => c.label).join(" › ");
  const hasSelection = selectedCategories.length > 0;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 py-2 bg-black/95 border-b border-white/10 backdrop-blur">
        <nav className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-8 min-h-16 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="flex h-16 sm:h-[4.75rem] items-center justify-start w-full max-w-[13rem] sm:max-w-[14rem] shrink-0"
          >
            <img
              src={logoImg}
              alt="Doğan Emlak"
              className="max-h-[5.25rem] sm:max-h-[5.75rem] w-auto max-w-full object-contain object-left"
            />
          </Link>

          {isFavoritesPage && (
            <div className="hidden lg:block min-w-0 w-full max-w-2xl px-2" ref={searchContainerRef}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  triggerSearch();
                }}
                className="relative flex items-center rounded-xl border border-white/30 bg-white/12 pl-10 pr-4 py-2.5 min-h-[2.75rem] focus-within:ring-2 focus-within:ring-amber-200/30 focus-within:border-white/40 focus-within:bg-black/10 transition-all cursor-text"
                onClick={() => setSuggestionsOpen(true)}
              >
                <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2" aria-label="Ara">
                  <Search className="w-5 h-5 text-white/70 pointer-events-none" />
                </button>
                {hasSelection ? (
                  <>
                    <span className="flex-1 font-semibold text-white/90 truncate">{displayText}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCategories([]);
                        setSuggestionsOpen(true);
                      }}
                      className="flex-shrink-0 p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
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
                    className="flex-1 min-w-0 bg-transparent text-white placeholder:text-white/60 focus:outline-none border-none text-base"
                    aria-label="Arama"
                  />
                )}
                <SearchSuggestions
                  isOpen={suggestionsOpen}
                  selectedCategories={selectedCategories}
                  categoriesData={categoriesData}
                  onSelectMain={handleSelectMain}
                  onSelectSub={handleSelectSub}
                  onSelectAllInCategory={() => triggerSearch(selectedCategories)}
                />
              </form>
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="inline-flex items-center px-3 py-2 rounded-xl border border-white/15 text-white/90 text-sm font-medium hover:border-white/30 hover:text-white transition-colors"
            >
              Ana Sayfa
            </Link>

            {isLoggedIn && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
                  aria-expanded={menuOpen}
                >
                  <User className="w-5 h-5" />
                  <span className="max-w-[100px] truncate hidden sm:block">{user.username}</span>
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" aria-hidden onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 py-1.5 w-52 bg-black/95 border border-white/10 rounded-xl shadow-card-hover z-50">
                      <div className="px-3 py-2 border-b border-white/10 text-xs text-white/70 truncate mb-1">
                        {user.email}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          setAccountModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-white transition-colors rounded-lg mx-1 text-left"
                      >
                        <UserCircle className="w-4 h-4 flex-shrink-0" />
                        Hesap Bilgilerim
                      </button>
                      {user.role === "ADMIN" && (
                        <Link
                          to="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-white transition-colors rounded-lg mx-1"
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
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors rounded-lg mx-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Çıkış Yap
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-200 text-text-dark text-sm font-semibold shadow-sm hover:bg-amber-300 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Profil
              </Link>
            )}
          </div>
        </nav>
      </header>

      <AccountInfoModal
        open={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        user={user}
      />
    </>
  );
}
