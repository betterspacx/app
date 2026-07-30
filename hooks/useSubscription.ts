'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getSubscription, clearAuthCache, type Subscription } from '@/lib/supabase/auth-service';
import { getEffectivePlan, isCloud, getLimit, hasFeature, PLAN_LIMITS, type PlanTier } from '@/lib/plans';

export function useSubscription() {
  const { authenticated, loading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!authenticated) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const onSuccess = () => {
      clearAuthCache();
      setRefreshKey((k) => k + 1);
    };

    window.addEventListener('checkout-success', onSuccess);
    return () => window.removeEventListener('checkout-success', onSuccess);
  }, [authenticated]);

  useEffect(() => {
    if (!authenticated) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    getSubscription().then((sub) => {
      setSubscription(sub);
      setLoading(false);
    });
  }, [authenticated, refreshKey]);

  const plan: PlanTier = getEffectivePlan(subscription);

  return {
    subscription,
    plan,
    loading: loading || authLoading,
    isCloud: isCloud(subscription),
    isFree: plan === 'free',
    getLimit: <K extends keyof typeof PLAN_LIMITS.free>(key: K) => getLimit(subscription, key),
    hasFeature: <K extends Parameters<typeof hasFeature>[1]>(key: K) => hasFeature(subscription, key),
    refresh: () => getSubscription().then(setSubscription),
  };
}
