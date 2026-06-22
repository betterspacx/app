// Modified by konlyzx (2026) - Adjusted center canvas to maximize height like sidebars; Integration: Chrome Extension Video Ingestion Pipeline
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

'use client';

import * as React from 'react';
import { LeftEditPanel } from './LeftEditPanel';
import { TemplatesPanel } from './TemplatesPanel';
import { RightSettingsPanel } from './RightSettingsPanel';
import { UnifiedRightPanel } from './unified-right-panel';
import { EditorContent } from './EditorContent';
import { EditorCanvas } from '@/components/canvas/EditorCanvas';
import { EditorStoreSync } from '@/components/canvas/EditorStoreSync';
import { EditorHeader } from './EditorHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import { ClientOnly } from '@/components/ui/client-only';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Settings02Icon } from 'hugeicons-react';
import { useAutosaveDraft } from '@/hooks/useAutosaveDraft';
import { MobileBanner } from './MobileBanner';
import { AnnouncementModal } from './AnnouncementModal';
import { TimelineEditor } from '@/components/timeline';
import { useImageStore } from '@/lib/store';
import { trackEditorOpen } from '@/lib/analytics';
import { cn } from '@/lib/utils';

function EditorMain() {
  const isMobile = useIsMobile();
  const [mobileSheetOpen, setMobileSheetOpen] = React.useState(false);
  const { uploadedImageUrl, slides, showTimeline, setUploadedImageUrl, showTemplates } = useImageStore();

  // enable autosave
  useAutosaveDraft();

  const hasContent = !!uploadedImageUrl || slides.length > 0;

  // Chrome Extension Video Ingestion
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const videoUrl = params.get('videoUrl');

    if (videoUrl) {
      // Validate that the URL is from our authorized CDN
      const authorizedCDN = process.env.NEXT_PUBLIC_CDN_URL || 'http://localhost:3000';
      if (videoUrl.startsWith(authorizedCDN)) {
        // Load the video into the editor state
        setUploadedImageUrl(videoUrl, 'recording.webm');

        // Clean the URL by removing the videoUrl parameter without page reload
        const url = new URL(window.location.href);
        url.searchParams.delete('videoUrl');
        window.history.replaceState({}, '', url.toString());
      } else {
        console.warn('Unauthorized video URL detected:', videoUrl);
      }
    }
  }, [setUploadedImageUrl]);

  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    trackEditorOpen();
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="h-screen flex bg-background overflow-hidden relative">
      <EditorStoreSync />
      {!isMobile && (
        <ClientOnly>
          <TemplatesPanel />
        </ClientOnly>
      )}
      <div
        className={cn(
          'flex-1 flex flex-col overflow-hidden relative transition-[filter] duration-300',
          showTemplates ? 'blur-[2px] brightness-[0.65]' : ''
        )}
      >
        <MobileBanner />
        <EditorHeader />
        {isMobile && (
          <div className="bg-background border-b border-border flex items-center justify-end px-4 py-2 z-10">
            <Button variant="ghost" size="icon" onClick={() => setMobileSheetOpen(true)} className="h-9 w-9">
              <Settings02Icon size={20} />
            </Button>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden bg-custom-black pt-[5px]">
          {!isMobile && (
            <div className="pb-2 pl-2 shrink-0">
              <div className="h-full rounded-2xl overflow-hidden shadow-lg border border-border/50 bg-[#1c1c1e]">
                <LeftEditPanel />
              </div>
            </div>
          )}
          <div className="flex-1 flex flex-col overflow-hidden bg-custom-black relative" style={{ contain: 'layout' }}>
            <div className="flex-1 flex items-center justify-center overflow-y-auto overflow-x-hidden relative rounded-2xl m-2">
              <EditorContent>
                <EditorCanvas />
              </EditorContent>
            </div>
            {hasContent && showTimeline && !isMobile && <TimelineEditor />}
          </div>
          {!isMobile && (
            <div className="pb-2 pr-2">
              <div className="h-full rounded-2xl overflow-hidden shadow-lg border border-border/50 bg-muted/50">
                <RightSettingsPanel />
              </div>
            </div>
          )}
          {isMobile && (
            <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
              <SheetContent side="left" className="w-[460px] p-0 sm:max-w-[460px]">
                <UnifiedRightPanel />
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>

      <AnnouncementModal />
    </div>
  );
}

export function EditorLayout() {
  return <EditorMain />;
}
