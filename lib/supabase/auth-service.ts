'use client';

import { supabase } from './client';
import { api } from '@/lib/api-client';

const CLOUD_PRICE_ID = process.env.NEXT_PUBLIC_POLAR_CLOUD_PRICE_ID || '';

export interface UserProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  username: string | null;
  photo_url: string | null;
  provider: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  polar_subscription_id: string | null;
  polar_customer_id: string | null;
  plan: 'free' | 'cloud';
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing';
  current_period_start: string | null;
  current_period_end: string | null;
}

export type AuthResult =
  | { ok: true; user: { id: string; email: string | null | undefined } }
  | { ok: false; error: string };

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { ok: false, error: 'Invalid email or password' };
  }
  return { ok: true, user: { id: data.user.id, email: data.user.email } };
}

export async function signUpWithEmail(email: string, password: string, displayName?: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: displayName ? { display_name: displayName } : undefined,
    },
  });
  if (error) {
    if (error.message.includes('already registered')) {
      return { ok: false, error: 'Email already in use' };
    }
    if (error.message.includes('weak')) {
      return { ok: false, error: 'Password must be at least 6 characters' };
    }
    return { ok: false, error: error.message };
  }
  return { ok: true, user: { id: data.user!.id, email: data.user!.email } };
}

export async function signInWithGithub(redirect?: string): Promise<AuthResult> {
  const callbackUrl = redirect
    ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`
    : `${window.location.origin}/auth/callback`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo: callbackUrl },
  });
  if (error) {
    if (error.message.includes('popup')) {
      return { ok: false, error: '' };
    }
    return { ok: false, error: 'Failed to sign in with GitHub' };
  }
  if (!data.url) {
    return { ok: false, error: 'Failed to start GitHub sign in' };
  }
  window.location.href = data.url;
  return { ok: true, user: { id: '', email: '' } };
}

export async function signOut(): Promise<void> {
  cachedSub = null;
  await supabase.auth.signOut();
}

export async function sendPasswordReset(email: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login?reset=true`,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function getProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return data as UserProfile | null;
}

export async function updateProfile(updates: Partial<Pick<UserProfile, 'display_name' | 'username' | 'photo_url'>>): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', user.id)
    .select()
    .single();

  return data as UserProfile | null;
}

let cachedSub: { sub: Subscription | null; time: number } | null = null;
const SUB_TTL = 60_000;

export async function getSubscription(): Promise<Subscription | null> {
  if (cachedSub && Date.now() - cachedSub.time < SUB_TTL) return cachedSub.sub;

  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return null;

  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  const sub = data as Subscription | null;
  cachedSub = { sub, time: Date.now() };
  return sub;
}

export function clearAuthCache(): void {
  cachedSub = null;
}

export async function createCheckout(plan: 'cloud', dev?: boolean): Promise<{ url: string } | null> {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;
  const email = session.data.session?.user?.email;

  const params = new URLSearchParams();
  if (dev) {
    params.set('dev', 'true');
    if (token) params.set('token', token);
  } else {
    params.set('products', CLOUD_PRICE_ID);
    if (email) params.set('customerEmail', email);
    if (token) params.set('metadata', JSON.stringify({ user_id: session.data.session!.user.id }));
  }

  const checkoutUrl = `/api/checkout?${params.toString()}`;
  return { url: checkoutUrl };
}

export async function getCustomerPortalUrl(): Promise<string | null> {
  const result = await api.get<{ url: string }>('/api/user/portal');
  if (!result.ok || !result.data) return null;
  return result.data.url;
}
