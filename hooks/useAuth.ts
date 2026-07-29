'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

interface AuthState {
  authenticated: boolean;
  loading: boolean;
  userId: string | null;
}

export function useAuth(): AuthState & { getCurrentUser: () => Promise<{ id: string } | null> } {
  const [state, setState] = useState<AuthState>({ authenticated: false, loading: true, userId: null });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setState({
        authenticated: !!session?.user,
        loading: false,
        userId: session?.user?.id ?? null,
      });
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        authenticated: !!session?.user,
        loading: false,
        userId: session?.user?.id ?? null,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const getCurrentUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    return { id: session.user.id };
  }, []);

  return { ...state, getCurrentUser };
}
