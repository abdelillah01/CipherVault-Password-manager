import axios from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

/** Pull a human-readable message out of a DRF error response. */
export function errorMessage(err, fallback = 'Something went wrong') {
  const data = err?.response?.data;
  if (!data) return err?.message === 'Network Error' ? 'Cannot reach the server' : fallback;
  if (typeof data === 'string') return fallback;
  if (data.error) return data.error;
  if (data.detail) return data.detail;
  const first = Object.values(data)[0];
  if (Array.isArray(first) && first.length) return first[0];
  return fallback;
}

export default api;
