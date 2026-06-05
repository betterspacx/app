// Created by konlyzx (2026) - Screenshot caching utilities using Cloudflare R2 for storing and retrieving website screenshots
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

import { R2Bucket, downloadFromR2, uploadToR2, deleteFromR2 } from './r2';

const SCREENSHOT_CACHE_PREFIX = 'screenshots/';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Get the R2 bucket binding from the environment
 */
function getBucket(): R2Bucket | null {
  const bucket = (process.env as unknown as { MY_BUCKET?: R2Bucket }).MY_BUCKET;
  return bucket || null;
}

/**
 * Normalize a URL for consistent cache keys
 * Removes trailing slashes, fragments, and normalizes the URL
 */
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove fragment
    urlObj.hash = '';
    // Remove trailing slash from pathname
    let pathname = urlObj.pathname;
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }
    urlObj.pathname = pathname;
    return urlObj.toString().toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

/**
 * Generate a cache key for a screenshot
 */
function generateCacheKey(normalizedUrl: string, deviceType: string): string {
  // Create a simple hash from the URL for the filename
  const urlHash = Buffer.from(normalizedUrl).toString('base64url');
  return `${SCREENSHOT_CACHE_PREFIX}${urlHash}:${deviceType}.png`;
}

/**
 * Get a cached screenshot from R2
 * @param cacheKey - The cache key (format: "url:deviceType")
 * @returns The base64-encoded screenshot or null if not found
 */
export async function getCachedScreenshot(cacheKey: string): Promise<string | null> {
  const bucket = getBucket();
  if (!bucket) {
    return null;
  }

  try {
    const [normalizedUrl, deviceType] = cacheKey.split(':');
    if (!normalizedUrl || !deviceType) {
      return null;
    }

    const r2Key = generateCacheKey(normalizedUrl, deviceType);
    const object = await downloadFromR2(bucket, r2Key);

    if (!object) {
      return null;
    }

    // Check if cache is expired
    const uploaded = (object as unknown as { uploaded?: Date }).uploaded;
    if (uploaded) {
      const age = Date.now() - uploaded.getTime();
      if (age > CACHE_TTL_MS) {
        // Cache expired, delete it
        await deleteFromR2(bucket, r2Key);
        return null;
      }
    }

    // Read the object body and convert to base64
    const body = (object as unknown as { body?: ReadableStream }).body;
    if (!body) {
      return null;
    }

    const reader = body.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    // Combine chunks
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }

    // Convert to base64
    return Buffer.from(combined).toString('base64');
  } catch (error) {
    console.warn('Error retrieving cached screenshot:', error);
    return null;
  }
}

/**
 * Cache a screenshot in R2
 * @param cacheKey - The cache key (format: "url:deviceType")
 * @param screenshot - The base64-encoded screenshot
 */
export async function cacheScreenshot(cacheKey: string, screenshot: string): Promise<void> {
  const bucket = getBucket();
  if (!bucket) {
    return;
  }

  try {
    const [normalizedUrl, deviceType] = cacheKey.split(':');
    if (!normalizedUrl || !deviceType) {
      return;
    }

    const r2Key = generateCacheKey(normalizedUrl, deviceType);

    // Convert base64 to buffer
    const buffer = Buffer.from(screenshot, 'base64');

    await uploadToR2(bucket, r2Key, buffer, {
      httpMetadata: new Headers({
        'Content-Type': 'image/png',
        'Cache-Control': `max-age=${CACHE_TTL_MS / 1000}`,
      }),
      customMetadata: {
        url: normalizedUrl,
        deviceType,
        cachedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.warn('Error caching screenshot:', error);
  }
}

/**
 * Invalidate cache entries for a URL
 * @param url - The URL to invalidate (will be normalized)
 */
export async function invalidateCache(url: string): Promise<void> {
  const bucket = getBucket();
  if (!bucket) {
    return;
  }

  try {
    const normalizedUrl = normalizeUrl(url);

    // Delete both desktop and mobile cache entries
    const desktopKey = generateCacheKey(normalizedUrl, 'desktop');
    const mobileKey = generateCacheKey(normalizedUrl, 'mobile');

    await Promise.all([
      deleteFromR2(bucket, desktopKey).catch(() => {}),
      deleteFromR2(bucket, mobileKey).catch(() => {}),
    ]);
  } catch (error) {
    console.warn('Error invalidating screenshot cache:', error);
  }
}
