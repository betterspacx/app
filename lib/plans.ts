'use client';

import type { Subscription } from '@/lib/supabase/auth-service';

export const PLAN_LIMITS = {
  free: {
    maxProjects: 3,
    maxStorageMB: 50,
    maxExportScale: 2,
    canExportVideo: false,
    hasCloudSync: false,
    hasVersionHistory: false,
    hasCollections: false,
  },
  cloud: {
    maxProjects: -1,
    maxStorageMB: 500,
    maxExportScale: 5,
    canExportVideo: true,
    hasCloudSync: true,
    hasVersionHistory: true,
    hasCollections: true,
  },
} as const;

export type PlanTier = keyof typeof PLAN_LIMITS;

export function getEffectivePlan(subscription: Subscription | null): PlanTier {
  if (!subscription) return 'free';
  if (subscription.plan === 'cloud' && subscription.status === 'active') return 'cloud';
  return 'free';
}

export function isPlan(subscription: Subscription | null, tier: PlanTier): boolean {
  return getEffectivePlan(subscription) === tier;
}

export function isCloud(subscription: Subscription | null): boolean {
  return isPlan(subscription, 'cloud');
}

export function getLimit<K extends keyof (typeof PLAN_LIMITS)['free']>(
  subscription: Subscription | null,
  limit: K
): (typeof PLAN_LIMITS)['free'][K] {
  const plan = getEffectivePlan(subscription);
  return PLAN_LIMITS[plan][limit] as (typeof PLAN_LIMITS)['free'][K];
}

export function hasFeature<K extends keyof (typeof PLAN_LIMITS)['free']>(
  subscription: Subscription | null,
  feature: K
): boolean {
  const plan = getEffectivePlan(subscription);
  if (feature === 'maxProjects') return PLAN_LIMITS[plan].maxProjects === -1 || PLAN_LIMITS[plan].maxProjects > 0;
  if (feature === 'maxStorageMB') return true;
  return PLAN_LIMITS[plan][feature] === true;
}

export const STORAGE_LIMIT_BYTES = {
  free: 50 * 1024 * 1024,
  cloud: 500 * 1024 * 1024,
};
