import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiRequest, setToken, setUnauthorizedHandler } from "../api/client";

const AuthContext = createContext(null);

const TOKEN_KEY = "token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isLoggedIn = !!user;

  const clearAuth = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await apiRequest("/api/auth/me");
      if (data?.user) {
        setUser(data.user);
      } else {
        clearAuth();
      }
    } catch {
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, [clearAuth]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    setUnauthorizedHandler(clearAuth);
    return () => setUnauthorizedHandler(null);
  }, [clearAuth]);

  const login = useCallback(
    async (loginInput, password) => {
      setError(null);
      try {
        const data = await apiRequest("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ login: loginInput, password }),
        });
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } catch (err) {
        const message = err.data?.message || err.message || "Giriş başarısız.";
        setError(message);
        return { success: false, message };
      }
    },
    []
  );

  const register = useCallback(
    async (username, email, password) => {
      setError(null);
      try {
        const data = await apiRequest("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ username, email, password }),
        });
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } catch (err) {
        const message = err.data?.message || err.message || "Kayıt başarısız.";
        setError(message);
        return { success: false, message };
      }
    },
    []
  );

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const value = {
    user,
    isLoggedIn,
    loading,
    error,
    setError,
    login,
    register,
    logout,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
