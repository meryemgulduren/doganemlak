import { apiRequest } from './client';

/** Herkese açık: tüm admin danışmanlar (giriş gerekmez). */
export async function fetchPublicConsultants(ids = []) {
  const query = Array.isArray(ids) && ids.length > 0 ? `?ids=${ids.join(',')}` : "";
  return apiRequest(`/api/consultants${query}`);
}

export async function fetchFavoriteConsultants() {
  return apiRequest('/api/favorite-consultants');
}

export async function syncFavoriteConsultants(consultantIds) {
  return apiRequest('/api/favorite-consultants/sync', {
    method: 'POST',
    body: JSON.stringify({ consultantIds }),
  });
}

export async function addFavoriteConsultant(consultantId) {
  return apiRequest(`/api/favorite-consultants/${consultantId}`, { method: 'POST' });
}

export async function removeFavoriteConsultant(consultantId) {
  return apiRequest(`/api/favorite-consultants/${consultantId}`, { method: 'DELETE' });
}
