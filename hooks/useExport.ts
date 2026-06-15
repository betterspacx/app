/**
 * Hook for managing export functionality
 */

// Modified by konlyzx (2026) - Added video export support (mp4/webm/gif) for animated content via exportAnimationVideo
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { getAspectRatioPreset } from '@/lib/aspect-ratio-utils';
import { exportElement, type ExportOptions } from '@/lib/export/export-service';
import { saveExportPreferences, getExportPreferences, saveExportedImage } from '@/lib/export-storage';
import { useImageStore, useEditorStore } from '@/lib/store';
import { getCanvasContainer } from '@/components/canvas/ClientCanvas';
import {
  trackExportStart,
  trackExportComplete,
  trackExportError,
  trackCopyToClipboard,
} from '@/lib/analytics';
import type { ExportFormat, QualityPreset } from '@/lib/export/types';
import { isVideoFormat } from '@/lib/export/types';
import { exportAnimationVideo } from '@/lib/export-slideshow-video';
import { useExportProgress } from '@/hooks/useExportProgress';

export interface ExportSettings {
  format: ExportFormat;
  qualityPreset: QualityPreset;
  scale: number;
}

const DEFAULT_SETTINGS: ExportSettings = {
  format: 'jpeg',
  qualityPreset: 'high',
  scale: 2,
};

/**
 * Smooth progress animator — animates from current value toward a target
 * using requestAnimationFrame for 60fps smoothness.
 */
function createProgressAnimator(setProgress: (v: number) => void) {
  let current = 0;
  let target = 0;
  let rafId: number | null = null;

  const animate = () => {
    const diff = target - current;
    if (Math.abs(diff) < 0.5) {
      current = target;
      setProgress(Math.round(current));
      rafId = null;
      return;
    }
    // Ease toward target: faster when far, slower when close
    current += diff * 0.15;
    setProgress(Math.round(current));
    rafId = requestAnimationFrame(animate);
  };

  return {
    set(value: number) {
      target = value;
      if (rafId === null) {
        rafId = requestAnimationFrame(animate);
      }
    },
    snap(value: number) {
      target = value;
      current = value;
      setProgress(value);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    },
    reset() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      current = 0;
      target = 0;
      setProgress(0);
    },
  };
}

