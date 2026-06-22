'use client';

import * as React from 'react';
import { useImageStore } from '@/lib/store';
import { useDropzone } from 'react-dropzone';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/lib/constants';
import { backgroundCategories } from '@/lib/r2-backgrounds';
import { gradientColors, type GradientKey } from '@/lib/constants/gradient-colors';
import { solidColors, type SolidColorKey } from '@/lib/constants/solid-colors';
import {
  meshGradients,
  magicGradients,
  type MeshGradientKey,
  type MagicGradientKey,
} from '@/lib/constants/mesh-gradients';
import { ColorPicker } from '@/components/ui/color-picker';
import { Cancel01Icon, Image01Icon, ShuffleIcon } from 'hugeicons-react';
import { cn } from '@/lib/utils';
import { CanvasThumbnail } from '@/components/ui/canvas-thumbnail';
import { preloadImages } from '@/hooks/useLazyImage';

function SectionLabel({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-medium uppercase tracking-wide text-white/40">{children}</span>
      {action}
    </div>
  );
}

// Shadow overlay IDs
const OVERLAY_SHADOW_IDS = [
  '023',
  '001',
  '002',
  '007',
  '017',
  '019',
  '031',
  '037',
  '041',
  '050',
  '053',
  '057',
  '063',
  '064',
  '082',
  '083',
  '088',
  '097',
  '099',
];
const OVERLAY_SHADOW_URLS = OVERLAY_SHADOW_IDS.map((id) => `/overlay-shadow/${id}.webp`);

const CATEGORY_ORDER = ['assets', 'mac', 'radiant', 'mesh', 'raycast', 'paper', 'pattern'] as const;
const CATEGORY_LABELS: Record<string, string> = {
  assets: 'Abstract',
  mac: 'macOS',
  radiant: 'Radiant',
  mesh: 'Mesh',
  raycast: 'Raycast',
  paper: 'Paper',
  pattern: 'Pattern',
};

