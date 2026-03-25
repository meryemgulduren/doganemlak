import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchFavorites, addFavorite, removeFavorite } from "../api/listings";

/**
 * Liste sayfalarında favori ilan kimliklerini yönetir (tek kaynak).
 */
export function useListingFavorites() {
  const { isLoggedIn } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  const [loadingIds, setLoadingIds] = useState(() => new Set());

  useEffect(() => {
    if (!isLoggedIn) {
      setFavoriteIds(new Set());
      return;
    }
    let cancelled = false;
    fetchFavorites()
      .then((res) => {
        if (cancelled || !res?.success || !Array.isArray(res.data)) return;
        setFavoriteIds(new Set(res.data.map((l) => String(l._id))));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

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
      if (!isLoggedIn) return "need_login";
      setLoadingIds((prev) => new Set(prev).add(id));
      const wasFavorite = favoriteIds.has(id);
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
      } catch {
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

  return {
    isLoggedIn,
    favoriteIds,
    isFavorite,
    isLoadingFavorite,
    toggleFavorite,
  };
}
