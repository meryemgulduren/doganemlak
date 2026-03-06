import { apiRequest, API_BASE, getToken } from './client';

/**
 * PC'den seçilen resim dosyasını sunucuya yükler; dönen URL'yi kullanabilirsiniz.
 */
export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${API_BASE}/api/admin/upload/image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Yükleme başarısız.');
  return data.url;
}

export async function fetchFeatureDefinitions() {
  return apiRequest('/api/feature-definitions');
}

/** İlan verme adım adım kategori seçimi için kategori ağacı (public endpoint). */
export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/api/categories`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Kategoriler yüklenemedi.');
  return data;
}

export async function fetchAdminStats() {
  return apiRequest('/api/admin/stats');
}

export async function fetchAdminListings(params = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set('page', params.page);
  if (params.limit) search.set('limit', params.limit);
  if (params.status) search.set('status', params.status);
  if (params.listing_type) search.set('listing_type', params.listing_type);
  if (params.city) search.set('city', params.city);
  const qs = search.toString();
  return apiRequest(`/api/admin/listings${qs ? `?${qs}` : ''}`);
}

export async function createAdminListing(body) {
  return apiRequest('/api/admin/listings', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateAdminListing(id, body) {
  return apiRequest(`/api/admin/listings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteAdminListing(id) {
  return apiRequest(`/api/admin/listings/${id}`, { method: 'DELETE' });
}