export function BackgroundSection() {
  const {
    backgroundConfig,
    imageOverlays,
    setBackgroundType,
    setBackgroundValue,
    addImageOverlay,
    removeImageOverlay,
  } = useImageStore();

  const [bgUploadError, setBgUploadError] = React.useState<string | null>(null);
  const [customColor, setCustomColor] = React.useState('#2b6fff');
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set());
  const [showAllMagicGradients, setShowAllMagicGradients] = React.useState(false);
  const [showAllGradients, setShowAllGradients] = React.useState(false);

  const GRADIENT_COLS = 5;
  const GRADIENT_DEFAULT_ROWS = 2;
  const GRADIENT_DEFAULT_COUNT = GRADIENT_COLS * GRADIENT_DEFAULT_ROWS;

  // Preload visible images on mount so the first paint of thumbnails is instant.
  React.useEffect(() => {
    const visible = CATEGORY_ORDER.flatMap((cat) => backgroundCategories[cat]?.slice(0, 4) ?? []);
    preloadImages(visible);
  }, []);

  const toggleCategory = (category: string) => {
    if (!expandedCategories.has(category)) {
      // Expanding — preload remaining images of this category immediately
      const allImages = backgroundCategories[category] || [];
      const remaining = allImages.slice(4);
      if (remaining.length > 0) {
        preloadImages(remaining, 8);
      }
    }
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const customBgType = React.useMemo(() => {
    if (backgroundConfig.type === 'solid' && backgroundConfig.value === 'transparent') {
      return 'transparent';
    }
    if (backgroundConfig.type === 'solid' && backgroundConfig.value?.startsWith('#')) {
      return 'color';
    }
    if (backgroundConfig.type === 'solid' && backgroundConfig.value?.startsWith('rgba')) {
      return 'color';
    }
    if (backgroundConfig.type === 'image' && backgroundConfig.value?.startsWith('blob:')) {
      return 'image';
    }
    return null;
  }, [backgroundConfig]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return `File type not supported. Please use: PNG, JPG, WEBP`;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return `File size too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB`;
    }
    return null;
  };

  const onBgDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const validationError = validateFile(file);
        if (validationError) {
          setBgUploadError(validationError);
          return;
        }
        setBgUploadError(null);
        const blobUrl = URL.createObjectURL(file);
        setBackgroundValue(blobUrl);
        setBackgroundType('image');
      }
    },
    [setBackgroundValue, setBackgroundType]
  );

  const {
    getRootProps: getBgRootProps,
    getInputProps: getBgInputProps,
    isDragActive: isBgDragActive,
  } = useDropzone({
    onDrop: onBgDrop,
    accept: { 'image/*': ALLOWED_IMAGE_TYPES.map((type) => `.${type.split('/')[1]}`) },
    maxSize: MAX_IMAGE_SIZE,
    multiple: false,
  });

  const handleAddShadow = (shadowUrl: string) => {
    imageOverlays.forEach((overlay) => {
      if (typeof overlay.src === 'string' && overlay.src.includes('overlay-shadow')) {
        removeImageOverlay(overlay.id);
      }
    });
    addImageOverlay({
      src: shadowUrl,
      position: { x: 960, y: 540 },
      size: 1920,
      rotation: 0,
      opacity: 0.5,
      flipX: false,
      flipY: false,
      isVisible: true,
    });
  };

  const handleRemoveShadows = () => {
    imageOverlays.forEach((overlay) => {
      if (typeof overlay.src === 'string' && overlay.src.includes('overlay-shadow')) {
        removeImageOverlay(overlay.id);
      }
    });
  };

  const currentShadow = imageOverlays.find(
    (overlay) => typeof overlay.src === 'string' && overlay.src.includes('overlay-shadow')
  );

  const shuffleMagicGradient = () => {
    const keys = Object.keys(magicGradients) as MagicGradientKey[];
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    setBackgroundType('gradient');
    setBackgroundValue(`magic:${randomKey}`);
  };

  const shuffleRandomBackground = () => {
    const allBackgrounds = Object.values(backgroundCategories).flat();
    if (allBackgrounds.length === 0) return;
    const randomBg = allBackgrounds[Math.floor(Math.random() * allBackgrounds.length)];
    setBackgroundValue(randomBg);
    setBackgroundType('image');
  };

  const handleSelectImage = (path: string) => {
    setBackgroundValue(path);
    setBackgroundType('image');
  };

  const availableCategories = CATEGORY_ORDER.filter((cat) => backgroundCategories[cat]?.length > 0);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <SectionLabel>Light & Shadow</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleRemoveShadows}
            className={cn(
              'aspect-[16/9] flex items-center justify-center text-xs font-medium rounded-lg border transition-all cursor-pointer',
              !currentShadow
                ? 'border-primary/50 text-foreground bg-primary/5'
                : 'border-dashed border-white/10 text-white/40 hover:border-white/30 hover:bg-white/5'
            )}
          >
            None
          </button>
          {OVERLAY_SHADOW_URLS.slice(0, 11).map((shadowUrl, index) => (
            <button
              key={index}
              onClick={() => handleAddShadow(shadowUrl)}
              className={cn(
                'aspect-[16/9] rounded-lg overflow-hidden border transition-all bg-[#2c2c2e] cursor-pointer',
                currentShadow?.src === shadowUrl
                  ? 'border-primary/50 ring-1 ring-primary/30'
                  : 'border-white/10 hover:border-white/30'
              )}
            >
              <img src={shadowUrl} alt={`Shadow ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <SectionLabel>Custom Background</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          <div
            {...getBgRootProps()}
            className={cn(
              'flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-lg border cursor-pointer transition-all',
              customBgType === 'image'
                ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
                : 'border-white/10 bg-[#2c2c2e] hover:bg-[#323234] hover:border-white/30'
            )}
          >
            <input {...getBgInputProps()} />
            <div
              className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center',
                customBgType === 'image' ? 'bg-primary/10' : 'bg-[#3a3a3c]'
              )}
            >
              <Image01Icon size={14} className={customBgType === 'image' ? 'text-primary' : 'text-white/40'} />
            </div>
            <span
              className={cn('text-[10px] font-medium', customBgType === 'image' ? 'text-foreground' : 'text-white/40')}
            >
              Image
            </span>
          </div>

          <ColorPicker
            color={customColor}
            onChange={(newColor) => {
              setCustomColor(newColor);
              setBackgroundType('solid');
              setBackgroundValue(newColor);
            }}
            className={cn(
              'flex flex-col items-center justify-center gap-1.5 py-2.5 h-auto rounded-lg',
              customBgType === 'color'
                ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
                : 'border-white/10 bg-[#2c2c2e] hover:bg-[#323234] hover:border-white/30'
            )}
          />

          <button
            onClick={() => {
              setBackgroundType('solid');
              setBackgroundValue('transparent');
            }}
            className={cn(
              'flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-lg border transition-all cursor-pointer',
              customBgType === 'transparent'
                ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
                : 'border-white/10 bg-[#2c2c2e] hover:bg-[#323234] hover:border-white/30'
            )}
          >
            <div
              className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center',
                customBgType === 'transparent' ? 'bg-primary/10' : 'bg-[#3a3a3c]'
              )}
            >
              <div
                className="w-3.5 h-3.5 rounded-full border border-white/20"
                style={{
                  background: 'repeating-conic-gradient(#808080 0% 25%, #fff 0% 50%) 50% / 6px 6px',
                }}
              />
            </div>
            <span
              className={cn(
                'text-[10px] font-medium',
                customBgType === 'transparent' ? 'text-foreground' : 'text-white/40'
              )}
            >
              Transparent
            </span>
          </button>
        </div>
        {bgUploadError && <p className="text-xs text-destructive mt-2">{bgUploadError}</p>}

        {backgroundConfig.type === 'image' && backgroundConfig.value?.startsWith('blob:') && (
          <div className="relative rounded-lg overflow-hidden border border-white/10 aspect-video bg-[#2c2c2e] mt-2">
            <img src={backgroundConfig.value} alt="Background" className="w-full h-full object-cover" />
            <button
              className="absolute top-2 right-2 p-1 rounded-md bg-black/50 text-white hover:bg-destructive transition-colors cursor-pointer"
              onClick={() => {
                setBackgroundType('gradient');
                setBackgroundValue('vibrant_orange_pink');
                URL.revokeObjectURL(backgroundConfig.value);
              }}
            >
              <Cancel01Icon size={14} />
            </button>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <SectionLabel
          action={
            <button
              onClick={(e) => {
                e.stopPropagation();
                shuffleRandomBackground();
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#2c2c2e] hover:bg-[#3a3a3c] border border-white/10 transition-colors cursor-pointer"
            >
              <span className="text-[9px] text-white/50 font-medium">SHUFFLE</span>
              <ShuffleIcon size={10} className="text-white/50" />
            </button>
          }
        >
          Magic Background
        </SectionLabel>
        <div className="grid grid-cols-4 gap-2">
          {availableCategories.slice(0, 4).map((category) => {
            const firstImage = backgroundCategories[category]?.[0];
            if (!firstImage) return null;
            return (
              <button
                key={category}
                onClick={() => handleSelectImage(firstImage)}
                className={cn(
                  'aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 relative cursor-pointer',
                  backgroundConfig.value === firstImage ? 'border-primary' : 'border-transparent hover:border-white/30'
                )}
                title={CATEGORY_LABELS[category] || category}
              >
                <CanvasThumbnail src={firstImage} className="w-full h-full" />
              </button>
            );
          })}
        </div>
      </div>
      {availableCategories.map((category) => {
        const allImages = backgroundCategories[category] || [];
        const isExpanded = expandedCategories.has(category);
        const visibleImages = isExpanded ? allImages : allImages.slice(0, 4);
        const hiddenCount = allImages.length - 4;

        return (
          <div key={category} className="space-y-2">
            <SectionLabel>{CATEGORY_LABELS[category] || category}</SectionLabel>
            <div className="grid grid-cols-4 gap-2">
              {visibleImages.map((imagePath: string, idx: number) => (
                <button
                  key={`${category}-${idx}`}
                  onClick={() => handleSelectImage(imagePath)}
                  className={cn(
                    'aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 relative cursor-pointer',
                    backgroundConfig.value === imagePath ? 'border-primary' : 'border-transparent hover:border-white/30'
                  )}
                >
                  <CanvasThumbnail
                    src={imagePath}
                    className="w-full h-full"
                    isSelected={backgroundConfig.value === imagePath && backgroundConfig.type === 'image'}
                  />
                </button>
              ))}
              {!isExpanded && hiddenCount > 0 && (
                <button
                  onClick={() => toggleCategory(category)}
                  className="aspect-square rounded-lg overflow-hidden border border-dashed border-white/10 bg-[#2c2c2e] hover:bg-[#323234] transition-all flex items-center justify-center cursor-pointer"
                >
                  <span className="text-[10px] text-white/40 font-medium">+{hiddenCount}</span>
                </button>
              )}
            </div>
            {isExpanded && hiddenCount > 0 && (
              <button
                onClick={() => toggleCategory(category)}
                className="w-full py-1 text-[10px] text-white/40 hover:text-white/70 transition-colors text-center cursor-pointer"
              >
                Show less
              </button>
            )}
          </div>
        );
      })}
      <div className="space-y-2">
        <SectionLabel
          action={
            <button
              onClick={(e) => {
                e.stopPropagation();
                shuffleMagicGradient();
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#2c2c2e] hover:bg-[#3a3a3c] border border-white/10 transition-colors cursor-pointer"
            >
              <span className="text-[9px] text-white/50 font-medium">SHUFFLE</span>
              <ShuffleIcon size={10} className="text-white/50" />
            </button>
          }
        >
          Magic Gradients
        </SectionLabel>
        <div className="grid grid-cols-5 gap-1.5">
          {(Object.keys(magicGradients) as MagicGradientKey[])
            .slice(0, showAllMagicGradients ? undefined : GRADIENT_DEFAULT_COUNT)
            .map((key) => (
              <button
                key={`magic-${key}`}
                onClick={() => {
                  setBackgroundType('gradient');
                  setBackgroundValue(`magic:${key}`);
                }}
                className={cn(
                  'aspect-square rounded-lg cursor-pointer transition-all duration-200 border-2 hover:scale-105',
                  backgroundConfig.value === `magic:${key}`
                    ? 'border-primary ring-1 ring-primary/30'
                    : 'border-transparent hover:border-white/20'
                )}
                style={{
                  background: magicGradients[key],
                }}
              />
            ))}
        </div>
        {Object.keys(magicGradients).length > GRADIENT_DEFAULT_COUNT && (
          <button
            onClick={() => setShowAllMagicGradients(!showAllMagicGradients)}
            className="w-full py-1 text-[10px] text-white/40 hover:text-white/70 transition-colors text-center cursor-pointer"
          >
            {showAllMagicGradients
              ? 'Show less'
              : `+${Object.keys(magicGradients).length - GRADIENT_DEFAULT_COUNT} more`}
          </button>
        )}
      </div>
      <div className="space-y-2">
        <SectionLabel>Gradients</SectionLabel>
        <div className="grid grid-cols-5 gap-1.5">
          {(() => {
            const classicKeys = Object.keys(gradientColors) as GradientKey[];
            const meshKeys = Object.keys(meshGradients) as MeshGradientKey[];
            const allKeys = [
              ...classicKeys.map((k) => ({ type: 'classic' as const, key: k })),
              ...meshKeys.map((k) => ({ type: 'mesh' as const, key: k })),
            ];
            const visibleKeys = showAllGradients ? allKeys : allKeys.slice(0, GRADIENT_DEFAULT_COUNT);
            return visibleKeys.map(({ type, key }) => {
              const isClassic = type === 'classic';
              const bg = isClassic ? gradientColors[key as GradientKey] : meshGradients[key as MeshGradientKey];
              const value = isClassic ? key : `mesh:${key}`;
              const isSelected = backgroundConfig.value === value;
              return (
                <button
                  key={`${type}-${key}`}
                  onClick={() => {
                    setBackgroundType('gradient');
                    setBackgroundValue(value);
                  }}
                  className={cn(
                    'aspect-square rounded-lg cursor-pointer transition-all duration-200 border-2 hover:scale-105',
                    isSelected ? 'border-primary ring-1 ring-primary/30' : 'border-transparent hover:border-white/20'
                  )}
                  style={{ background: bg }}
                />
              );
            });
          })()}
        </div>
        {Object.keys(gradientColors).length + Object.keys(meshGradients).length > GRADIENT_DEFAULT_COUNT && (
          <button
            onClick={() => setShowAllGradients(!showAllGradients)}
            className="w-full py-1 text-[10px] text-white/40 hover:text-white/70 transition-colors text-center cursor-pointer"
          >
            {showAllGradients
              ? 'Show less'
              : `+${Object.keys(gradientColors).length + Object.keys(meshGradients).length - GRADIENT_DEFAULT_COUNT} more`}
          </button>
        )}
      </div>
    </div>
  );
}
