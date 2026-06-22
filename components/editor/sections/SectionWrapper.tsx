// Modified by konlyzx (2026) - Enhanced section header styling with cleaner aesthetic
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

'use client';

import * as React from 'react';
import { ArrowDown01Icon } from 'hugeicons-react';
import { cn } from '@/lib/utils';

interface SectionWrapperProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  action?: React.ReactNode;
}

export function SectionWrapper({ title, children, defaultOpen = true, className, action }: SectionWrapperProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className={cn('mb-1', className)}>
      <div
        className="w-full flex items-center justify-between gap-2 py-2.5 px-2 hover:bg-muted/30 rounded-xl transition-colors group cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 flex-1">
          <ArrowDown01Icon
            size={14}
            className={cn('text-muted-foreground/70 transition-transform duration-200', !isOpen && '-rotate-90')}
          />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80 group-hover:text-foreground">
            {title}
          </span>
        </div>
        {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
      </div>

      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-2 pb-4 space-y-4">{children}</div>
      </div>
    </div>
  );
}
