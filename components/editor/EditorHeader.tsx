// Modified by konlyzx (2026) - Styled export button with Export label, format info, and arrow icon using justify-between layout - Fixed Start Over button to call clearImage instead of resetCanvasSettings
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

'use client';

import * as React from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  ArrowTurnBackwardIcon,
  ArrowTurnForwardIcon,
  ArrowDown01Icon,
  Download01Icon,
  RefreshIcon,
  PencilEdit02Icon,
} from 'hugeicons-react';
import { useEditorStore, useImageStore, OmitFunctions, EditorState, ImageState, ImageFilters } from '@/lib/store';
import { useExport } from '@/hooks/useExport';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { CopyProgressDialog } from '@/components/canvas/dialogs/CopyProgressDialog';
import { ExportSlideshowDialog } from '@/lib/export-slideshow-dialog';
import { ImageExportProgressView } from '@/components/canvas/dialogs/ImageProgressView';
import { FormatSelector, QualityPresetSelector, ScaleSlider } from '@/components/export';
import { cn } from '@/lib/utils';
import { AuthModal } from '@/components/auth/AuthModal';
import { SaveDialog } from '@/components/projects/SaveDialog';
import { ProjectsSidebar } from '@/components/projects/ProjectsSidebar';
import { saveProject, listProjects, loadProject, deleteProject, ProjectMeta } from '@/lib/project-manager';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

function serializeState(): { editorState: OmitFunctions<EditorState>; imageState: OmitFunctions<ImageState> } {
  const { screenshot, background, shadow, pattern, frame, canvas, noise } = useEditorStore.getState();
  const {
    uploadedImageUrl,
    imageName,
    selectedGradient,
    borderRadius,
    backgroundBorderRadius,
    selectedAspectRatio,
    backgroundConfig,
    backgroundBlur,
    backgroundNoise,
    textOverlays,
    imageOverlays,
    mockups,
    imageOpacity,
    imageScale,
    imageBorder,
    imageShadow,
    perspective3D,
    imageFilters,
    exportSettings,
    slides,
    activeSlideId,
    slideshow,
    isPreviewing,
    previewIndex,
    previewStartedAt,
    timeline,
    showTimeline,
    animationClips,
    annotations,
    activeAnnotationTool,
    selectedAnnotationId,
    annotationDefaults,
    blurRegions,
    activeRightPanelTab,
    showTemplates,
    editorMode,
    browserUrl,
    browserHeaderSize,
    canvasDimensions,
    customDimensions,
    activePresetId,
    imageStylePreset,
    shadowPreset,
  } = useImageStore.getState();

  const editorState = { screenshot, background, shadow, pattern, frame, canvas, noise };
  const imageState = {
    uploadedImageUrl,
    imageName,
    selectedGradient,
    borderRadius,
    backgroundBorderRadius,
    selectedAspectRatio,
    backgroundConfig,
    backgroundBlur,
    backgroundNoise,
    textOverlays,
    imageOverlays,
    mockups,
    imageOpacity,
    imageScale,
    imageBorder,
    imageShadow,
    perspective3D,
    imageFilters,
    exportSettings,
    slides,
    activeSlideId,
    slideshow,
    isPreviewing,
    previewIndex,
    previewStartedAt,
    timeline,
    showTimeline,
    animationClips,
    annotations,
    activeAnnotationTool,
    selectedAnnotationId,
    annotationDefaults,
    blurRegions,
    activeRightPanelTab,
    showTemplates,
    editorMode,
    browserUrl,
    browserHeaderSize,
    canvasDimensions,
    customDimensions,
    activePresetId,
    imageStylePreset,
    shadowPreset,
  };
  return { editorState, imageState };
}

