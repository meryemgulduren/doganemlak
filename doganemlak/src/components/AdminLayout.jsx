import { NavLink, Link, Outlet } from "react-router-dom";
import logoImg from "../assets/logo.png";

const NAV_ITEMS = [
  {
    to: "/admin",
    end: true,
    label: "İstatistikler",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    to: "/admin/ilanlar",
    end: false,
    label: "Tüm İlanlar",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
  {
    to: "/admin/ilan-yeni",
    end: false,
    label: "Yeni İlan",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    to: "/admin/adminler",
    end: false,
    label: "Adminler",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background font-sans flex">
      {/* Sidebar */}
      <aside className="w-52 bg-surface border-r border-border flex flex-col flex-shrink-0 shadow-sm">
        {/* Logo / Brand */}
        <div className="px-4 py-4 border-b border-border flex flex-col items-center gap-2 bg-primary/5">
          <img src={logoImg} alt="Logo" className="h-16 w-auto object-contain" />
          <span className="text-[10px] font-bold tracking-widest text-primary uppercase">⚙ Admin Panel</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5">
          <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted">Menü</p>
          {NAV_ITEMS.map(({ to, end, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-primary/5 text-primary border border-primary font-semibold shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
                    : "text-text-dark/70 hover:bg-accent/60 hover:text-primary border border-transparent"
                }`
              }
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: Ana Sayfa */}
        <div className="px-2 py-3 border-t border-border">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:bg-accent/60 hover:text-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Ana Sayfa
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-background">
        {/* Top bar */}
        <div className="bg-surface border-b border-border px-6 py-3 flex items-center justify-between shadow-sm">
          <span className="text-sm text-muted font-medium">Doğan Emlak · Yönetim Paneli</span>
          <Link to="/" className="text-xs text-primary hover:underline font-semibold">← Siteye Dön</Link>
        </div>
        <div className="p-5">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
