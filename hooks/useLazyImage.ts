// Created by konlyzx (2026) - Hook for lazy image loading with global in-memory cache
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

import { useState, useEffect, useRef, useCallback } from 'react';

// Global in-memory cache for images so they survive tab switches
const imageCache = new Map<string, HTMLImageElement>();
const loadingPromises = new Map<string, Promise<HTMLImageElement>>();

export function loadImage(src: string): Promise<HTMLImageElement> {
  // Return cached promise if already loading
  if (loadingPromises.has(src)) {
    return loadingPromises.get(src)!;
  }

  // Return cached image if already loaded
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!);
  }

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(src, img);
      loadingPromises.delete(src);
      resolve(img);
    };
    img.onerror = () => {
      loadingPromises.delete(src);
      reject(new Error(`Failed to load: ${src}`));
    };
    img.src = src;
  });

  loadingPromises.set(src, promise);
  return promise;
}

interface UseLazyImageOptions {
  src: string;
  enabled?: boolean;
  rootMargin?: string;
}

export function useLazyImage({ src, enabled = true, rootMargin = '100px' }: UseLazyImageOptions) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  // Check if already cached
  const isCached = imageCache.has(src);

  // Intersection Observer - only start loading when near viewport
  useEffect(() => {
    if (!enabled) return;
    if (isCached) {
      setIsVisible(true);
      setIsLoaded(true);
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [src, enabled, rootMargin, isCached]);

  // Load image when visible
  useEffect(() => {
    if (!isVisible || !src) return;

    if (isCached) {
      setIsLoaded(true);
      setHasError(false);
      return;
    }

    let cancelled = false;

    loadImage(src)
      .then(() => {
        if (!cancelled) {
          setIsLoaded(true);
          setHasError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHasError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isVisible, src, isCached]);

  const retry = useCallback(() => {
    setHasError(false);
    setIsLoaded(false);
    // Force reload by removing from cache
    imageCache.delete(src);
    loadingPromises.delete(src);
    setIsVisible(true);
  }, [src]);

  return {
    elementRef,
    isVisible,
    isLoaded,
    hasError,
    isCached,
    retry,
  };
}

// Preload images into cache in small batches, yielding between batches
// so the main thread stays responsive for visible thumbnails.
export function preloadImages(srcs: string[], batchSize = 6): void {
  const remaining = srcs.filter((src) => !imageCache.has(src) && !loadingPromises.has(src));
  let index = 0;

  function loadNextBatch() {
    const batch = remaining.slice(index, index + batchSize);
    index += batchSize;
    batch.forEach((src) => {
      loadImage(src).catch(() => {});
    });
    if (index < remaining.length) {
      setTimeout(loadNextBatch, 50);
    }
  }

  // Start first batch on microtask to let current render cycle finish
  queueMicrotask(loadNextBatch);
}

// Clear cache if needed (e.g., for memory management)
export function clearImageCache(): void {
  imageCache.clear();
  loadingPromises.clear();
}
