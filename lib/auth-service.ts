'use client';

import {
  signInWithEmailAndPassword as fbSignIn,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GithubAuthProvider,
  signOut as fbSignOut,
  updateProfile as fbUpdateProfile,
  User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { storageService } from '@/lib/storage-service';

export interface UserProfile {
  uid: string;
  username: string;
  provider: 'github' | 'email';
  createdAt: string;
  cloudStorageEnabled: true;
}

export type AuthResult = { ok: true; user: User; profile: UserProfile } | { ok: false; error: string };

function profileKey(uid: string): string {
  return `users/${uid}/profile.json`;
}

export async function signInWithGithub(): Promise<AuthResult> {
  try {
    const provider = new GithubAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const profile = await getUserProfile(result.user.uid);
    return { ok: true, user: result.user, profile: profile! };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('auth/popup-closed-by-user') || msg.includes('auth/cancelled-popup-request')) {
      return { ok: false, error: '' };
    }
    return { ok: false, error: 'Failed to sign in with GitHub' };
  }
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  try {
    const result = await fbSignIn(auth, email, password);
    const profile = await getUserProfile(result.user.uid);
    return { ok: true, user: result.user, profile: profile! };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('auth/invalid-credential') || msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password')) {
      return { ok: false, error: 'Invalid email or password' };
    }
    return { ok: false, error: msg.replace('Firebase: ', '').replace(/\(.*\).*$/, '').trim() || 'Authentication failed' };
  }
}

export async function signUpWithEmail(email: string, password: string, name?: string): Promise<AuthResult> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (name) await fbUpdateProfile(result.user, { displayName: name });
    const profile = await getUserProfile(result.user.uid);
    return { ok: true, user: result.user, profile: profile! };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('auth/email-already-in-use')) return { ok: false, error: 'Email already in use' };
    if (msg.includes('auth/weak-password')) return { ok: false, error: 'Password must be at least 6 characters' };
    return { ok: false, error: msg.replace('Firebase: ', '').replace(/\(.*\).*$/, '').trim() || 'Registration failed' };
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const raw = await storageService.read(profileKey(uid));
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await storageService.write(profileKey(profile.uid), JSON.stringify(profile), 'application/json');
}

export async function updateUsername(uid: string, username: string): Promise<void> {
  const profile = await getUserProfile(uid);
  if (!profile) throw new Error('Profile not found');
  const updated = { ...profile, username };
  await saveUserProfile(updated);
}

export async function signOut(): Promise<void> {
  await fbSignOut(auth);
}
