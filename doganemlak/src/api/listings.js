import { apiRequest } from './client';

export async function fetchFavorites() {
  return apiRequest('/api/favorites');
}

export async function addFavorite(listingId) {
  return apiRequest(`/api/favorites/${listingId}`, { method: 'POST' });
}

export async function removeFavorite(listingId) {
  return apiRequest(`/api/favorites/${listingId}`, { method: 'DELETE' });
}

export async function fetchReviews(listingId) {
  return apiRequest(`/api/listings/${listingId}/reviews`);
}

export async function createReview(listingId, { comment_text, rating }) {
  return apiRequest(`/api/listings/${listingId}/reviews`, {
    method: 'POST',
    body: JSON.stringify({ comment_text, rating }),
  });
}

export async function syncFavorites(listingIds) {
  return apiRequest('/api/favorites/sync', {
    method: 'POST',
    body: JSON.stringify({ listingIds }),
  });
}

export async function fetchListings(params = {}) {
  const search = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, value);
    }
  });

  // Support for bulk IDs fetch
  if (params.ids && Array.isArray(params.ids)) {
    search.set('ids', params.ids.join(','));
  }

  const qs = search.toString();
  return apiRequest(`/api/listings${qs ? `?${qs}` : ''}`);
}

export async function fetchListingById(id) {
  return apiRequest(`/api/listings/${id}`);
}
