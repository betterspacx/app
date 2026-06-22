// Created by konlyzx (2026) - Lazy image component for background previews with IntersectionObserver + global cache
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

'use client';

import { useLazyImage } from '@/hooks/useLazyImage';
import { cn } from '@/lib/utils';

interface LazyBackgroundImageProps {
  src: string;
  alt: string;
  className?: string;
  isSelected?: boolean;
}

export function LazyBackgroundImage({ src, alt, className, isSelected }: LazyBackgroundImageProps) {
  const { elementRef, isLoaded, hasError } = useLazyImage({
    src,
    rootMargin: '200px', // Start loading before it enters viewport
  });

  return (
    <div ref={elementRef} className={cn('w-full h-full relative overflow-hidden', className)}>
      {!isLoaded && !hasError && <div className="absolute inset-0 bg-muted animate-pulse" />}
      {isLoaded && !hasError && (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="eager" // Already preloaded by hook, eager avoids double-delay
          decoding="async"
        />
      )}
      {hasError && <div className="absolute inset-0 bg-muted/30" />}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-blue-500 ring-1 ring-blue-500/30 rounded-lg pointer-events-none" />
      )}
    </div>
  );
}
