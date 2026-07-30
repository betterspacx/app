'use client';

const CACHE_NAME = 'betterflow-backgrounds-v1';
const CACHE_META_KEY = 'betterflow-bg-meta';
const BATCH_SIZE = 4;

interface BackgroundMeta {
  urls: string[];
  cachedAt: number;
}

export async function getCachedImage(src: string): Promise<Blob | null> {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(src);
    if (!response) return null;
    return await response.blob();
  } catch {
    return null;
  }
}

export function getObjectURL(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export async function cacheImage(src: string): Promise<void> {
  try {
    const cache = await caches.open(CACHE_NAME);
    const existing = await cache.match(src);
    if (existing) return;

    const response = await fetch(src, { cache: 'force-cache' });
    if (response.ok) {
      await cache.put(src, response);
    }
  } catch {
    // ignore
  }
}

export async function batchCacheImages(urls: string[]): Promise<void> {
  const uncached: string[] = [];
  try {
    const cache = await caches.open(CACHE_NAME);
    for (const url of urls) {
      const existing = await cache.match(url);
      if (!existing) uncached.push(url);
    }
  } catch {
    return;
  }

  if (uncached.length === 0) return;

  let index = 0;
  function loadNext() {
    const batch = uncached.slice(index, index + BATCH_SIZE);
    index += BATCH_SIZE;
    batch.forEach(cacheImage);
    if (index < uncached.length) {
      setTimeout(loadNext, 100);
    }
  }
  loadNext();
}

export function scheduleBgPreload(allUrls: string[]): void {
  if (typeof window === 'undefined') return;

  if ('requestIdleCallback' in window) {
    requestIdleCallback(
      () => {
        batchCacheImages(allUrls);
      },
      { timeout: 5000 }
    );
  } else {
    setTimeout(() => batchCacheImages(allUrls), 3000);
  }
}

export async function getCachedImageAsImageElement(src: string): Promise<HTMLImageElement | null> {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(src);
    if (!response) return null;

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  } catch {
    return null;
  }
}
