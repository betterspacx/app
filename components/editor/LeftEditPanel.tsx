// Modified by konlyzx (2026) - Applied same tab style and content change animations from RightSettingsPanel
// Modified by konlyzx (2026) - Redesigned LeftEditPanel with compact sections matching reference image
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

'use client';

import * as React from 'react';
import { PresetGallery } from '@/components/presets/PresetGallery';
import {
  MagicWand01Icon,
  Cancel01Icon,
  Add01Icon,
  ArrowRight01Icon,
  LayersLogoIcon,
  ColorsIcon,
  Resize01Icon,
} from 'hugeicons-react';
import { AspectRatioPicker } from '@/components/aspect-ratio/aspect-ratio-picker';
import {
  StyleSection,
  BorderSection,
  ShadowSection,
  BackgroundSection,
} from './sections';
import { cn } from '@/lib/utils';
import { useImageStore } from '@/lib/store';
import { useState } from 'react';

type LeftTabType = 'frame' | 'size' | 'background';

const leftTabs: { id: LeftTabType; icon: React.ReactNode; label: string }[] = [
  { id: 'frame', icon: <LayersLogoIcon size={16} />, label: 'Frame' },
  { id: 'size', icon: <Resize01Icon size={16} />, label: 'Size' },
  { id: 'background', icon: <ColorsIcon size={16} />, label: 'BG' },
];

// Magic star icon SVG
function MagicStarIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path fill="#F94A73" d="m11.66 8.02 4.33-1.45-4.34-1.45-1.23-5.13-1.23 5.12-4.34 1.44 4.33 1.44 1.22 5.12 1.22-5.13Z"/>
      <path fill="#FB7A53" d="m4.66 8.1-.74 3.07-2.6.86 2.6.86.73 3.07.73-3.08 2.6-.87-2.61-.87-.74-3.08Z"/>
      <path fill="#C893E1" d="M2.88.43 2.24 3.1l-2.26.75 2.25.75.63 2.67.63-2.68 2.25-.76-2.26-.76L2.84.39Z"/>
    </svg>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-medium uppercase tracking-wide text-white/40">
      {children}
    </span>
  );
}

