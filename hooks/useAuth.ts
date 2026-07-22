'use client';

import { useState, useEffect, useCallback } from 'react';

interface AuthState {
  authenticated: boolean;
  loading: boolean;
}

export function useAuth(): AuthState & { getCurrentUser: () => Promise<{ uid: string } | null> } {
  const [state, setState] = useState<AuthState>({ authenticated: false, loading: true });

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    async function init() {
      try {
        const { onAuthStateChanged } = await import('firebase/auth');
        const { auth } = await import('@/lib/firebase');

        unsubscribe = onAuthStateChanged(auth, (user) => {
          if (!cancelled) {
            setState({ authenticated: !!user, loading: false });
          }
        });
      } catch {
        if (!cancelled) {
          setState({ authenticated: false, loading: false });
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const getCurrentUser = useCallback(async () => {
    try {
      const { auth } = await import('@/lib/firebase');
      return auth.currentUser;
    } catch {
      return null;
    }
  }, []);

  return { ...state, getCurrentUser };
}
