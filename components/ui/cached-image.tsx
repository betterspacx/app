'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface CachedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * CachedImage component - uses Next.js Image for optimized loading and caching.
 * Handles external images with proper error states.
 */
export function CachedImage({ src, alt, className, loading = 'lazy', onLoad, onError }: CachedImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    // Hide failed images instead of showing "Failed"
    return null;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 20vw, 10vw"
      className={cn('object-cover', className)}
      loading={loading}
      onLoad={onLoad}
      onError={() => {
        // Only log errors in development, not in production
        if (process.env.NODE_ENV === 'development') {
          console.error(`Failed to load image: ${src}`);
        }
        setHasError(true);
        onError?.();
      }}
    />
  );
}
