'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { getSubscription, Subscription } from '@/lib/supabase/auth-service';
import { getEffectivePlan, getLimit } from '@/lib/plans';
import { getStorageQuota } from '@/lib/storage-service';
import { formatBytes } from '@/lib/draft-storage';
import { cn } from '@/lib/utils';
import { Folder01Icon } from 'hugeicons-react';

interface CloudUsagePanelProps {
  projectCount: number;
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function CloudUsagePanel({ projectCount }: CloudUsagePanelProps) {
  const [sub, setSub] = React.useState<Subscription | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [quota, setQuota] = React.useState<{ used: number; limit: number } | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = await getSubscription();
      if (cancelled) return;
      setSub(s);
      setLoading(false);
      if (s && getEffectivePlan(s) === 'cloud') {
        const q = await getStorageQuota();
        if (!cancelled) setQuota(q);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const plan = getEffectivePlan(sub);
  const isCloud = plan === 'cloud';
  const maxProjects = getLimit(sub, 'maxProjects');

  return (
    <div className="px-4 pt-3 pb-2 border-b border-white/5">
      {loading ? (
        <div className="flex items-center gap-2 py-1">
          <div className="w-3 h-3 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          <span className="text-xs text-white/40">Loading plan...</span>
        </div>
      ) : isCloud ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs font-semibold text-white/80">Cloud Plan</span>
            </div>
            <span className="text-xs text-white/40">Active</span>
          </div>

          {quota && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/50">Storage</span>
                <span className="text-white/50">{formatBytes(quota.used)} / {formatBytes(quota.limit)}</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((quota.used / quota.limit) * 100, 100)}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={cn('h-full rounded-full', quota.used / quota.limit > 0.8 ? 'bg-amber-500' : 'bg-white/40')}
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            {['Cloud Sync', 'Version History', 'Collections & Folders'].map((label) => (
              <div key={label} className="flex items-center gap-2 text-xs text-white/50">
                <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center">
                  <CheckIcon className="w-2.5 h-2.5 text-white/70" />
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-zinc-500" />
              <span className="text-xs font-semibold text-white/80">Free Plan</span>
            </div>
            <span className="text-xs text-white/40">Local only</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-white/50">
            <Folder01Icon size={14} />
            <span>{projectCount} / {(maxProjects as number) === -1 ? '∞' : String(maxProjects)} projects</span>
          </div>

          {(maxProjects as number) > 0 && projectCount >= (maxProjects as number) && (
            <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
              Project limit reached. Upgrade to Cloud for unlimited projects.
            </div>
          )}

          <a href="/checkout"
            className="block w-full py-2 rounded-lg text-center text-xs font-semibold text-white bg-white/10 hover:bg-white/15 transition-all">
            Upgrade to Cloud
          </a>
        </div>
      )}
    </div>
  );
}
