import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Giriş yapmamış kullanıcıyı /login sayfasına yönlendirir.
 * İlan Ver gibi korumalı sayfalar için kullanılır.
 */
export default function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center font-sans">
        <p className="text-text-dark/70">Yükleniyor...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
