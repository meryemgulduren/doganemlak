import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import SeoListingLandingPage from "./pages/SeoListingLandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import IlanVerPage from "./pages/IlanVerPage";
import AdDetail from "./pages/AdDetail";
import FavorilerimPage from "./pages/FavorilerimPage";
import FavoriDanismanlarPage from "./pages/FavoriDanismanlarPage";
import GayrimenkulDanismanlarPage from "./pages/GayrimenkulDanismanlarPage";
import SorunOneriPage from "./pages/SorunOneriPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminListingsPage from "./pages/admin/AdminListingsPage";
import AdminListingFormPage from "./pages/admin/AdminListingFormPage";
import AdminAddAdminPage from "./pages/admin/AdminAddAdminPage";
import AdminComplaintsPage from "./pages/admin/AdminComplaintsPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/sifremi-unuttum" element={<ForgotPasswordPage />} />
          <Route path="/sifre-sifirla" element={<ResetPasswordPage />} />
          <Route path="/ilan/:id" element={<AdDetail />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="ilanlar" element={<HomePage />} />
            <Route path="emlak/samsun/kiralik" element={<Navigate to="/kiralik" replace />} />
            <Route path="emlak/samsun/satilik" element={<Navigate to="/satilik" replace />} />
            <Route path="kiralik" element={<SeoListingLandingPage />} />
            <Route path="satilik" element={<SeoListingLandingPage />} />
            <Route path="gayrimenkul-danismanlar" element={<GayrimenkulDanismanlarPage />} />
            <Route path="sorun-oneri" element={<SorunOneriPage />} />
            <Route
              path="favorilerim"
              element={
                <ProtectedRoute>
                  <FavorilerimPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="favori-danismanlar"
              element={
                <ProtectedRoute>
                  <FavoriDanismanlarPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="ilan-ver"
              element={
                <ProtectedRoute>
                  <IlanVerPage />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="ilanlar" element={<AdminListingsPage />} />
            <Route path="ilan-yeni" element={<AdminListingFormPage />} />
            <Route path="ilan-duzenle/:id" element={<AdminListingFormPage />} />
            <Route path="adminler" element={<AdminAddAdminPage />} />
            <Route path="talepler" element={<AdminComplaintsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
