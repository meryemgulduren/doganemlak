import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background font-sans flex">
      <aside className="w-56 bg-white border-r border-accent/40 p-4 flex-shrink-0">
        <h2 className="text-lg font-bold text-text-dark mb-4">Admin</h2>
        <nav className="space-y-1 text-sm">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-text-dark hover:bg-accent/40 ${isActive ? "bg-accent/30 font-medium" : ""}`
            }
          >
            İstatistikler
          </NavLink>
          <NavLink
            to="/admin/ilanlar"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-text-dark hover:bg-accent/40 ${isActive ? "bg-accent/30 font-medium" : ""}`
            }
          >
            Tüm İlanlar
          </NavLink>
          <NavLink
            to="/admin/ilan-yeni"
            className={({ isActive }) =>
              `block px-3 py-2 rounded-lg text-text-dark hover:bg-accent/40 ${isActive ? "bg-accent/30 font-medium" : ""}`
            }
          >
            Yeni İlan
          </NavLink>
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
