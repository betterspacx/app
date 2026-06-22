'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useImageStore } from '@/lib/store';
import { presets, type PresetConfig, type PresetCategory } from '@/lib/constants/presets';
import { getBackgroundCSS } from '@/lib/constants/backgrounds';
import { cn } from '@/lib/utils';
import { Grid02Icon, Image02Icon, PlayIcon } from 'hugeicons-react';

type FilterTab = 'all' | 'image' | 'animated';

const CATEGORY_ORDER: PresetCategory[] = ['Product Promotion', 'Abstract Shapes', 'Browser'];

const CATEGORY_LABELS: Record<PresetCategory, string> = {
  'Product Promotion': 'Product promotion',
  'Abstract Shapes': 'Abstract Shapes',
  Browser: 'Browser',
};

const aspectRatioLabel = (ratio: string) => {
  if (ratio === '1_1') return 'Square';
  if (ratio === '9_16') return 'Story';
  if (ratio === '16_9') return 'Landscape';
  if (ratio === '4_5') return 'Portrait';
  if (ratio === 'og_image') return 'OG';
  return ratio;
};

export function PresetSelector() {
  const {
    uploadedImageUrl,
    selectedAspectRatio,
    backgroundConfig,
    backgroundBorderRadius,
    backgroundBlur,
    backgroundNoise,
    borderRadius,
    imageOpacity,
    imageScale,
    imageBorder,
    imageShadow,
    setAspectRatio,
    setBackgroundConfig,
    setBackgroundType,
    setBackgroundValue,
    setBackgroundOpacity,
    setBorderRadius,
    setBackgroundBorderRadius,
    setBackgroundBlur,
    setBackgroundNoise,
    setImageOpacity,
    setImageScale,
    setImageBorder,
    setImageShadow,
    setPerspective3D,
  } = useImageStore();

  const [open, setOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<FilterTab>('all');
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>(
    Object.fromEntries(CATEGORY_ORDER.map((cat) => [cat, true]))
  );

  const filteredPresets = React.useMemo(() => {
    if (filter === 'all') return presets;
    if (filter === 'animated') return presets.filter((p) => p.animated);
    return presets.filter((p) => p.backgroundConfig.type === 'image');
  }, [filter]);

  const presetsByCategory = React.useMemo(() => {
    const map = new Map<PresetCategory, PresetConfig[]>();
    for (const cat of CATEGORY_ORDER) {
      const list = filteredPresets.filter((p) => p.category === cat);
      if (list.length) map.set(cat, list);
    }
    return map;
  }, [filteredPresets]);

  const isPresetActive = React.useCallback(
    (preset: PresetConfig) => {
      return (
        preset.aspectRatio === selectedAspectRatio &&
        preset.backgroundConfig.type === backgroundConfig.type &&
        preset.backgroundConfig.value === backgroundConfig.value &&
        preset.backgroundBorderRadius === backgroundBorderRadius &&
        preset.borderRadius === borderRadius &&
        preset.imageOpacity === imageOpacity &&
        preset.imageScale === imageScale &&
        preset.imageBorder.enabled === imageBorder.enabled &&
        preset.imageShadow.enabled === imageShadow.enabled &&
        (preset.backgroundBlur ?? 0) === backgroundBlur &&
        (preset.backgroundNoise ?? 0) === backgroundNoise
      );
    },
    [
      selectedAspectRatio,
      backgroundConfig,
      backgroundBorderRadius,
      backgroundBlur,
      backgroundNoise,
      borderRadius,
      imageOpacity,
      imageScale,
      imageBorder.enabled,
      imageShadow.enabled,
    ]
  );

  const applyPreset = React.useCallback(
    (preset: PresetConfig) => {
      setAspectRatio(preset.aspectRatio);
      setBackgroundConfig(preset.backgroundConfig);
      setBackgroundType(preset.backgroundConfig.type);
      setBackgroundValue(preset.backgroundConfig.value);
      setBackgroundOpacity(preset.backgroundConfig.opacity ?? 1);
      setBorderRadius(preset.borderRadius);
      setBackgroundBorderRadius(preset.backgroundBorderRadius);
      setImageOpacity(preset.imageOpacity);
      setImageScale(preset.imageScale);
      setImageBorder(preset.imageBorder);
      setImageShadow(preset.imageShadow);
      setBackgroundBlur(preset.backgroundBlur ?? 0);
      setBackgroundNoise(preset.backgroundNoise ?? 0);
      setPerspective3D(
        preset.perspective3D ?? {
          perspective: 200,
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
          translateX: 0,
          translateY: 0,
          scale: 1,
        }
      );
      setOpen(false);
    },
    [
      setAspectRatio,
      setBackgroundConfig,
      setBackgroundType,
      setBackgroundValue,
      setBackgroundOpacity,
      setBorderRadius,
      setBackgroundBorderRadius,
      setBackgroundBlur,
      setBackgroundNoise,
      setImageOpacity,
      setImageScale,
      setImageBorder,
      setImageShadow,
      setPerspective3D,
    ]
  );

  const tabs: { id: FilterTab; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All', icon: <Grid02Icon size={14} /> },
    { id: 'image', label: 'Image', icon: <Image02Icon size={14} /> },
    { id: 'animated', label: 'Animated', icon: <PlayIcon size={14} /> },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={!uploadedImageUrl}
          variant="outline"
          size="sm"
          className="w-full h-10 justify-center gap-2.5 rounded-lg bg-background hover:bg-accent text-foreground border border-border hover:border-border/80 transition-all duration-200 font-semibold text-sm px-3 overflow-hidden"
        >
          <span className="truncate">Presets</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0 overflow-hidden" align="start">
        <div className="p-4 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Templates</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Choose a preset to instantly style your showcase</p>
            </div>
          </div>
          <div className="flex gap-1 p-0.5 bg-muted rounded-lg">
            {tabs.map((tab) => {
              const active = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all cursor-pointer',
                    active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="space-y-5 max-h-[480px] overflow-y-auto pr-1 -mr-1">
            {Array.from(presetsByCategory.entries()).map(([category, categoryPresets]) => (
              <div key={category} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    {CATEGORY_LABELS[category]}
                  </h4>
                  <button
                    onClick={() => setExpanded((prev) => ({ ...prev, [category]: !prev[category] }))}
                    className="text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {expanded[category] ? 'Collapse' : 'See all'}
                  </button>
                </div>

                {expanded[category] && (
                  <div className="grid grid-cols-2 gap-3">
                    {categoryPresets.map((preset) => {
                      const active = isPresetActive(preset);
                      return (
                        <button
                          key={preset.id}
                          onClick={() => applyPreset(preset)}
                          className={cn(
                            'group relative w-full text-left rounded-xl border-2 transition-all cursor-pointer overflow-hidden',
                            active ? 'border-blue-500' : 'border-border hover:border-border/80'
                          )}
                        >
                          <div
                            className="relative aspect-[4/3] w-full overflow-hidden"
                            style={getBackgroundCSS(preset.backgroundConfig)}
                          >
                            {preset.previewImage && (
                              <img
                                src={preset.previewImage}
                                alt={preset.name}
                                loading="lazy"
                                draggable={false}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                              />
                            )}
                            {preset.animated && (
                              <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 bg-foreground/70 backdrop-blur-sm rounded text-[9px] text-background font-medium">
                                <PlayIcon size={10} />
                                Video
                              </div>
                            )}
                            {preset.isNew && (
                              <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-primary rounded text-[9px] text-primary-foreground font-medium">
                                New
                              </div>
                            )}
                            {active && <div className="absolute inset-0 bg-blue-500/10 border-inset" />}
                          </div>
                          <div className="p-2.5 bg-background">
                            <div className="font-medium text-xs text-foreground truncate">{preset.name}</div>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span className="text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                                {aspectRatioLabel(preset.aspectRatio)}
                              </span>
                              {preset.deviceType !== 'none' && (
                                <span className="text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground font-medium capitalize">
                                  {preset.deviceType}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {presetsByCategory.size === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No presets match the selected filter.</p>
              </div>
            )}
          </div>

          {!uploadedImageUrl && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground text-center">Upload an image to use presets</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