export function useExport(selectedAspectRatio: string) {
  const [settings, setSettings] = useState<ExportSettings>(DEFAULT_SETTINGS);
  const [isExporting, setIsExporting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copyProgress, setCopyProgress] = useState(0);

  const progressAnimator = useRef(createProgressAnimator(setProgress));
  const copyAnimator = useRef(createProgressAnimator(setCopyProgress));

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      progressAnimator.current.reset();
      copyAnimator.current.reset();
    };
  }, []);

  const { backgroundConfig, backgroundBorderRadius, backgroundBlur, backgroundNoise, textOverlays, imageOverlays, perspective3D, timeline, animationClips } = useImageStore();
  const backgroundOpacity = backgroundConfig?.opacity !== undefined ? backgroundConfig.opacity : 1;
  const { screenshot } = useEditorStore();
  const hasAnimation = timeline.tracks.length > 0 || animationClips.length > 0;

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await getExportPreferences();
        if (prefs) {
          const loadedFormat = (prefs.format as ExportFormat) || 'png';
          const isVideo = isVideoFormat(loadedFormat);
          // Ensure loaded format is valid for current animation state
          const validFormat = isVideo && !hasAnimation ? 'jpeg' : !isVideo && hasAnimation ? 'mp4' : loadedFormat;
          setSettings({
            format: validFormat,
            qualityPreset: (prefs.qualityPreset as QualityPreset) || 'high',
            scale: prefs.scale,
          });
        }
      } catch (error) {
        console.error('Failed to load export preferences:', error);
      }
    };

    loadPreferences();
  }, []);

  // Auto-switch format when animation state changes
  useEffect(() => {
    setSettings((prev) => {
      const isVideo = isVideoFormat(prev.format);
      if (hasAnimation && !isVideo) {
        return { ...prev, format: 'mp4' };
      }
      if (!hasAnimation && isVideo) {
        return { ...prev, format: 'jpeg' };
      }
      return prev;
    });
  }, [hasAnimation]);

  // Save preferences when they change
  const savePreferences = useCallback(async (newSettings: ExportSettings) => {
    try {
      await saveExportPreferences({
        format: newSettings.format,
        qualityPreset: newSettings.qualityPreset,
        scale: newSettings.scale,
      });
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }, []);

  const updateFormat = useCallback(async (format: ExportFormat) => {
    const newSettings = { ...settings, format };
    setSettings(newSettings);
    await savePreferences(newSettings);
  }, [settings, savePreferences]);

  const updateQualityPreset = useCallback(async (qualityPreset: QualityPreset) => {
    const newSettings = { ...settings, qualityPreset };
    setSettings(newSettings);
    await savePreferences(newSettings);
  }, [settings, savePreferences]);

  const updateScale = useCallback(async (scale: number) => {
    const newSettings = { ...settings, scale };
    setSettings(newSettings);
    await savePreferences(newSettings);
  }, [settings, savePreferences]);

  const exportImage = useCallback(async (): Promise<void> => {
    const anim = progressAnimator.current;
    setIsExporting(true);
    anim.snap(0);
    const startTime = Date.now();

    trackExportStart(settings.format, settings.qualityPreset, settings.scale);

    try {
      const isVideo = isVideoFormat(settings.format);

      if (isVideo) {
        if (!hasAnimation) {
          throw new Error('No animation to export. Add motion or animation first.');
        }

        // Video export uses its own progress store — poll it into our local progress
        const videoOptions = {
          format: settings.format as 'mp4' | 'webm' | 'gif',
          quality: settings.qualityPreset as 'high' | 'medium' | 'low',
        };

        const progressInterval = setInterval(() => {
          const videoProgress = useExportProgress.getState().progress;
          anim.set(videoProgress);
        }, 150);

        await exportAnimationVideo(videoOptions);

        clearInterval(progressInterval);
        anim.snap(100);

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        toast.success('Video exported successfully!', {
          description: `Saved as ${settings.format.toUpperCase()}`,
        });

        setTimeout(() => anim.reset(), 600);
        return;
      }

      // ── Image export path ──
      const canvasContainer = getCanvasContainer();
      const preset = getAspectRatioPreset(selectedAspectRatio);
      if (!preset) {
        throw new Error('Invalid aspect ratio selected');
      }

      const exportOptions: ExportOptions = {
        format: settings.format,
        qualityPreset: settings.qualityPreset,
        scale: settings.scale,
        exportWidth: preset.width,
        exportHeight: preset.height,
      };

      // exportElement reports progress 0-95 via callback
      const result = await exportElement(
        'image-render-card',
        exportOptions,
        canvasContainer,
        backgroundConfig,
        backgroundBorderRadius,
        textOverlays,
        imageOverlays,
        perspective3D,
        screenshot.src || undefined,
        screenshot.radius,
        backgroundBlur,
        backgroundNoise,
        backgroundOpacity,
        (percent) => anim.set(percent)
      );

      if (!result.blob || result.blob.size === 0) {
        throw new Error('Invalid image data generated');
      }

      // Save to storage (95 → 97%)
      anim.set(96);
      const fileExtension = settings.format === 'jpeg' ? 'jpg' : settings.format === 'webp' ? 'webp' : 'png';
      const fileName = `betterflow-${Date.now()}.${fileExtension}`;

      try {
        await saveExportedImage(
          result.blob,
          settings.format,
          settings.qualityPreset,
          settings.scale,
          fileName
        );
      } catch (error) {
        console.warn('Failed to save export to IndexedDB:', error);
      }

      // Download (97 → 100%)
      anim.set(98);

      const durationMs = Date.now() - startTime;
      const fileSizeKb = Math.round(result.blob.size / 1024);
      trackExportComplete(
        settings.format,
        settings.qualityPreset,
        settings.scale,
        fileSizeKb,
        durationMs
      );

      const url = URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.download = fileName;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        if (result.dataURL.startsWith('blob:')) URL.revokeObjectURL(result.dataURL);
      }, 100);

      // Done
      anim.snap(100);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast.success('Image downloaded successfully!', {
        description: `Saved as ${fileName}`,
      });

      setTimeout(() => anim.reset(), 600);
    } catch (error) {
      anim.reset();
      console.error('Export failed:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to export image. Please try again.';

      trackExportError(settings.format, errorMessage);

      toast.error('Export failed', {
        description: errorMessage,
      });

      throw new Error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  }, [selectedAspectRatio, settings, hasAnimation, backgroundConfig, backgroundBorderRadius, backgroundBlur, backgroundNoise, backgroundOpacity, textOverlays, imageOverlays, perspective3D, screenshot.src, screenshot.radius]);

  const copyImage = useCallback(async (): Promise<void> => {
    const anim = copyAnimator.current;
    setIsCopying(true);
    anim.snap(0);

    try {
      const canvasContainer = getCanvasContainer();
      const preset = getAspectRatioPreset(selectedAspectRatio);
      if (!preset) {
        throw new Error('Invalid aspect ratio selected');
      }

      const exportOptions: ExportOptions = {
        format: 'png',
        qualityPreset: 'medium',
        scale: 2,
        exportWidth: preset.width,
        exportHeight: preset.height,
        skipSharp: true, // Clipboard doesn't need Sharp compression — speed matters more
      };

      // exportElement reports progress 0-95 via callback
      const result = await exportElement(
        'image-render-card',
        exportOptions,
        canvasContainer,
        backgroundConfig,
        backgroundBorderRadius,
        textOverlays,
        imageOverlays,
        perspective3D,
        screenshot.src || undefined,
        screenshot.radius,
        backgroundBlur,
        backgroundNoise,
        backgroundOpacity,
        (percent) => anim.set(percent)
      );

      if (!result.blob || result.blob.size === 0) {
        throw new Error('Invalid image data generated');
      }

      // Prepare clipboard blob — clipboard requires PNG
      anim.set(96);
      const blob = result.blob.type === 'image/png'
        ? result.blob
        : await new Promise<Blob>((resolve, reject) => {
          const url = URL.createObjectURL(result.blob);
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            URL.revokeObjectURL(url);
            if (!ctx) {
              reject(new Error('Failed to get canvas context'));
              return;
            }
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((b) => {
              b ? resolve(b) : reject(new Error('Failed to create blob'));
            }, 'image/png');
          };
          img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')); };
          img.src = url;
        });

      // Stage 4: Write to clipboard (85 → 100%)
      anim.set(92);
      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob
          })
        ]);

        trackCopyToClipboard(true);

        // Done
        anim.snap(100);

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        toast.success('Image copied to clipboard!', {
          description: 'You can now paste it anywhere',
        });

        setTimeout(() => anim.reset(), 600);
      } else {
        throw new Error('Clipboard API not supported');
      }
    } catch (error) {
      anim.reset();
      console.error('Copy failed:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to copy image to clipboard. Please try again.';

      trackCopyToClipboard(false);

      toast.error('Copy failed', {
        description: errorMessage,
      });

      throw new Error(errorMessage);
    } finally {
      setIsCopying(false);
    }
  }, [selectedAspectRatio, backgroundConfig, backgroundBorderRadius, backgroundBlur, backgroundNoise, backgroundOpacity, textOverlays, imageOverlays, perspective3D, screenshot.src, screenshot.radius]);

  return {
    settings,
    isExporting,
    isCopying,
    progress,
    copyProgress,
    updateFormat,
    updateQualityPreset,
    updateScale,
    exportImage,
    copyImage,
  };
}
