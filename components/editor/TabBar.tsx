'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem<T extends string> {
  id: T;
  icon: React.ReactNode;
  label: string;
}

interface TabBarProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
  className?: string;
}

export function TabBar<T extends string>({ tabs, activeTab, onTabChange, className }: TabBarProps<T>) {
  return (
    <div className={cn('px-2.5 py-2.5 border-b border-white/10 shrink-0', className)}>
      <div className="flex gap-1 p-0.5 bg-[#2c2c2e]/50 rounded-lg border border-white/10">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex items-center justify-center py-2 px-2 rounded-md cursor-pointer',
                'transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]',
                isActive ? 'bg-[#3a3a3c] text-white flex-[1.8] shadow-sm' : 'text-white/40 hover:text-white/70 flex-1'
              )}
            >
              <span className="shrink-0">{tab.icon}</span>
              <span
                className={cn(
                  'text-[11px] font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]',
                  isActive ? 'max-w-[60px] opacity-100 ml-1.5' : 'max-w-0 opacity-0 ml-0'
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function useTabTransition<T extends string>(activeTab: T) {
  const [contentKey, setContentKey] = React.useState<T>(activeTab);
  const [transitioning, setTransitioning] = React.useState(false);

  React.useEffect(() => {
    if (activeTab !== contentKey) {
      setTransitioning(true);
      const timeout = setTimeout(() => {
        setContentKey(activeTab);
        setTransitioning(false);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [activeTab, contentKey]);

  return { contentKey, transitioning };
}
