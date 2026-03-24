import { Search, LogIn, UserPlus, X, LogOut, User, Settings, UserCircle, Menu } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoImg from "../assets/logo.png";
import SearchSuggestions from "./SearchSuggestions";
import AccountInfoModal from "./AccountInfoModal";
import { useAuth } from "../context/AuthContext";
import { fetchCategories } from "../api/admin";

const PLACEHOLDER = "Kelime veya İlan No ile Ara";

const navExtraLinkClass =
  "inline-flex flex-col items-center justify-center gap-0 px-1.5 sm:px-2 py-1 rounded-lg text-bordeaux font-semibold text-[10px] sm:text-xs lg:text-sm hover:bg-accent hover:text-bordeaux transition-colors leading-tight text-center";

export default function Navbar() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileLinksOpen, setMobileLinksOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
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
    <>
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-sm border-b border-bordeaux/12 pt-1 pb-2 shadow-sm">
      <nav className="max-w-[1600px] mx-auto px-3 sm:px-5 lg:px-8 min-h-16 grid grid-cols-[1fr_auto] items-center gap-x-2 gap-y-2 sm:grid-cols-[14rem_minmax(0,1fr)_auto] sm:gap-x-4 sm:gap-y-2">
        {/* Logo — sabit genişlik sütunda büyütülür; arama ve sağ blokların düzeni değişmez */}
        <Link
          to="/"
          className="order-1 sm:order-none flex h-14 sm:h-[4.75rem] items-center justify-start sm:justify-self-start -ml-1 sm:-ml-6 lg:-ml-8 w-full max-w-[12rem] sm:max-w-[14rem]"
        >
          <img
            src={logoImg}
            alt="Doğan Emlak"
            className="max-h-[5.25rem] sm:max-h-[5.75rem] w-auto max-w-full object-contain object-left"
          />
        </Link>

        {/* Mobil: giriş/kayıt logo ile aynı satır */}
        <div className="order-2 sm:hidden justify-self-end flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileLinksOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-text-dark bg-surface hover:bg-accent/30 transition-colors"
            aria-label="Hızlı bağlantı menüsü"
          >
            <Menu className="w-5 h-5" />
          </button>
          {isLoggedIn && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-accent text-text-dark font-medium hover:bg-bordeaux hover:text-white transition-colors"
                aria-expanded={menuOpen}
              >
                <User className="w-5 h-5" />
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" aria-hidden onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 py-1.5 w-52 bg-surface border border-border rounded-xl shadow-card-hover z-50">
                    <div className="px-3 py-2 border-b border-border text-xs text-muted truncate mb-1">
                      {user.email}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setAccountModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-dark hover:bg-accent hover:text-bordeaux transition-colors rounded-lg mx-1 text-left"
                    >
                      <UserCircle className="w-4 h-4 flex-shrink-0" />
                      Hesap Bilgilerim
                    </button>
                    {user.role === "ADMIN" && (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-text-dark hover:bg-accent hover:text-bordeaux transition-colors rounded-lg mx-1"
                      >
                        <Settings className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}
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
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-text-dark text-sm font-medium hover:border-primary hover:text-primary transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Giriş
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-bordeaux text-white text-sm font-semibold shadow-sm hover:bg-bordeaux/90 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>

        {/* Arama kutusu */}
        <div className="order-3 col-span-2 sm:col-span-1 sm:order-none min-w-0 w-full max-w-2xl justify-self-start pl-0 pr-2 sm:pr-4" ref={searchContainerRef}>
          <form
            onSubmit={handleFormSubmit}
            className="relative flex items-center rounded-xl border border-border bg-cream/70 pl-10 pr-4 py-2.5 min-h-[2.75rem] focus-within:ring-2 focus-within:ring-bordeaux/20 focus-within:border-bordeaux/45 focus-within:bg-surface transition-all cursor-text"
            onClick={() => setSuggestionsOpen(true)}
          >
            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2" aria-label="Ara">
              <Search className="w-5 h-5 text-bordeaux/70 pointer-events-none" />
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

        {/* Yan menüden taşınan bağlantılar + sağ butonlar */}
        <div className="order-4 col-span-2 sm:col-span-1 sm:order-none flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 flex-shrink-0 min-w-0 w-full sm:w-auto sm:justify-self-end">
          <div className="order-2 sm:order-1 hidden sm:flex sm:items-center sm:gap-1 lg:gap-1.5 min-w-0 w-full sm:w-auto sm:flex-none overflow-visible sm:overflow-visible border-0 sm:border-r sm:border-border/60 pr-0 sm:pr-2 lg:pr-3 mr-0 sm:mr-1">
            <Link to="/gayrimenkul-danismanlar" className={navExtraLinkClass}>
              <span className="block">Gayrimenkul</span>
              <span className="block">Danışmanlarımız</span>
            </Link>
            <Link to="/favorilerim" className={navExtraLinkClass}>
              <span className="block">Favori</span>
              <span className="block">İlanlar</span>
            </Link>
            <Link to="/favori-danismanlar" className={navExtraLinkClass}>
              <span className="block">Favori</span>
              <span className="block">Danışmanlar</span>
            </Link>
            <Link to="/sorun-oneri" className={navExtraLinkClass}>
              <span className="block">Sorun/Öneri</span>
              <span className="block">Bildirimi</span>
            </Link>
          </div>

          {isLoggedIn && user ? (
            <div className="order-1 sm:order-2 relative self-end sm:self-auto hidden sm:block">
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-accent text-text-dark font-medium hover:bg-bordeaux hover:text-white transition-colors"
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
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setAccountModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-dark hover:bg-accent hover:text-bordeaux transition-colors rounded-lg mx-1 text-left"
                    >
                      <UserCircle className="w-4 h-4 flex-shrink-0" />
                      Hesap Bilgilerim
                    </button>
                    {user.role === "ADMIN" && (
                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-text-dark hover:bg-accent hover:text-bordeaux transition-colors rounded-lg mx-1"
                      >
                        <Settings className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}
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
            <div className="order-1 sm:order-2 flex items-center justify-end gap-2 hidden sm:flex">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-text-dark text-sm font-medium hover:border-primary hover:text-primary transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Giriş
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-bordeaux text-white text-sm font-semibold shadow-sm hover:bg-bordeaux/90 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>

    {/* header dışında: backdrop-blur fixed header içinde fixed modal'ı bozuyor (viewport yerine header'a göre konumlanır) */}
    <AccountInfoModal
      open={accountModalOpen}
      onClose={() => setAccountModalOpen(false)}
      user={user}
    />
    {mobileLinksOpen && (
      <>
        <div
          className="sm:hidden fixed inset-0 z-[60] bg-text-dark/35"
          aria-hidden
          onClick={() => setMobileLinksOpen(false)}
        />
        <aside className="sm:hidden fixed right-0 top-0 z-[70] h-full w-[82%] max-w-[320px] bg-surface border-l border-border shadow-2xl p-4">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
            <p className="text-sm font-semibold text-text-dark">Hızlı Bağlantılar</p>
            <button
              type="button"
              onClick={() => setMobileLinksOpen(false)}
              className="p-2 rounded-lg hover:bg-accent/40 text-text-dark"
              aria-label="Menüyü kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-2">
            <Link
              to="/gayrimenkul-danismanlar"
              onClick={() => setMobileLinksOpen(false)}
              className="px-3 py-2.5 rounded-lg border border-border text-text-dark font-medium hover:bg-accent/30 transition-colors"
            >
              Gayrimenkul Danışmanlarımız
            </Link>
            <Link
              to="/favorilerim"
              onClick={() => setMobileLinksOpen(false)}
              className="px-3 py-2.5 rounded-lg border border-border text-text-dark font-medium hover:bg-accent/30 transition-colors"
            >
              Favori İlanlar
            </Link>
            <Link
              to="/favori-danismanlar"
              onClick={() => setMobileLinksOpen(false)}
              className="px-3 py-2.5 rounded-lg border border-border text-text-dark font-medium hover:bg-accent/30 transition-colors"
            >
              Favori Danışmanlar
            </Link>
            <Link
              to="/sorun-oneri"
              onClick={() => setMobileLinksOpen(false)}
              className="px-3 py-2.5 rounded-lg border border-border text-text-dark font-medium hover:bg-accent/30 transition-colors"
            >
              Sorun / Öneri Bildirimi
            </Link>
          </nav>
        </aside>
      </>
    )}
    </>
  );
}
