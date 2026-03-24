import { NavLink, Link, Outlet } from "react-router-dom";
import logoImg from "../assets/logo.png";
import { useState } from "react";

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
  {
    to: "/admin/talepler",
    end: false,
    label: "Talepler",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-background font-sans flex">
      {/* Sidebar */}
      <aside className="hidden sm:flex w-52 bg-surface border-r border-border flex-col flex-shrink-0 shadow-sm">
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

      {/* Mobile: Drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 sm:hidden"
            onClick={closeSidebar}
            aria-hidden
          />
          <aside className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-surface border-r border-border shadow-lg sm:hidden flex flex-col">
            <div className="px-4 py-4 border-b border-border flex flex-col items-center gap-2 bg-primary/5">
              <img src={logoImg} alt="Logo" className="h-16 w-auto object-contain" />
              <span className="text-[10px] font-bold tracking-widest text-primary uppercase">⚙ Admin Panel</span>
            </div>
            <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-0.5">
              <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted">Menü</p>
              {NAV_ITEMS.map(({ to, end, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={closeSidebar}
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
            <div className="px-2 py-3 border-t border-border">
              <Link
                to="/"
                onClick={closeSidebar}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:bg-accent/60 hover:text-primary transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Ana Sayfa
              </Link>
            </div>
          </aside>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-background">
        {/* Top bar */}
        <div className="bg-surface border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="sm:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-border bg-background text-text-dark/80 hover:bg-accent/50 transition-colors"
              aria-label="Menüyü Aç"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <span className="text-sm text-muted font-medium">Doğan Emlak · Yönetim Paneli</span>
          </div>
          <Link to="/" className="text-xs text-primary hover:underline font-semibold">← Siteye Dön</Link>
        </div>
        <div className="p-5">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
