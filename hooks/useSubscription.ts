'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getSubscription, type Subscription } from '@/lib/supabase/auth-service';
import { getEffectivePlan, isCloud, getLimit, hasFeature, type PlanTier } from '@/lib/plans';

export function useSubscription() {
  const { authenticated, loading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

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
  }, [authenticated]);

  const plan: PlanTier = getEffectivePlan(subscription);

  return {
    subscription,
    plan,
    loading: loading || authLoading,
    isCloud: isCloud(subscription),
    isFree: plan === 'free',
    getLimit: <K extends keyof ReturnType<typeof getLimit>>(key: K) => getLimit(subscription, key),
    hasFeature: <K extends Parameters<typeof hasFeature>[1]>(key: K) => hasFeature(subscription, key),
    refresh: () => getSubscription().then(setSubscription),
  };
}
