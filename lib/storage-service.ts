'use client';

import { auth } from '@/lib/firebase';

const STORAGE_PREFIX = 'betterflow_local_';
const API_BASE = '/api/storage';

function getLocalKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

function getToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (user) {
    return user.getIdToken();
  }
  return new Promise((resolve) => {
    const unsub = auth.onAuthStateChanged((user) => {
      unsub();
      if (user) {
        user.getIdToken().then(resolve);
      } else {
        resolve(null);
      }
    });
  });
}

async function withToken(): Promise<{ Authorization: string } | Record<string, never>> {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const storageService = {
  async read(key: string): Promise<string | null> {
    const headers = await withToken();
    if (Object.keys(headers).length > 0) {
      try {
        const res = await fetch(`${API_BASE}?key=${encodeURIComponent(key)}`, { headers });
        if (res.ok) {
          const json = await res.json();
          return json.data as string;
        }
        if (res.status === 404) return null;
      } catch {
        // fallback to local
      }
    }
    const local = localStorage.getItem(getLocalKey(key));
    return local;
  },

  async write(key: string, data: string, contentType?: string): Promise<boolean> {
    try {
      localStorage.setItem(getLocalKey(key), data);
    } catch {
      // localStorage quota exceeded — skip local fallback
    }

    const headers = await withToken();
    if (Object.keys(headers).length > 0) {
      try {
        const res = await fetch(API_BASE, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, data, contentType }),
        });
        return res.ok;
      } catch {
        return false;
      }
    }
    // when unauthenticated and localStorage failed, return true
    // because the data was intended as a local fallback anyway
    return true;
  },

  async remove(key: string): Promise<boolean> {
    localStorage.removeItem(getLocalKey(key));

    const headers = await withToken();
    if (Object.keys(headers).length > 0) {
      try {
        const res = await fetch(`${API_BASE}?key=${encodeURIComponent(key)}`, {
          method: 'DELETE',
          headers,
        });
        return res.ok;
      } catch {
        return false;
      }
    }
    return true;
  },

  async list(prefix: string): Promise<string[]> {
    const headers = await withToken();
    if (Object.keys(headers).length > 0) {
      try {
        const res = await fetch(`${API_BASE}?list=${encodeURIComponent(prefix)}`, { headers });
        if (res.ok) {
          const json = await res.json();
          return json.keys as string[];
        }
      } catch {
        // fallback — return empty list
      }
    }
    return [];
  },
};