function restoreProject(imageState: OmitFunctions<ImageState>, editorState: OmitFunctions<EditorState>) {
  const es = useEditorStore.getState();
  const is = useImageStore.getState();

  if (editorState?.screenshot) es.setScreenshot(editorState.screenshot);
  if (editorState?.background) es.setBackground(editorState.background);
  if (editorState?.shadow) es.setShadow(editorState.shadow);
  if (editorState?.pattern) es.setPattern(editorState.pattern);
  if (editorState?.frame) es.setFrame(editorState.frame);
  if (editorState?.canvas) es.setCanvas(editorState.canvas);
  if (editorState?.noise) es.setNoise(editorState.noise);

  if (imageState.uploadedImageUrl) {
    is.setUploadedImageUrl(imageState.uploadedImageUrl, imageState.imageName);
  }
  if (imageState.selectedGradient) is.setGradient(imageState.selectedGradient);
  if (imageState.borderRadius !== undefined) is.setBorderRadius(imageState.borderRadius);
  if (imageState.backgroundBorderRadius !== undefined) is.setBackgroundBorderRadius(imageState.backgroundBorderRadius);
  if (imageState.selectedAspectRatio) is.setAspectRatio(imageState.selectedAspectRatio);
  if (imageState.customDimensions)
    is.setCustomDimensions(imageState.customDimensions.width, imageState.customDimensions.height);
  if (imageState.backgroundConfig) is.setBackgroundConfig(imageState.backgroundConfig);
  if (imageState.backgroundBlur !== undefined) is.setBackgroundBlur(imageState.backgroundBlur);
  if (imageState.backgroundNoise !== undefined) is.setBackgroundNoise(imageState.backgroundNoise);
  if (imageState.imageOpacity !== undefined) is.setImageOpacity(imageState.imageOpacity);
  if (imageState.imageScale !== undefined) is.setImageScale(imageState.imageScale);
  if (imageState.imageBorder) is.setImageBorder(imageState.imageBorder);
  if (imageState.imageShadow) is.setImageShadow(imageState.imageShadow);
  useImageStore.setState({ activePresetId: imageState.activePresetId ?? null });
  if (imageState.perspective3D) is.setPerspective3D(imageState.perspective3D);
  if (imageState.imageFilters) {
    const filters = imageState.imageFilters as ImageState['imageFilters'];
    if (filters) {
      is.resetImageFilters();
      (Object.keys(filters) as (keyof ImageState['imageFilters'])[]).forEach((key) => {
        const val = filters[key];
        if (val !== undefined) is.setImageFilter(key as keyof ImageFilters, val);
      });
    }
  }

  is.clearTextOverlays();
  imageState.textOverlays?.forEach((o) => is.addTextOverlay(o));

  is.clearImageOverlays();
  imageState.imageOverlays?.forEach((o) => is.addImageOverlay(o));

  is.clearMockups();
  imageState.mockups?.forEach((m) => is.addMockup(m));
}

