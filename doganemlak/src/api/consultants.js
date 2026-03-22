import { apiRequest } from './client';

/** Herkese açık: tüm admin danışmanlar (giriş gerekmez). */
export async function fetchPublicConsultants() {
  return apiRequest('/api/consultants');
}

export async function fetchFavoriteConsultants() {
  return apiRequest('/api/favorite-consultants');
}

export async function addFavoriteConsultant(consultantId) {
  return apiRequest(`/api/favorite-consultants/${consultantId}`, { method: 'POST' });
}

export async function removeFavoriteConsultant(consultantId) {
  return apiRequest(`/api/favorite-consultants/${consultantId}`, { method: 'DELETE' });
}
