/**
 * Cloudflare R2 Storage Utilities
 *
 * Modified by konlyzx (2026) - Added R2 bucket binding interfaces, presigned URL generation,
 * and CRUD operations for serverless storage with MY_BUCKET binding
 * Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)
 *
 * R2 is S3-compatible object storage configured via Cloudflare bindings.
 * For serverless deployment, we use the MY_BUCKET binding from wrangler.toml.
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * R2 bucket binding type from Cloudflare Workers
 */
export interface R2Bucket {
  put: (key: string, value: ReadableStream | ArrayBuffer | ArrayBufferView | string, options?: R2PutOptions) => Promise<R2Object>;
  get: (key: string) => Promise<R2Object | null>;
  delete: (key: string) => Promise<void>;
  list: (options?: R2ListOptions) => R2Objects;
}

export interface R2PutOptions {
  httpMetadata?: Headers;
  customMetadata?: Record<string, string>;
}

export interface R2Object {
  writeHttpMetadata: (metadata: Headers) => void;
  httpMetadata: Headers;
  customMetadata: Record<string, string>;
  size: number;
}

export interface R2ListOptions {
  limit?: number;
  cursor?: string;
  prefix?: string;
}

export interface R2Objects {
  objects: Array<{
    key: string;
    size: number;
    uploaded: Date;
  }>;
  truncated: boolean;
  cursor?: string;
}

/**
 * Get the public URL for an R2 object.
 * Uses a same-origin proxy path (/backgrounds/...) to avoid CORS issues
 * during canvas capture (e.g. video export with domToCanvas).
 * The Next.js rewrite in next.config.ts proxies these to the actual R2 URL.
 *
 * @param path - The object path/key in the bucket (e.g., "uploads/image.jpg")
 * @returns The proxied URL path
 */
export function getR2PublicUrl(path: string): string {
  const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

  if (!publicUrl) {
    console.warn('R2_PUBLIC_URL not configured. Using path as-is.');
    return path;
  }

  // Remove leading slash from path if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // Use same-origin proxy to avoid CORS issues with canvas capture
  return `/backgrounds/${cleanPath}`;
}

/**
 * Get an optimized image URL from R2
 * Since R2 doesn't have built-in image transformations like Cloudinary,
 * we return the original image URL. For optimization, consider using
 * Cloudflare Images or a custom Worker with image resizing.
 *
 * @param options - Image options
 * @returns The image URL
 */
export function getR2ImageUrl(options: {
  src: string;
  width?: number;
  height?: number;
  quality?: number | 'auto';
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
}): string {
  const { src } = options;

  // If it's already a full URL, return as-is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // If it's a blob URL or data URL, return as-is
  if (src.startsWith('blob:') || src.startsWith('data:')) {
    return src;
  }

  // Otherwise, construct the R2 public URL
  return getR2PublicUrl(src);
}

/**
 * Generate a presigned URL for direct upload to R2.
 * This allows clients to upload directly to R2 without going through your server.
 *
 * @param bucket - The R2 bucket binding (MY_BUCKET)
 * @param path - The object path/key in the bucket (e.g., "uploads/filename.jpg")
 * @param expiresIn - URL expiration time in seconds (default: 60)
 * @returns The presigned URL for PUT request
 */
export async function getPresignedUrl(
  bucket: R2Bucket,
  path: string,
  expiresIn: number = 60
): Promise<string> {
  // For Cloudflare Workers with R2 binding, we use the S3 SDK with the binding
  // The binding provides the credentials automatically
  const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
  });

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME || 'betterflow-storage',
    Key: path,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Upload a file to R2 using the bucket binding.
 *
 * @param bucket - The R2 bucket binding (MY_BUCKET)
 * @param path - The object path/key in the bucket
 * @param data - The file data (ReadableStream, ArrayBuffer, or string)
 * @param options - Optional metadata
 * @returns The uploaded R2 object
 */
export async function uploadToR2(
  bucket: R2Bucket,
  path: string,
  data: ReadableStream | ArrayBuffer | ArrayBufferView | string,
  options?: R2PutOptions
): Promise<R2Object> {
  return bucket.put(path, data, options);
}

/**
 * Download a file from R2 using the bucket binding.
 *
 * @param bucket - The R2 bucket binding (MY_BUCKET)
 * @param path - The object path/key in the bucket
 * @returns The R2 object or null if not found
 */
export async function downloadFromR2(
  bucket: R2Bucket,
  path: string
): Promise<R2Object | null> {
  return bucket.get(path);
}

/**
 * Delete a file from R2 using the bucket binding.
 *
 * @param bucket - The R2 bucket binding (MY_BUCKET)
 * @param path - The object path/key in the bucket
 */
export async function deleteFromR2(
  bucket: R2Bucket,
  path: string
): Promise<void> {
  return bucket.delete(path);
}

/**
 * Check if R2 is properly configured
 */
export function isR2Configured(): boolean {
  return !!process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
}
