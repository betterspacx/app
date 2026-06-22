// Modified by konlyzx (2026) - Changed background to bg-white to match EditorHeader; added video formats (MP4, WebM, GIF) when animations exist
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

/**
 * Format selector with expanding pill animation.
 * Selected tab expands to show full label; unselected tabs show short label.
 * Shows video formats when animations exist, image formats otherwise.
 */

import { cn } from '@/lib/utils';
import type { ExportFormat } from '@/lib/export/types';
import { isVideoFormat } from '@/lib/export/types';

interface FormatSelectorProps {
  format: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
  hasAnimation?: boolean;
}

const IMAGE_FORMATS: { value: ExportFormat; short: string; full: string; description: string }[] = [
  { value: 'jpeg', short: 'JPG', full: 'JPEG', description: 'Smaller files, great for sharing' },
  { value: 'png', short: 'PNG', full: 'PNG', description: 'Lossless, supports transparency' },
  { value: 'webp', short: 'WebP', full: 'WebP', description: 'Best compression, small & sharp' },
];

const VIDEO_FORMATS: { value: ExportFormat; short: string; full: string; description: string }[] = [
  { value: 'mp4', short: 'MP4', full: 'MP4', description: 'Best compatibility, H.264 encoded' },
  { value: 'webm', short: 'WebM', full: 'WebM', description: 'Open format, web-optimized' },
  { value: 'gif', short: 'GIF', full: 'GIF', description: 'Animated image, widely supported' },
];

export function FormatSelector({ format, onFormatChange, hasAnimation = false }: FormatSelectorProps) {
  const formats = hasAnimation ? VIDEO_FORMATS : IMAGE_FORMATS;

  // If current format doesn't belong to the active set, switch to the first available
  const currentInSet = formats.some((f) => f.value === format);
  const displayFormat = currentInSet ? format : formats[0].value;

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">Format</label>
      <div className="flex gap-1.5 p-1 bg-white rounded-xl">
        {formats.map((f) => {
          const isSelected = f.value === displayFormat;
          return (
            <button
              key={f.value}
              onClick={() => onFormatChange(f.value)}
              className={cn(
                'relative flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium cursor-pointer',
                'transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                isSelected
                  ? 'bg-muted/50 text-foreground flex-[1.8] shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30 flex-1'
              )}
            >
              <span
                className={cn(
                  'transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]',
                  isSelected ? 'text-sm' : 'text-xs'
                )}
              >
                {isSelected ? f.full : f.short}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">{formats.find((f) => f.value === displayFormat)?.description}</p>
    </div>
  );
}