export function EditorHeader() {
  const [authOpen, setAuthOpen] = React.useState(false);
  const [saveOpen, setSaveOpen] = React.useState(false);
  const [projectsOpen, setProjectsOpen] = React.useState(false);
  const [projects, setProjects] = React.useState<ProjectMeta[]>([]);
  const [projectsLoading, setProjectsLoading] = React.useState(false);
  const [authenticated, setAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setAuthenticated(!!u);
    });
    return unsub;
  }, []);

  const { screenshot } = useEditorStore();
  const {
    selectedAspectRatio,
    slides,
    uploadedImageUrl,
    clearImage,
    timeline,
    animationClips,
    resetCanvasSettings,
    setShowTemplates,
    showTemplates,
  } = useImageStore();
  const [exportOpen, setExportOpen] = React.useState(false);
  const [exportSlideshowOpen, setExportSlideshowOpen] = React.useState(false);
  const [exportError, setExportError] = React.useState<string | null>(null);
  const hasImage = !!screenshot.src;

  const headerPanelRef = React.useRef<HTMLDivElement>(null);
  const headerFirstRender = React.useRef(true);
  gsap.registerPlugin(useGSAP);

  useGSAP(
    () => {
      if (!headerPanelRef.current) return;
      if (headerFirstRender.current) {
        headerFirstRender.current = false;
        gsap.set(headerPanelRef.current, { width: 240 });
        return;
      }
      gsap.to(headerPanelRef.current, {
        width: 240,
        duration: 0.3,
        ease: 'power3.out',
      });
    },
    { dependencies: [showTemplates], scope: headerPanelRef }
  );

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

  const handleSave = async (name: string) => {
    const { editorState, imageState } = serializeState();
    if (!auth.currentUser) throw new Error('Not authenticated');
    await saveProject(name, editorState, imageState);
  };

  const handleLoadProject = async (projectId: string) => {
    const data = await loadProject(projectId);
    if (!data) return;
    restoreProject(data.imageState as OmitFunctions<ImageState>, data.editorState as OmitFunctions<EditorState>);
    setProjectsOpen(false);
  };

  const handleDeleteProject = async (projectId: string) => {
    await deleteProject(projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  const openProjectList = async () => {
    setProjectsOpen(true);
    setProjectsLoading(true);
    try {
      const p = await listProjects();
      setProjects(p);
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleStartOver = async () => {
    if (authenticated && uploadedImageUrl) {
      const { editorState, imageState } = serializeState();
      await saveProject('Auto-save before Start Over', editorState, imageState, '__presave__').catch(() => {});
    }
    clearImage();
    resetCanvasSettings();
  };

  const hasAnimation = timeline.tracks.length > 0 || animationClips.length > 0;
  const formatLabel =
    exportSettings.format === 'jpeg'
      ? 'JPEG'
      : exportSettings.format === 'webp'
        ? 'WebP'
        : exportSettings.format === 'png'
          ? 'PNG'
          : exportSettings.format === 'mp4'
            ? 'MP4'
            : exportSettings.format === 'webm'
              ? 'WebM'
              : exportSettings.format === 'gif'
                ? 'GIF'
                : 'PNG';
  const exportTypeLabel = hasAnimation ? 'Video' : 'Image';

  return (
    <>
      <header className="h-12 pt-3 pb-2 bg-custom-black flex items-center shrink-0 shadow-sm gap-2">
        <div
          ref={headerPanelRef}
          className="shrink-0 ml-2 overflow-hidden"
          style={{
            width: 240,
          }}
        >
          <div className="w-full flex items-center h-11 rounded-2xl bg-custom-muted border border-border/40 px-1">
            <Link
              href="/"
              className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-muted/80 transition-all"
            >
              <Image src="/logo.svg" alt="Better Flow" width={32} height={32} className="h-7 w-7" />
            </Link>

            <div className="w-px h-6 bg-border/40 mx-1" />

            <div className="flex-1 min-w-0 flex items-center">
              <button
                onClick={() => setShowTemplates(true)}
                className="flex-1 flex items-center gap-2 px-4 h-10 rounded-xl hover:bg-muted/50 text-foreground transition-colors duration-200 group justify-center cursor-pointer"
              >
                <PencilEdit02Icon size={16} className="text-white" />
                <span className="text-sm font-medium text-foreground">Templates</span>
                <ArrowDown01Icon size={14} className="text-muted-foreground ml-1" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center h-10 rounded-2xl px-2">
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
              onClick={handleStartOver}
              className="flex items-center gap-1.5 px-3 h-8 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all text-xs font-medium hover:shadow-sm active:scale-95 cursor-pointer"
            >
              <RefreshIcon size={14} />
              <span>Start Over</span>
            </button>
          )}

          {authenticated && uploadedImageUrl && (
            <>
              <div className="w-px h-5 bg-border/40 mx-1" />
              <button
                onClick={() => setSaveOpen(true)}
                className="flex items-center gap-1.5 px-3 h-8 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all text-xs font-medium hover:shadow-sm active:scale-95 cursor-pointer"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                <span>Save</span>
              </button>
            </>
          )}

          <button
            onClick={() => setAuthOpen(true)}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground hover:bg-muted transition-all hover:shadow-sm active:scale-95 cursor-pointer ml-1"
            title={authenticated ? 'Account' : 'Sign in'}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M20 21a8 8 0 1 0-16 0" />
            </svg>
          </button>

          {authenticated && (
            <button
              onClick={openProjectList}
              className="flex items-center gap-1.5 px-3 h-8 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all text-xs font-medium hover:shadow-sm active:scale-95 cursor-pointer ml-1"
              title="My Projects"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <span>My Projects</span>
            </button>
          )}
        </div>

        <div className="w-[245px] flex items-center justify-between h-11 rounded-2xl bg-white border border-border/40 px-1 mr-2 gap-1">
          <Popover open={exportOpen} onOpenChange={isExporting ? undefined : setExportOpen}>
            <PopoverTrigger asChild>
              <button
                disabled={!hasImage}
                className="flex-1 flex items-center justify-between px-4 h-10 rounded-2xl text-black text-xs font-medium transition-all cursor-pointer"
              >
                <h6 className="font-semibold">Export</h6>
                <span className="opacity-90">
                  {exportSettings.scale}x · {formatLabel}
                </span>
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
                  <FormatSelector
                    format={exportSettings.format}
                    onFormatChange={updateFormat}
                    hasAnimation={hasAnimation}
                  />
                  <QualityPresetSelector
                    qualityPreset={exportSettings.qualityPreset}
                    format={exportSettings.format}
                    onQualityPresetChange={updateQualityPreset}
                  />
                  {!hasAnimation && <ScaleSlider scale={exportSettings.scale} onScaleChange={updateScale} />}

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
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-muted transition-all text-muted-foreground hover:text-foreground hover:shadow-sm active:scale-95"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
      </header>

      <CopyProgressDialog open={isCopying} progress={copyProgress} />

      <ExportSlideshowDialog open={exportSlideshowOpen} onOpenChange={setExportSlideshowOpen} />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      <SaveDialog open={saveOpen} onClose={() => setSaveOpen(false)} onSave={handleSave} />

      <ProjectsSidebar
        open={projectsOpen}
        onClose={() => setProjectsOpen(false)}
        projects={projects}
        loading={projectsLoading}
        onLoad={handleLoadProject}
        onDelete={handleDeleteProject}
      />
    </>
  );
}
