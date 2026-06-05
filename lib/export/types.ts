// Modified by konlyzx (2026) - Added video export formats (mp4, webm, gif) and video quality descriptions
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

/**
 * Type definitions for export (image + video)
 */

export type ExportFormat = 'png' | 'jpeg' | 'webp' | 'mp4' | 'webm' | 'gif';
export type QualityPreset = 'high' | 'medium' | 'low';

export interface QualitySettings {
  jpeg: number;
  pngCompression: number;
  webp: number;
}

export const QUALITY_PRESETS: Record<QualityPreset, QualitySettings> = {
  high: { jpeg: 85, pngCompression: 6, webp: 82 },
  medium: { jpeg: 75, pngCompression: 9, webp: 72 },
  low: { jpeg: 60, pngCompression: 9, webp: 55 },
};

export const QUALITY_PRESET_LABELS: Record<QualityPreset, { label: string; description: Record<ExportFormat, string> }> = {
  high: {
    label: 'High',
    description: {
      png: 'Best quality, larger file',
      jpeg: '85% quality, sharp & shareable',
      webp: '82% quality, smallest file',
      mp4: '25 Mbps, crisp & smooth',
      webm: '25 Mbps, crisp & smooth',
      gif: 'High color fidelity, larger file',
    },
  },
  medium: {
    label: 'Medium',
    description: {
      png: 'Lossless, better compression',
      jpeg: '75% quality, good compression',
      webp: '72% quality, very small file',
      mp4: '10 Mbps, great balance',
      webm: '10 Mbps, great balance',
      gif: 'Balanced quality & size',
    },
  },
  low: {
    label: 'Low',
    description: {
      png: 'Lossless, max compression',
      jpeg: '60% quality, maximum compression',
      webp: '55% quality, tiny file',
      mp4: '5 Mbps, small file',
      webm: '5 Mbps, small file',
      gif: 'Smallest file, fewer colors',
    },
  },
};

/** Check if a format is a video format */
export function isVideoFormat(format: ExportFormat): boolean {
  return format === 'mp4' || format === 'webm' || format === 'gif';
}
