import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { fetchFavorites, addFavorite, removeFavorite, syncFavorites } from "../api/listings";
import { 
  fetchFavoriteConsultants, 
  addFavoriteConsultant, 
  removeFavoriteConsultant, 
  syncFavoriteConsultants 
} from "../api/consultants";

const FavoriteContext = createContext(null);

const GUEST_FAVORITES_KEY = "guest_favorites";
const GUEST_CONSULTANT_FAVORITES_KEY = "guest_consultant_favorites";

export function FavoriteProvider({ children }) {
  const { isLoggedIn, user: authUser } = useAuth();
  
  // Listings
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loadingIds, setLoadingIds] = useState(new Set());
  
  // Consultants
  const [consultantFavoriteIds, setConsultantFavoriteIds] = useState(new Set());
  const [loadingConsultantIds, setLoadingConsultantIds] = useState(new Set());
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize favorites on mount or auth change
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // 1. Initializing Listing Favorites
      if (isLoggedIn) {
        try {
          const res = await fetchFavorites();
          if (!cancelled && res?.success && Array.isArray(res.data)) {
            setFavoriteIds(new Set(res.data.map((l) => String(l._id))));
          }
        } catch (err) {
          console.error("Failed to fetch backend favorites:", err);
        }
      } else {
        const local = localStorage.getItem(GUEST_FAVORITES_KEY);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed)) {
              setFavoriteIds(new Set(parsed.map(String)));
            }
          } catch (e) {
            console.error("Failed to parse local favorites:", e);
          }
        } else {
          setFavoriteIds(new Set());
        }
      }

      // 2. Initializing Consultant Favorites
      if (isLoggedIn) {
        try {
          const res = await fetchFavoriteConsultants();
          if (!cancelled && res?.success && Array.isArray(res.data)) {
            setConsultantFavoriteIds(new Set(res.data.map((c) => String(c._id))));
          }
        } catch (err) {
          console.error("Failed to fetch backend consultant favorites:", err);
        }
      } else {
        const local = localStorage.getItem(GUEST_CONSULTANT_FAVORITES_KEY);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed)) {
              setConsultantFavoriteIds(new Set(parsed.map(String)));
            }
          } catch (e) {
            console.error("Failed to parse local consultant favorites:", e);
          }
        } else {
          setConsultantFavoriteIds(new Set());
        }
      }

      if (!cancelled) setIsInitialized(true);
    }

    init();
    return () => { cancelled = true; };
  }, [isLoggedIn]);

  // --- Listing Helpers ---

  const isFavorite = useCallback(
    (listingId) => favoriteIds.has(String(listingId)),
    [favoriteIds]
  );

  const isLoadingFavorite = useCallback(
    (listingId) => loadingIds.has(String(listingId)),
    [loadingIds]
  );

  const toggleFavorite = useCallback(
    async (listingId) => {
      const id = String(listingId);
      const wasFavorite = favoriteIds.has(id);

      if (!isLoggedIn) {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (wasFavorite) next.delete(id);
          else next.add(id);
          localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(Array.from(next)));
          return next;
        });
        return "ok";
      }

      setLoadingIds((prev) => new Set(prev).add(id));
      try {
        if (wasFavorite) {
          await removeFavorite(listingId);
          setFavoriteIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        } else {
          await addFavorite(listingId);
          setFavoriteIds((prev) => new Set([...prev, id]));
        }
        return "ok";
      } catch (err) {
        console.error("Favorite toggle failed:", err);
        return "error";
      } finally {
        setLoadingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [isLoggedIn, favoriteIds]
  );

  // --- Consultant Helpers ---

  const isConsultantFavorite = useCallback(
    (consultantId) => consultantFavoriteIds.has(String(consultantId)),
    [consultantFavoriteIds]
  );

  const isLoadingConsultantFavorite = useCallback(
    (consultantId) => loadingConsultantIds.has(String(consultantId)),
    [loadingConsultantIds]
  );

  const toggleConsultantFavorite = useCallback(
    async (consultantId) => {
      const id = String(consultantId);
      const wasFavorite = consultantFavoriteIds.has(id);

      if (!isLoggedIn) {
        setConsultantFavoriteIds((prev) => {
          const next = new Set(prev);
          if (wasFavorite) next.delete(id);
          else next.add(id);
          localStorage.setItem(GUEST_CONSULTANT_FAVORITES_KEY, JSON.stringify(Array.from(next)));
          return next;
        });
        return "ok";
      }

      setLoadingConsultantIds((prev) => new Set(prev).add(id));
      try {
        if (wasFavorite) {
          await removeFavoriteConsultant(consultantId);
          setConsultantFavoriteIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        } else {
          await addFavoriteConsultant(consultantId);
          setConsultantFavoriteIds((prev) => new Set([...prev, id]));
        }
        return "ok";
      } catch (err) {
        console.error("Consultant favorite toggle failed:", err);
        return "error";
      } finally {
        setLoadingConsultantIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [isLoggedIn, consultantFavoriteIds]
  );

  // --- Sync Helpers ---

  const syncLocalFavorites = useCallback(async () => {
    if (!isLoggedIn) return;
    
    // 1. Sync Listings
    const local = localStorage.getItem(GUEST_FAVORITES_KEY);
    if (local) {
      try {
        const ids = JSON.parse(local);
        if (Array.isArray(ids) && ids.length > 0) {
          await syncFavorites(ids);
        }
        localStorage.removeItem(GUEST_FAVORITES_KEY);
      } catch (e) {
        console.error("Sync favorites failed:", e);
      }
    }

    // 2. Sync Consultants
    const localConsultants = localStorage.getItem(GUEST_CONSULTANT_FAVORITES_KEY);
    if (localConsultants) {
      try {
        const ids = JSON.parse(localConsultants);
        if (Array.isArray(ids) && ids.length > 0) {
          await syncFavoriteConsultants(ids);
        }
        localStorage.removeItem(GUEST_CONSULTANT_FAVORITES_KEY);
      } catch (e) {
        console.error("Sync consultant favorites failed:", e);
      }
    }

    // After all syncs, refresh both
    try {
      const [listingRes, consultantRes] = await Promise.all([
        fetchFavorites(),
        fetchFavoriteConsultants()
      ]);
      if (listingRes?.success) setFavoriteIds(new Set(listingRes.data.map(l => String(l._id))));
      if (consultantRes?.success) setConsultantFavoriteIds(new Set(consultantRes.data.map(c => String(c._id))));
    } catch (err) {
      console.error("Post-sync refresh failed:", err);
    }

  }, [isLoggedIn]);

  // Sync when logging in
  useEffect(() => {
    if (isLoggedIn && isInitialized) {
      syncLocalFavorites();
    }
  }, [isLoggedIn, isInitialized, syncLocalFavorites]);

  const value = {
    favoriteIds,
    isFavorite,
    isLoadingFavorite,
    toggleFavorite,
    
    consultantFavoriteIds,
    isConsultantFavorite,
    isLoadingConsultantFavorite,
    toggleConsultantFavorite,

    syncLocalFavorites,
    isInitialized
  };

  return <FavoriteContext.Provider value={value}>{children}</FavoriteContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoriteProvider");
  }
  return context;
}
