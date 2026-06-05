// Modified by konlyzx (2026) - Styled export button with Export label, format info, and arrow icon using justify-between layout - Fixed Start Over button to call clearImage instead of resetCanvasSettings
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  ArrowTurnBackwardIcon,
  ArrowTurnForwardIcon,
  ArrowDown01Icon,
  Download01Icon,
  RefreshIcon,
  MagicWand01Icon,
  PencilEdit02Icon,
} from 'hugeicons-react';
import { useEditorStore, useImageStore } from '@/lib/store';
import { useExport } from '@/hooks/useExport';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { CopyProgressDialog } from '@/components/canvas/dialogs/CopyProgressDialog';
import { ExportSlideshowDialog } from '@/lib/export-slideshow-dialog';
import { ImageExportProgressView } from '@/components/canvas/dialogs/ImageProgressView';
import { FormatSelector, QualityPresetSelector, ScaleSlider } from '@/components/export';
import { cn } from '@/lib/utils';

export function EditorHeader() {
  const { screenshot } = useEditorStore();
  const { selectedAspectRatio, slides, uploadedImageUrl, clearImage, timeline, animationClips, resetCanvasSettings, setShowTemplates } = useImageStore();
  const [exportOpen, setExportOpen] = React.useState(false);
  const [exportSlideshowOpen, setExportSlideshowOpen] = React.useState(false);
  const [exportError, setExportError] = React.useState<string | null>(null);
  const hasImage = !!screenshot.src;

  // Undo/redo state
  const [canUndo, setCanUndo] = React.useState(false);
  const [canRedo, setCanRedo] = React.useState(false);

  React.useEffect(() => {
    const updateTemporalState = () => {
      const { pastStates, futureStates } = useImageStore.temporal.getState();
      setCanUndo(pastStates.length > 0);
      setCanRedo(futureStates.length > 0);
    };
    updateTemporalState();
    const unsubscribe = useImageStore.temporal.subscribe(updateTemporalState);
    return unsubscribe;
  }, []);

  const handleUndo = React.useCallback(() => {
    const { undo, pastStates } = useImageStore.temporal.getState();
    if (pastStates.length > 0) undo();
  }, []);

  const handleRedo = React.useCallback(() => {
    const { redo, futureStates } = useImageStore.temporal.getState();
    if (futureStates.length > 0) redo();
  }, []);

  const {
    copyImage,
    isExporting,
    isCopying,
    progress,
    copyProgress,
    settings: exportSettings,
    exportImage,
    updateScale,
    updateFormat,
    updateQualityPreset,
  } = useExport(selectedAspectRatio);

  const handleExport = async () => {
    setExportError(null);
    try {
      await exportImage();
      setExportOpen(false);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed. Please try again.');
    }
  };

  const hasAnimation = timeline.tracks.length > 0 || animationClips.length > 0;
  const formatLabel =
    exportSettings.format === 'jpeg' ? 'JPEG'
    : exportSettings.format === 'webp' ? 'WebP'
    : exportSettings.format === 'png' ? 'PNG'
    : exportSettings.format === 'mp4' ? 'MP4'
    : exportSettings.format === 'webm' ? 'WebM'
    : exportSettings.format === 'gif' ? 'GIF'
    : 'PNG';
  const exportTypeLabel = hasAnimation ? 'Video' : 'Image';

  return (
    <>
      <header className="h-12 pt-3 pb-2 bg-custom-black flex items-center shrink-0 shadow-sm gap-2">
        {/* Left - Logo + Templates in single container - aligned with sidebar width */}
        <div className="w-[240px] flex items-center h-11 rounded-2xl bg-custom-muted border border-border/40 px-1 ml-2">
          <Link href="/" className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-muted/80 transition-all">
            <Image
              src="/logo.svg"
              alt="Better Flow"
              width={32}
              height={32}
              className="h-7 w-7"
            />
          </Link>

          <div className="w-px h-6 bg-border/40 mx-1" />

          <button
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-2 px-4 h-10 rounded-xl hover:bg-muted/50 text-[#1a1a2e] hover:opacity-90 transition-all duration-200 group flex-1 justify-center cursor-pointer"
          >
            <PencilEdit02Icon size={16} className="text-white" />
            <span className="text-sm font-medium text-foreground">Templates</span>
            <ArrowDown01Icon size={14} className="text-muted-foreground ml-1" />
          </button>
        </div>

        {/* Center - Undo/Redo + Start Over + Icons in container */}
        <div className=" flex-1 flex items-center justify-center h-10 rounded-2xl px-2">
          {hasImage && (
            <>
              <button
                onClick={handleUndo}
                disabled={!canUndo}
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-xl',
                  'text-muted-foreground transition-all duration-150',
                  'hover:shadow-sm',
                  canUndo
                    ? 'hover:bg-muted hover:text-foreground active:scale-95 cursor-pointer'
                    : 'opacity-40 cursor-not-allowed'
                )}
              >
                <ArrowTurnBackwardIcon size={16} />
              </button>
              <button
                onClick={handleRedo}
                disabled={!canRedo}
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-xl',
                  'text-muted-foreground transition-all duration-150',
                  'hover:shadow-sm',
                  canRedo
                    ? 'hover:bg-muted hover:text-foreground active:scale-95 cursor-pointer'
                    : 'opacity-40 cursor-not-allowed'
                )}
              >
                <ArrowTurnForwardIcon size={16} />
              </button>
              <div className="w-px h-5 bg-border/40 mx-1" />
            </>
          )}

          {uploadedImageUrl && (
            <button
              onClick={clearImage}
              className="flex items-center gap-1.5 px-3 h-8 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all text-xs font-medium hover:shadow-sm active:scale-95 cursor-pointer"
            >
              <RefreshIcon size={14} />
              <span>Start Over</span>
            </button>
          )}

          <div className="flex items-center gap-0.5 ml-1">
            <button className="flex items-center justify-center w-8 h-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all hover:shadow-sm active:scale-95 cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </button>
            <button className="flex items-center justify-center w-8 h-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all hover:shadow-sm active:scale-95 cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m4.22-10.22l4.24-4.24M6.34 6.34L2.1 2.1m17.8 17.8l-4.24-4.24M6.34 17.66l-4.24 4.24M23 12h-6m-6 0H1m20.24-4.24l-4.24 4.24M6.34 6.34l-4.24-4.24"/>
              </svg>
            </button>
            <button className="flex items-center justify-center w-8 h-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all hover:shadow-sm active:scale-95 cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Right - Export in container */}
        <div className="w-[245px] flex items-center justify-between h-11 rounded-2xl bg-white border border-border/40 px-1 mr-2 gap-1">
          <Popover open={exportOpen} onOpenChange={isExporting ? undefined : setExportOpen}>
            <PopoverTrigger asChild>
              <button
                disabled={!hasImage}
                className="flex-1 flex items-center justify-between px-4 h-10 rounded-2xl text-black text-xs font-medium transition-all cursor-pointer"
              >
                <h6 className="font-semibold">Export</h6>
                <span className="opacity-90">{exportSettings.scale}x · {formatLabel}</span>
                <ArrowDown01Icon size={12} />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[340px] p-0"
              align="end"
              sideOffset={8}
              collisionPadding={16}
              onPointerDownOutside={isExporting ? (e) => e.preventDefault() : undefined}
            >
              {isExporting ? (
                <div className="p-5">
                  <p className="text-sm font-medium text-foreground mb-1">Exporting...</p>
                  <p className="text-xs text-muted-foreground mb-4">Rendering your {exportTypeLabel.toLowerCase()}</p>
                  <ImageExportProgressView progress={progress} format={exportSettings.format} />
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  <FormatSelector format={exportSettings.format} onFormatChange={updateFormat} hasAnimation={hasAnimation} />
                  <QualityPresetSelector
                    qualityPreset={exportSettings.qualityPreset}
                    format={exportSettings.format}
                    onQualityPresetChange={updateQualityPreset}
                  />
                  {!hasAnimation && (
                    <ScaleSlider scale={exportSettings.scale} onScaleChange={updateScale} />
                  )}

                  {exportError && (
                    <div className="text-xs text-destructive bg-muted/50 p-2.5 rounded-lg border border-destructive/20">
                      {exportError}
                    </div>
                  )}

                  <Button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full h-10 text-sm font-semibold text-white rounded-lg transition-all bg-[linear-gradient(110deg,#c9d4ff_0%,#e0d4ff_45%,#f5d4e8_100%)] hover:opacity-90"
                  >
                    <Download01Icon size={16} className="mr-2" />
                    Export {exportTypeLabel} as {formatLabel}
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          <div className="w-px h-5 bg-border/40 mx-1" />

          <a
            href="https://x.com/konlyzx_"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-muted transition-all text-muted-foreground hover:text-foreground hover:shadow-sm active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-muted transition-all text-muted-foreground hover:text-foreground hover:shadow-sm active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
      </header>

      <CopyProgressDialog open={isCopying} progress={copyProgress} />

      <ExportSlideshowDialog
        open={exportSlideshowOpen}
        onOpenChange={setExportSlideshowOpen}
      />
    </>
  );
}
