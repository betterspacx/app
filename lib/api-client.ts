'use client';

import { supabase } from './supabase/client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function handleResponse<T>(res: Response): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const json = await res.json();
    if (!res.ok) return { ok: false, error: json.error || `HTTP ${res.status}` };
    return json;
  } catch {
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return { ok: true };
  }
}

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export const api = {
  async get<T>(path: string): Promise<{ ok: boolean; data?: T; error?: string }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}${path}`, { headers });
    return handleResponse<T>(res);
  },

  async post<T>(path: string, body?: unknown): Promise<{ ok: boolean; data?: T; error?: string }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  },

  async put<T>(path: string, body?: unknown): Promise<{ ok: boolean; data?: T; error?: string }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  },

  async delete<T>(path: string): Promise<{ ok: boolean; data?: T; error?: string }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}${path}`, { method: 'DELETE', headers });
    return handleResponse<T>(res);
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) return null;
    return data.session;
  },

  async getCurrentUserId(): Promise<string | null> {
    return getAccessToken();
  },
};
