import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <Navbar />
      <main className="pt-[5.5rem]">
        <Outlet />
      </main>
    </div>
  );
}
