'use client';

import { useRef, useEffect, useState } from 'react';
import { loadImage, imageCache, loadingPromises } from '@/hooks/useLazyImage';
import { getCachedImageAsImageElement } from '@/lib/background-cache';
import { cn } from '@/lib/utils';

interface CanvasThumbnailProps {
  src: string;
  className?: string;
  isSelected?: boolean;
}

export function CanvasThumbnail({ src, className, isSelected }: CanvasThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let objectUrl: string | null = null;

    async function draw() {
      const cvs = canvas as HTMLCanvasElement;
      const ctx = cvs.getContext('2d')!;

      // 1. In-memory cache (instant, sync)
      const mem = imageCache.get(src);
      if (mem) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        ctx.drawImage(mem, 0, 0, cvs.width, cvs.height);
        setLoaded(true);
        return;
      }

      // 2. Try Cache API first (fast, persistent)
      const persistent = await getCachedImageAsImageElement(src);
      if (cancelled) return;

      if (persistent) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        ctx.drawImage(persistent, 0, 0, cvs.width, cvs.height);
        if (persistent.src.startsWith('blob:')) {
          objectUrl = persistent.src;
        }
        imageCache.set(src, persistent);
        setLoaded(true);
        return;
      }

      // 3. Fetch from network (reuses loadingPromises if preloading is active)
      try {
        const img = await loadImage(src);
        if (cancelled || !img) return;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
        setLoaded(true);
      } catch {
        if (!cancelled) {
          ctx.fillStyle = 'hsl(0 0% 20%)';
          ctx.fillRect(0, 0, cvs.width, cvs.height);
          setLoaded(true);
        }
      }
    }

    draw();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  return (
    <div className={cn('relative w-full h-full overflow-hidden', className)}>
      {!loaded && <div className="absolute inset-0 bg-white/5 animate-pulse" />}
      <canvas
        ref={canvasRef}
        width={160}
        height={160}
        className={cn('w-full h-full', loaded ? 'opacity-100' : 'opacity-0')}
      />
      {isSelected && <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none" />}
    </div>
  );
}
