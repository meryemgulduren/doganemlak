import { useFavorites } from "../context/FavoriteContext";

/**
 * Liste sayfalarında favori ilan kimliklerini yönetir (FavoriteContext görünümü).
 */
export function useListingFavorites() {
  const { 
    favoriteIds,
    isFavorite, 
    isLoadingFavorite, 
    toggleFavorite, 
    isLoggedIn 
  } = useFavorites();

  return {
    isLoggedIn,
    favoriteIds,
    isFavorite,
    isLoadingFavorite,
    toggleFavorite,
  };
}
