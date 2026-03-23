import Navbar from "./Navbar";
import CompactTopBar from "./CompactTopBar";
import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";

export default function Layout() {
  const location = useLocation();
  const compactHeaderPaths = new Set([
    "/gayrimenkul-danismanlar",
    "/favorilerim",
    "/favori-danismanlar",
    "/sorun-oneri",
  ]);
  const useCompactHeader = compactHeaderPaths.has(location.pathname);

  return (
    <div className="min-h-screen font-sans bg-background">
      {useCompactHeader ? <CompactTopBar /> : <Navbar />}
      <main className="pt-[5.5rem]">
        <Outlet />
      </main>
    </div>
  );
}