export function LeftEditPanel() {
  const {
    showTemplates: templatesOpen,
    setShowTemplates: setTemplatesOpen,
    imageFilters,
    setImageFilter,
  } = useImageStore();

  const [activeTab, setActiveTab] = React.useState<LeftTabType>('frame');
  const [lightDialogOpen, setLightDialogOpen] = React.useState(false);

  // Content change animation state (same pattern as RightSettingsPanel)
  const [contentKey, setContentKey] = React.useState<LeftTabType>(activeTab);
  const [transitioning, setTransitioning] = React.useState(false);

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

  React.useEffect(() => {
    if (!templatesOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTemplatesOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [templatesOpen, setTemplatesOpen]);

  return (
    <div className="w-[240px] h-full bg-[#1c1c1e] flex flex-col overflow-hidden border-r border-white/5 relative shrink-0">
      {/* Tab Navigation - Frame | BG */}
      <div className="px-2.5 py-2.5 border-b border-white/10 shrink-0">
        <div className="flex gap-1 p-0.5 bg-[#2c2c2e]/50 rounded-lg border border-white/10">
          {leftTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center justify-center py-2 px-2 rounded-md cursor-pointer',
                  'transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]',
                  isActive
                    ? 'bg-[#3a3a3c] text-white flex-[1.8] shadow-sm'
                    : 'text-white/40 hover:text-white/70 flex-1'
                )}
              >
                <span className="shrink-0">{tab.icon}</span>
                <span
                  className={cn(
                    'text-[11px] font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]',
                    isActive
                      ? 'max-w-[60px] opacity-100 ml-1.5'
                      : 'max-w-0 opacity-0 ml-0'
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div
          className="p-4 space-y-5 transition-all duration-150 ease-out"
          style={{
            opacity: transitioning ? 0 : 1,
            transform: transitioning ? 'translateY(4px)' : 'translateY(0)',
          }}
        >
          {contentKey === 'frame' && (<>
              {/* Magic Preset Button */}
              <button
                onClick={() => setTemplatesOpen(true)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#1c1c1e] hover:bg-[#262628] transition-colors border border-white/5 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <MagicStarIcon size={14} />
                  <span className="text-[11px] font-medium text-white/80">Magic Preset</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <ArrowRight01Icon size={12} className="text-white/25 rotate-180" />
                  <ArrowRight01Icon size={12} className="text-white/50" />
                </div>
              </button>

              {/* MEDIA Section */}
              <div className="space-y-1.5">
                <SectionLabel>Media</SectionLabel>
                <button
                  onClick={() => document.getElementById('media-upload-input')?.click()}
                  className="w-full rounded-lg bg-[#2c2c2e] border border-dashed border-white/10 hover:border-white/30 hover:bg-[#323234] transition-all group cursor-pointer overflow-hidden"
                >
                  <div className="p-2 flex flex-col items-center justify-center gap-1.5">
                    <div className="w-8 h-6 rounded bg-[#3a3a3c] group-hover:bg-[#48484a] transition-colors flex items-center justify-center">
                      <Add01Icon size={14} className="text-white/50" />
                    </div>
                    <span className="text-[9px] text-white/30 text-center leading-tight">Drop media or click to choose</span>
                  </div>
                </button>
                <input
                  id="media-upload-input"
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => console.log('Files:', e.target.files)}
                />
              </div>

              {/* STYLE Section - Original with corner previews */}
              <div className="space-y-2">
                <SectionLabel>Style</SectionLabel>
                <StyleSection />
              </div>

              {/* BORDER Section - Original with corner previews */}
              <div className="space-y-2">
                <SectionLabel>Border</SectionLabel>
                <BorderSection />
              </div>

              {/* SHADOW Section - Original with corner previews */}
              <div className="space-y-2">
                <SectionLabel>Shadow</SectionLabel>
                <ShadowSection />
              </div>

              {/* Adjust Light Button */}
              <button 
                onClick={() => setLightDialogOpen(!lightDialogOpen)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#2c2c2e] hover:bg-[#3a3a3c] transition-colors cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/50">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
                <span className="text-[11px] text-white/70">Adjust Light</span>
              </button>

              {/* Light Dialog */}
              {lightDialogOpen && (
                <div className="p-3 rounded-xl bg-[#2c2c2e] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/60">Brightness</span>
                    <span className="text-[10px] text-white/80">{imageFilters.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={imageFilters.brightness}
                    onChange={(e) => setImageFilter('brightness', Number(e.target.value))}
                    className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/60">Contrast</span>
                    <span className="text-[10px] text-white/80">{imageFilters.contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={imageFilters.contrast}
                    onChange={(e) => setImageFilter('contrast', Number(e.target.value))}
                    className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>
              )}

              {/* DETAILS Section */}
              <div className="space-y-2">
                <SectionLabel>Details</SectionLabel>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="px-2 py-1.5 rounded-lg bg-[#2c2c2e]">
                    <span className="text-white/30 block">Device</span>
                    <span className="text-white/60">Screenshot</span>
                  </div>
                  <div className="px-2 py-1.5 rounded-lg bg-[#2c2c2e]">
                    <span className="text-white/30 block">Screen pixels</span>
                    <span className="text-white/60">Adapts to media</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {contentKey === 'size' && (
            <div className="-mx-4 -mt-4">
              <AspectRatioPicker className="p-3 max-h-none overflow-visible" />
            </div>
          )}

          {contentKey === 'background' && <BackgroundSection />}
        </div>
      </div>

      {/* Templates Overlay */}
      <div
        className={cn(
          'absolute inset-0 z-50 bg-[#1c1c1e] flex flex-col transition-all duration-300',
          templatesOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <MagicWand01Icon size={16} className="text-white/60" />
            <h2 className="text-sm font-medium text-white/80">Templates</h2>
          </div>
          <button
            onClick={() => setTemplatesOpen(false)}
            className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Cancel01Icon size={16} className="text-white/50" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <PresetGallery />
          </div>
        </div>
      </div>
    </div>
  );
}
