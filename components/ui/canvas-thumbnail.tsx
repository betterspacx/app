'use client';

import { useRef, useEffect, useState } from 'react';
import { loadImage } from '@/hooks/useLazyImage';
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

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cancelled = false;

    loadImage(src)
      .then((img) => {
        if (cancelled) return;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        ctx.fillStyle = 'hsl(0 0% 20%)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <div className={cn('relative w-full h-full overflow-hidden', className)}>
      {!loaded && <div className="absolute inset-0 bg-muted animate-pulse" />}
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
