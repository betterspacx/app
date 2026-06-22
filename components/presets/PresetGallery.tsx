// Modified by konlyzx (2026) - Zero-lag CSS template previews and atomic preset application
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

'use client';

import * as React from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useImageStore } from '@/lib/store';
import { presets, type PresetCategory, type PresetConfig } from '@/lib/constants/presets';
import { cn } from '@/lib/utils';
import { useCustomPresets } from '@/hooks/useCustomPresets';
import { Delete02Icon } from 'hugeicons-react';

interface PresetGalleryProps {
  onPresetSelect?: (preset: PresetConfig) => void;
}

const PREVIEW_COUNT = 2;

const CATEGORY_ORDER: PresetCategory[] = ['Product Promotion', 'Abstract Shapes', 'Browser'];

const CATEGORY_LABELS: Record<PresetCategory, string> = {
  'Product Promotion': 'Product promotion',
  'Abstract Shapes': 'Abstract Shapes',
  Browser: 'Browser',
};

const StaticPresetThumbnail = React.memo(function StaticPresetThumbnail({ preset }: { preset: PresetConfig }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/8 aspect-[5/4]">
      <img
        src={preset.previewImage}
        alt={preset.name}
        loading="lazy"
        draggable={false}
        className="block w-full h-full object-cover"
      />

      {preset.isNew && (
        <span className="absolute right-2 top-2 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-black">
          New
        </span>
      )}
    </div>
  );
});

const PresetCardButton = React.memo(function PresetCardButton({
  preset,
  isActive,
  onApply,
}: {
  preset: PresetConfig;
  isActive: boolean;
  onApply: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onApply}
      className={cn(
        'group relative min-w-0 shrink-0 w-[200px] text-left outline-none cursor-pointer',
        'transition-transform duration-150 ease-out',
        'hover:-translate-y-0.5'
      )}
      aria-pressed={isActive}
    >
      <div className="relative rounded-xl overflow-hidden">
        <StaticPresetThumbnail preset={preset} />
        {isActive && (
          <div
            className="pointer-events-none absolute inset-0 rounded-xl"
            style={{ boxShadow: 'inset 0 0 0 2px hsl(var(--primary))' }}
          />
        )}
      </div>
      <div className="mt-2 px-1">
        <span className={cn('truncate text-xs font-medium', isActive ? 'text-white' : 'text-white/70')}>
          {preset.name}
        </span>
      </div>
    </button>
  );
});

gsap.registerPlugin(useGSAP);

const CategorySection = React.memo(function CategorySection({
  category,
  allPresets,
  activePresetId,
  expanded,
  onToggle,
  onApply,
}: {
  category: PresetCategory;
  allPresets: PresetConfig[];
  activePresetId: string | null;
  expanded: boolean;
  onToggle: () => void;
  onApply: (preset: PresetConfig) => void;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isFirstRender = React.useRef(true);
  const previewPresets = allPresets.slice(0, PREVIEW_COUNT);
  const extraPresets = allPresets.slice(PREVIEW_COUNT);
  const hasMore = extraPresets.length > 0;

  useGSAP(
    () => {
      if (!containerRef.current) return;
      if (isFirstRender.current) {
        isFirstRender.current = false;
        gsap.set(containerRef.current, { height: 0, opacity: 0 });
        return;
      }
      if (expanded) {
        gsap.to(containerRef.current, {
          height: 'auto',
          opacity: 1,
          duration: 0.35,
          ease: 'power3.out',
        });
      } else {
        gsap.to(containerRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.28,
          ease: 'power3.inOut',
        });
      }
    },
    { dependencies: [expanded], scope: containerRef }
  );

  return (
    <section id={`preset-category-${category}`} className="space-y-3 scroll-mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-white/86">{CATEGORY_LABELS[category]}</h3>
        {hasMore && (
          <button
            type="button"
            onClick={onToggle}
            className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/86 transition-colors hover:bg-white/16 cursor-pointer"
          >
            {expanded ? 'Hide' : 'See all'}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {previewPresets.map((preset) => (
          <PresetCardButton
            key={preset.id}
            preset={preset}
            isActive={activePresetId === preset.id}
            onApply={() => onApply(preset)}
          />
        ))}
      </div>

      {hasMore && (
        <div ref={containerRef} className="overflow-hidden">
          <div className="flex flex-wrap gap-3 pt-0">
            {extraPresets.map((preset) => (
              <PresetCardButton
                key={preset.id}
                preset={preset}
                isActive={activePresetId === preset.id}
                onApply={() => onApply(preset)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
});

export function PresetGallery({ onPresetSelect }: PresetGalleryProps) {
  const activePresetId = useImageStore((state) => state.activePresetId);
  const uploadedImageUrl = useImageStore((state) => state.uploadedImageUrl);
  const applyPresetConfig = useImageStore((state) => state.applyPresetConfig);
  const { customPresets, deletePreset } = useCustomPresets();
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>(
    Object.fromEntries(CATEGORY_ORDER.map((cat) => [cat, false]))
  );
  const [toast, setToast] = React.useState<string | null>(null);
  const toastRef = React.useRef<HTMLDivElement>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleCategory = React.useCallback((category: string) => {
    setExpanded((prev) => ({ ...prev, [category]: !prev[category] }));
  }, []);

  const showToast = React.useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }, []);

  const filteredPresetsByCategory = React.useMemo(() => {
    const map = new Map<PresetCategory, PresetConfig[]>();
    for (const cat of CATEGORY_ORDER) {
      const list = presets.filter((p) => p.category === cat);
      if (list.length) map.set(cat, list);
    }
    return map;
  }, []);

  const applyPreset = React.useCallback(
    (preset: PresetConfig) => {
      applyPresetConfig(preset);
      onPresetSelect?.(preset);
      showToast(`${preset.name} applied`);
    },
    [applyPresetConfig, onPresetSelect, showToast]
  );

  useGSAP(
    () => {
      if (!toastRef.current) return;
      if (toast) {
        gsap.fromTo(toastRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, ease: 'power3.out' });
      }
    },
    { dependencies: [toast] }
  );

  return (
    <div className="space-y-6 text-white">
      {customPresets.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/88">My Presets</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {customPresets.map((preset) => (
              <div key={preset.id} className="group relative">
                <PresetCardButton
                  preset={preset}
                  isActive={activePresetId === preset.id}
                  onApply={() => applyPreset(preset)}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePreset(preset.id);
                  }}
                  className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white/70 opacity-0 transition-opacity hover:text-white group-hover:opacity-100"
                  aria-label={`Delete ${preset.name}`}
                >
                  <Delete02Icon size={14} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {Array.from(filteredPresetsByCategory.entries()).map(([category, categoryPresets], idx) => (
        <React.Fragment key={category}>
          {idx > 0 && (
            <div
              className="h-px w-full"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0.12) 70%, transparent)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }}
            />
          )}
          <CategorySection
            category={category as PresetCategory}
            allPresets={categoryPresets}
            activePresetId={activePresetId}
            expanded={!!expanded[category]}
            onToggle={() => toggleCategory(category)}
            onApply={applyPreset}
          />
        </React.Fragment>
      ))}

      {!uploadedImageUrl && (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-center">
          <p className="text-xs text-white/50">Upload media to apply templates to the canvas.</p>
        </div>
      )}

      {toast && (
        <div
          ref={toastRef}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
