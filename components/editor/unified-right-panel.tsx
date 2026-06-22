// Modified by konlyzx (2026) - Changed background to bg-muted/50; added cursor-pointer to tabs
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

'use client';

import * as React from 'react';
import { PresetGallery } from '@/components/presets/PresetGallery';
import {
  Settings02Icon,
  SlidersHorizontalIcon,
  ColorsIcon,
  MagicWand01Icon,
  RotateSquareIcon,
  Cancel01Icon,
  LayersLogoIcon,
} from 'hugeicons-react';
import {
  SettingsSection,
  StyleSection,
  BrowserMockupSection,
  DeviceFramesSection,
  BorderSection,
  ShadowSection,
  BackgroundSection,
  TextSection,
  TransformsGallery,
  AnnotateSection,
  ImageOverlaySection,
  DepthSection,
  TweetImportSection,
  CodeSnippetSection,
  ImagePositionSection,
} from './sections';
import { cn } from '@/lib/utils';
import { useImageStore } from '@/lib/store';

type TabType = 'edit' | 'transforms';

const tabs: { id: TabType; icon: React.ReactNode; label: string }[] = [
  { id: 'edit', icon: <Settings02Icon size={16} />, label: 'Zoom' },
  { id: 'transforms', icon: <RotateSquareIcon size={16} />, label: 'Tilt' },
];

export function UnifiedRightPanel() {
  const {
    activeRightPanelTab,
    setActiveRightPanelTab,
    showTemplates: templatesOpen,
    setShowTemplates: setTemplatesOpen,
    editorMode,
  } = useImageStore();
  const activeTab = activeRightPanelTab;
  const setActiveTab = setActiveRightPanelTab;

  const [contentKey, setContentKey] = React.useState(activeTab);
  const [transitioning, setTransitioning] = React.useState(false);

  // Handle tab content fade transition
  React.useEffect(() => {
    if (activeTab !== contentKey) {
      setTransitioning(true);
      const timeout = setTimeout(() => {
        setContentKey(activeTab);
        setTransitioning(false);
      }, 150);
      return () => clearTimeout(timeout);
    }
  }, [activeTab, contentKey]);

  // Close templates overlay on Escape
  React.useEffect(() => {
    if (!templatesOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTemplatesOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [templatesOpen, setTemplatesOpen]);

  return (
    <div className="w-full h-full bg-custom-muted flex flex-col overflow-hidden md:w-[460px] border-r border-border/40 relative">
      <div className="px-3 py-3 border-b border-border/30 shrink-0">
        <div className="flex gap-1 p-1 bg-gradient-to-b from-muted/90 to-muted/70 dark:from-muted/60 dark:to-muted/40 rounded-xl border border-border/30 shadow-sm">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center justify-center py-2.5 px-3 rounded-lg cursor-pointer',
                  'transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]',
                  isActive
                    ? 'bg-gradient-to-b from-background to-background/90 dark:from-accent dark:to-accent/90 text-foreground flex-[1.8] shadow-md ring-1 ring-border/20'
                    : 'text-muted-foreground hover:text-foreground flex-1 hover:bg-custom-muted'
                )}
              >
                <span className="shrink-0">{tab.icon}</span>
                <span
                  className={cn(
                    'text-xs font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]',
                    isActive ? 'max-w-[80px] opacity-100 ml-2' : 'max-w-0 opacity-0 ml-0'
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="px-4 py-3 border-b border-border/30 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Auto-fit</span>
          <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
            <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div
          className="p-4 transition-all duration-150 ease-out"
          style={{
            opacity: transitioning ? 0 : 1,
            transform: transitioning ? 'translateY(4px)' : 'translateY(0)',
          }}
        >
          {contentKey === 'edit' && (
            <div className="space-y-4">
              <DeviceFramesSection />
              <BrowserMockupSection />
              <StyleSection />
              <BorderSection />
              <ShadowSection />
              <BackgroundSection />
              <TextSection />
              <ImageOverlaySection />
              <ImagePositionSection />
              <SettingsSection />
            </div>
          )}

          {contentKey === 'transforms' && <TransformsGallery />}
        </div>
      </div>
      <div
        className={cn(
          'absolute inset-0 z-50 bg-card flex flex-col transition-all duration-300 ease-out',
          templatesOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <MagicWand01Icon size={20} className="text-primary" />
            <h2 className="text-base font-semibold text-foreground">Templates</h2>
          </div>
          <button
            onClick={() => setTemplatesOpen(false)}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors duration-150 text-muted-foreground hover:text-foreground"
          >
            <Cancel01Icon size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="p-5">
            <PresetGallery />
          </div>
        </div>
      </div>
    </div>
  );
}
