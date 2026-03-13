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

export async function fetchListings(params = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set('page', params.page);
  if (params.limit) search.set('limit', params.limit);
  if (params.category) search.set('category', params.category);
  if (params.listing_type) search.set('listing_type', params.listing_type);
  if (params.sub_type) search.set('subType', params.sub_type);
  if (params.property_type) search.set('property_type', params.property_type);
  if (params.city) search.set('city', params.city);
  if (params.search) search.set('search', params.search);
  if (params.minPrice != null) search.set('minPrice', params.minPrice);
  if (params.maxPrice != null) search.set('maxPrice', params.maxPrice);
  const qs = search.toString();
  return apiRequest(`/api/listings${qs ? `?${qs}` : ''}`);
}

export async function fetchListingById(id) {
  return apiRequest(`/api/listings/${id}`);
}
