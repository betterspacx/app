'use client';

import { supabase } from '@/lib/supabase/client';
import { getSubscription } from '@/lib/supabase/auth-service';
import { STORAGE_LIMIT_BYTES, getEffectivePlan } from '@/lib/plans';

const STORAGE_PREFIX = 'betterflow_local_';
const API_BASE = '/api/storage';

function getLocalKey(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

async function getToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function withToken(): Promise<{ Authorization: string } | Record<string, never>> {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getStorageQuota(): Promise<{ used: number; limit: number }> {
  const sub = await getSubscription();
  const plan = getEffectivePlan(sub);
  const limit = STORAGE_LIMIT_BYTES[plan];
  let used = 0;

  // Measure all relevant localStorage items (cache + stored data)
  const prefixes = ['betterflow_projects_cache_', 'betterflow_collections_cache', 'betterflow_local_', 'betterflow_draft_'];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (prefixes.some((p) => key.startsWith(p))) {
      const raw = localStorage.getItem(key);
      if (raw) used += new Blob([raw]).size;
    }
  }

  return { used, limit };
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
      // localStorage quota exceeded
    }

    const headers = await withToken();
    if (Object.keys(headers).length > 0) {
      const quota = await getStorageQuota();
      const size = new Blob([data]).size;
      if (quota.used + size > quota.limit) {
        console.warn(`Storage quota exceeded (${quota.used}/${quota.limit} bytes)`);
        return false;
      }
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
        // fallback
      }
    }
    return [];
  },
};
