const API_URL = (import.meta.env.VITE_API_URL || '').trim() || 'http://localhost:5000';

export function getApiUrl(path) {
  if (!path) return API_URL;
  return `${API_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

export function getAuthHeaders() {
  const token = localStorage.getItem('pp_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
