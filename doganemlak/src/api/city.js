import { apiRequest } from './client';

/**
 * Tüm illeri getirir.
 */
export async function getCities() {
  return apiRequest('/api/cities');
}

/**
 * Belirli bir ilin ilçelerini getirir.
 */
export async function getDistricts(province) {
  return apiRequest(`/api/cities/${encodeURIComponent(province)}/districts`);
}

/**
 * Belirli bir ilçenin mahallelerini getirir.
 */
export async function getNeighborhoods(province, district) {
  return apiRequest(`/api/cities/${encodeURIComponent(province)}/districts/${encodeURIComponent(district)}/neighborhoods`);
}

export default { getCities, getDistricts, getNeighborhoods };
