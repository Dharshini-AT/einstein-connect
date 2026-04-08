// Central API utility — reads VITE_API_URL from .env, defaults to localhost for dev
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  post: async (path: string, body: object) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },
  get: async (path: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },
  patch: async (path: string, body: object) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },
  delete: async (path: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },
};
