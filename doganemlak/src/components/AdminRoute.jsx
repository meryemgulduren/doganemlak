import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Sadece ADMIN rolündeki kullanıcıların erişebileceği sayfalar için.
 */
export default function AdminRoute({ children }) {
  const { user, isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center font-sans">
        <p className="text-text-dark/70">Yükleniyor...</p>
      </div>
    );
  }

  if (!isLoggedIn || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="min-h-[40vh] flex items-center justify-center font-sans">
        <p className="text-text-dark/70">Bu sayfaya erişim yetkiniz yok.</p>
      </div>
    );
  }

  return children;
}
