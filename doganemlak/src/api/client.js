const raw = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const normalizedRaw = raw.startsWith('http') ? raw : `http://${raw.replace(/^\/+/, '')}`;
// Env bazen http://host bazen http://host/api gelebiliyor; tek noktada normalize et.
const API_BASE = normalizedRaw.replace(/\/$/, '').replace(/\/api$/, '');

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

let onUnauthorized = null;
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

/**
 * API isteği atar; token varsa Authorization header ekler.
 * 401 alındığında kayıtlı onUnauthorized (örn. logout) çağrılır.
 */
export async function apiRequest(path, options = {}) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  let url = path.startsWith('http') ? path : `${API_BASE}${normalizedPath}`;
  // Eski/yanlış env veya path birleşimlerinde oluşan "/api/api" çakışmasını otomatik düzelt.
  url = url.replace(/\/api\/api(?=\/|$)/g, '/api');
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && typeof onUnauthorized === 'function') {
      onUnauthorized();
    }
    const err = new Error(data.message || res.statusText || 'İstek başarısız');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export { API_BASE };
export default { getToken, setToken, apiRequest, API_BASE };
