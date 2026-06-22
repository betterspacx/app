'use client';

import * as React from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { PresetGallery } from '@/components/presets/PresetGallery';
import { MagicWand01Icon, Cancel01Icon } from 'hugeicons-react';
import { useImageStore } from '@/lib/store';

gsap.registerPlugin(useGSAP);

export function TemplatesPanel() {
  const { showTemplates, setShowTemplates } = useImageStore();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const isFirstRender = React.useRef(true);

  React.useEffect(() => {
    if (!showTemplates) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowTemplates(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTemplates, setShowTemplates]);

  useGSAP(
    () => {
      if (!panelRef.current) return;
      if (isFirstRender.current) {
        isFirstRender.current = false;
        gsap.set(panelRef.current, {
          width: showTemplates ? 488 : 0,
          opacity: showTemplates ? 1 : 0,
        });
        return;
      }
      if (showTemplates) {
        gsap.to(panelRef.current, {
          width: 488,
          opacity: 1,
          duration: 0.35,
          ease: 'power3.out',
        });
      } else {
        gsap.to(panelRef.current, {
          width: 0,
          opacity: 0,
          duration: 0.28,
          ease: 'power3.inOut',
        });
      }
    },
    { dependencies: [showTemplates], scope: panelRef }
  );

  return (
    <div
      ref={panelRef}
      className="h-screen shrink-0 relative flex flex-col"
      style={{
        willChange: 'width, opacity',
        contain: 'layout style size',
      }}
    >
      <div
        className="h-full w-[480px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-border/50"
        style={{
          pointerEvents: showTemplates ? 'auto' : 'none',
          marginTop: '4px',
          marginBottom: '4px',
          marginLeft: '4px',
        }}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <MagicWand01Icon size={16} className="text-white/60" />
            <h2 className="text-sm font-medium text-white/80">Templates</h2>
          </div>
          <button
            onClick={() => setShowTemplates(false)}
            className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Cancel01Icon size={16} className="text-white/50" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="p-4">
            <PresetGallery />
          </div>
        </div>
      </div>
    </div>
  );
}
