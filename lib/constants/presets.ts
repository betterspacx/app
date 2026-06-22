import { AspectRatioKey } from './aspect-ratios';
import { BackgroundConfig } from './backgrounds';
import { ImageBorder, ImageShadow } from '@/lib/store';

export type PresetCategory = 'Product Promotion' | 'Abstract Shapes' | 'Browser';

export type PresetDeviceType = 'macbook' | 'imac' | 'iphone' | 'browser' | 'none';

export interface PresetTransformConfig {
  perspective: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  translateX: number;
  translateY: number;
  translateZ: number;
  scale: number;
  skewX: number;
  skewY: number;
}

export interface PresetContainerStyle {
  background: string;
  padding: number;
  borderRadius: number;
  backgroundBlur: number;
  backdropBlur: number;
  isolation: boolean;
}

export interface PresetMockupOverlay {
  kind: PresetDeviceType;
  frame: ImageBorder['type'];
  chrome: 'light' | 'dark' | 'glass' | 'none';
}

export interface PresetConfig {
  id: string;
  name: string;
  description: string;
  category: PresetCategory;
  aspectRatio: AspectRatioKey;
  backgroundConfig: BackgroundConfig;
  borderRadius: number;
  backgroundBorderRadius: number;
  imageOpacity: number;
  imageScale: number;
  imageBorder: ImageBorder;
  imageShadow: ImageShadow;
  backgroundBlur?: number;
  backgroundNoise?: number;
  perspective3D?: PresetTransformConfig;
  containerStyle: PresetContainerStyle;
  mockupOverlay: PresetMockupOverlay;
  shadowOverlay?: {
    src: string;
    opacity: number;
  };
  objectOverlays?: {
    src: string;
    x: number;
    y: number;
    size: number;
    rotation: number;
    opacity: number;
    layer?: 'front' | 'back';
    flipX?: boolean;
    flipY?: boolean;
  }[];
  previewImage: string;
  deviceType: PresetDeviceType;
  animated: boolean;
  isNew?: boolean;
}

const flatTransform: PresetTransformConfig = {
  perspective: 2400,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  translateX: 0,
  translateY: 0,
  translateZ: 0,
  scale: 1,
  skewX: 0,
  skewY: 0,
};

const containerStyle = (
  background: string,
  padding = 72,
  borderRadius = 0,
  backgroundBlur = 0,
  backdropBlur = 0
): PresetContainerStyle => ({
  background,
  padding,
  borderRadius,
  backgroundBlur,
  backdropBlur,
  isolation: true,
});

const mockupOverlay = (
  kind: PresetDeviceType,
  frame: ImageBorder['type'],
  chrome: PresetMockupOverlay['chrome']
): PresetMockupOverlay => ({ kind, frame, chrome });

export const presets: PresetConfig[] = [
  // 1. Spotlight - Dramatic dark with focused light
  {
    id: 'spotlight',
    name: 'Spotlight',
    description: 'Dramatic dark with focused attention',
    category: 'Product Promotion',
    aspectRatio: '5_4',
    previewImage: '/presets/preset-2.webp',
    deviceType: 'none',
    animated: false,
    containerStyle: {
      background: 'url(/raycast/blue_distortion_2.webp)',
      padding: 72,
      borderRadius: 10,
      backgroundBlur: 14,
      backdropBlur: 0,
      isolation: true,
    },
    mockupOverlay: {
      kind: 'none',
      frame: 'none',
      chrome: 'none',
    },
    backgroundConfig: {
      type: 'image',
      value: '/raycast/blue_distortion_2.webp',
      opacity: 1,
    },
    borderRadius: 10,
    backgroundBorderRadius: 10,
    imageOpacity: 1,
    imageScale: 100,
    imageBorder: {
      enabled: true,
      width: 8,
      color: '#000000',
      type: 'glass-dark',
      padding: 0.5,
      title: '',
      opacity: 0.4,
    },
    imageShadow: {
      enabled: false,
      blur: 0,
      offsetX: 0,
      offsetY: 0,
      spread: 0,
      color: 'rgba(0,0,0,0.6)',
      opacity: 0,
    },
    backgroundBlur: 14,
    backgroundNoise: 37,
    perspective3D: {
      perspective: 200,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      translateX: 16.7,
      translateY: 25.2,
      translateZ: 0,
      scale: 1.35,
      skewX: 0,
      skewY: 0,
    },
  },

  // Preset 1 - Vercel Ship travel case promo
  {
    id: '1',
    name: 'Vercel Ship',
    description: 'Vercel Ship travel case promo',
    category: 'Product Promotion',
    aspectRatio: '5_4',
    previewImage: '/presets/preset-1.webp',
    deviceType: 'browser',
    animated: false,
    containerStyle: containerStyle('url(/assets/asset-19.jpg)', 72, 10, 0, 0),
    mockupOverlay: mockupOverlay('browser', 'macos-dark', 'dark'),
    backgroundConfig: {
      type: 'image',
      value: '/assets/asset-19.jpg',
      opacity: 1,
    },
    borderRadius: 10,
    backgroundBorderRadius: 10,
    imageOpacity: 1,
    imageScale: 100,
    imageBorder: {
      enabled: true,
      width: 8,
      color: '#000000',
      type: 'macos-dark',
      padding: 20,
      title: '',
    },
    imageShadow: {
      enabled: true,
      blur: 30,
      offsetX: 0,
      offsetY: 12,
      spread: 5,
      color: 'rgba(0,0,0,0.6)',
      opacity: 0.5,
    },
    backgroundBlur: 0,
    backgroundNoise: 0,
    perspective3D: {
      perspective: 200,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      translateX: 0,
      translateY: 0,
      translateZ: 0,
      scale: 1,
      skewX: 0,
      skewY: 0,
    },
  },

  // 7. Sunset Fade - Warm gradient vibes
  {
    id: 'sunset-fade',
    name: 'Sunset Fade',
    description: 'Warm tones for lifestyle content',
    category: 'Product Promotion',
    aspectRatio: '16_9',
    previewImage: '/demo/demo-8.png',
    deviceType: 'none',
    animated: false,
    containerStyle: {
      background: 'url(/pattern/9.webp)',
      padding: 72,
      borderRadius: 10,
      backgroundBlur: 10,
      backdropBlur: 0,
      isolation: true,
    },
    mockupOverlay: {
      kind: 'none',
      frame: 'none',
      chrome: 'none',
    },
    backgroundConfig: {
      type: 'image',
      value: '/pattern/9.webp',
      opacity: 1,
    },
    borderRadius: 10,
    backgroundBorderRadius: 10,
    imageOpacity: 1,
    imageScale: 100,
    imageBorder: {
      enabled: true,
      width: 8,
      color: '#000000',
      type: 'glass-light',
      padding: 1,
      title: '',
      opacity: 0.25,
    },
    imageShadow: {
      enabled: true,
      blur: 15,
      offsetX: 5,
      offsetY: 8,
      spread: 3,
      color: 'rgba(0, 0, 0, 0.6)',
      opacity: 0.5,
    },
    backgroundBlur: 10,
    backgroundNoise: 35,
    perspective3D: {
      perspective: 200,
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      translateX: 0,
      translateY: 0,
      translateZ: 0,
      scale: 1,
      skewX: 0,
      skewY: 0,
    },
  },

  // 6. Aurora - Floating sphere with mesh gradient and glass frame
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Floating sphere with mesh gradient and glass frame',
    category: 'Abstract Shapes',
    aspectRatio: '16_9',
    previewImage: '/mesh/Bliss.webp',
    deviceType: 'browser',
    animated: true,
    isNew: true,
    containerStyle: containerStyle(
      'radial-gradient(ellipse at 20% 80%, rgba(99,102,241,0.25), transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(236,72,153,0.2), transparent 50%), #0f0f1a',
      64,
      24,
      10,
      16
    ),
    mockupOverlay: mockupOverlay('browser', 'glass-light', 'glass'),
    backgroundConfig: {
      type: 'image',
      value: '/mesh/Bliss.webp',
      opacity: 1,
    },
    borderRadius: 20,
    backgroundBorderRadius: 24,
    imageOpacity: 1,
    imageScale: 78,
    imageBorder: {
      enabled: true,
      width: 6,
      color: 'rgba(255,255,255,0.18)',
      type: 'arc-light',
    },
    imageShadow: {
      enabled: true,
      blur: 64,
      offsetX: 0,
      offsetY: 28,
      spread: -12,
      color: 'rgba(99, 102, 241, 0.35)',
      opacity: 0.55,
    },
    backgroundBlur: 8,
    backgroundNoise: 25,
    shadowOverlay: {
      src: '/overlay-shadow/037.webp',
      opacity: 0.3,
    },
    objectOverlays: [
      {
        src: '/overlay/Sphere-Black_J0R1G4FTa.webp',
        x: 940,
        y: 120,
        size: 180,
        rotation: 0,
        opacity: 0.85,
        layer: 'back',
      },
      {
        src: '/overlay/Circle1-Blue_FcSXRpwI5.webp',
        x: 80,
        y: 500,
        size: 140,
        rotation: -20,
        opacity: 0.65,
        layer: 'front',
        flipX: true,
      },
    ],
    perspective3D: {
      ...flatTransform,
      perspective: 1600,
      rotateX: 6,
      rotateY: 14,
      rotateZ: 0,
      translateY: 0,
      scale: 0.82,
    },
  },

  // 7. Sunset Glow - Cube on radiant with bold 3D tilt
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    description: '3D cube on warm radiant with bold perspective tilt',
    category: 'Abstract Shapes',
    aspectRatio: '5_4',
    previewImage: '/radiant/radiant1.jpg',
    deviceType: 'none',
    animated: true,
    isNew: true,
    containerStyle: containerStyle(
      'linear-gradient(180deg, rgba(255,140,66,0.25), rgba(255,62,108,0.18)), rgba(20,12,8,0.9)',
      56,
      20,
      6,
      8
    ),
    mockupOverlay: mockupOverlay('none', 'none', 'none'),
    backgroundConfig: {
      type: 'image',
      value: '/radiant/radiant1.jpg',
      opacity: 1,
    },
    borderRadius: 16,
    backgroundBorderRadius: 20,
    imageOpacity: 1,
    imageScale: 72,
    imageBorder: {
      enabled: true,
      width: 4,
      color: 'rgba(255,255,255,0.25)',
      type: 'arc-light',
    },
    imageShadow: {
      enabled: true,
      blur: 55,
      offsetX: 0,
      offsetY: 24,
      spread: -8,
      color: 'rgba(200, 80, 40, 0.45)',
      opacity: 0.6,
    },
    backgroundBlur: 6,
    backgroundNoise: 20,
    shadowOverlay: {
      src: '/overlay-shadow/050.webp',
      opacity: 0.4,
    },
    objectOverlays: [
      {
        src: '/overlay/Cube-Blue_5neS6XLEm.webp',
        x: 720,
        y: 140,
        size: 180,
        rotation: -15,
        opacity: 0.95,
        layer: 'front',
        flipX: true,
      },
      {
        src: '/overlay/Cone-Black_MA6nEafnH.webp',
        x: 80,
        y: 560,
        size: 120,
        rotation: 12,
        opacity: 0.75,
        layer: 'back',
      },
    ],
    perspective3D: {
      ...flatTransform,
      perspective: 1400,
      rotateX: 10,
      rotateY: -16,
      rotateZ: 0,
      translateY: 2,
      scale: 0.76,
    },
  },

  // 8. Chromatic - Torus on dark raycast with neon edge
  {
    id: 'chromatic',
    name: 'Chromatic',
    description: 'Torus knot on dark chromatic with neon glow and blur',
    category: 'Abstract Shapes',
    aspectRatio: '16_9',
    previewImage: '/raycast/chromatic_dark_1.webp',
    deviceType: 'browser',
    animated: true,
    isNew: true,
    containerStyle: containerStyle(
      'radial-gradient(circle at 50% 40%, rgba(124,77,255,0.18), transparent 55%), radial-gradient(circle at 80% 80%, rgba(236,72,153,0.1), transparent 50%), #0a0a12',
      64,
      20,
      8,
      12
    ),
    mockupOverlay: mockupOverlay('browser', 'arc-dark', 'dark'),
    backgroundConfig: {
      type: 'image',
      value: '/raycast/chromatic_dark_1.webp',
      opacity: 1,
    },
    borderRadius: 16,
    backgroundBorderRadius: 20,
    imageOpacity: 1,
    imageScale: 80,
    imageBorder: {
      enabled: true,
      width: 6,
      color: 'rgba(124,77,255,0.3)',
      type: 'arc-dark',
    },
    imageShadow: {
      enabled: true,
      blur: 56,
      offsetX: 0,
      offsetY: 24,
      spread: -8,
      color: '#4c1d95',
      opacity: 0.5,
    },
    backgroundBlur: 6,
    backgroundNoise: 15,
    shadowOverlay: {
      src: '/overlay-shadow/097.webp',
      opacity: 0.3,
    },
    objectOverlays: [
      { src: '/overlay/Torus-Knot-Black.webp', x: 920, y: 140, size: 170, rotation: 25, opacity: 0.9, layer: 'front' },
      {
        src: '/overlay/Icosahedron-Black.webp',
        x: 90,
        y: 470,
        size: 110,
        rotation: -18,
        opacity: 0.65,
        layer: 'back',
        flipY: true,
      },
    ],
    perspective3D: {
      ...flatTransform,
      perspective: 1600,
      rotateX: 8,
      rotateY: 18,
      rotateZ: 0,
      translateY: 0,
      scale: 0.82,
    },
  },

  // 9. Prism - Hemisphere on paper texture with soft 3D depth
  {
    id: 'prism',
    name: 'Prism',
    description: 'Hemisphere on paper texture with soft 3D depth and blur',
    category: 'Abstract Shapes',
    aspectRatio: '1_1',
    previewImage: '/paper/01.webp',
    deviceType: 'none',
    animated: true,
    isNew: true,
    containerStyle: containerStyle('#f5f0e8', 56, 28, 4, 8),
    mockupOverlay: mockupOverlay('none', 'none', 'none'),
    backgroundConfig: {
      type: 'image',
      value: '/paper/01.webp',
      opacity: 1,
    },
    borderRadius: 20,
    backgroundBorderRadius: 28,
    imageOpacity: 1,
    imageScale: 74,
    imageBorder: {
      enabled: true,
      width: 4,
      color: 'rgba(0,0,0,0.12)',
      type: 'arc-light',
    },
    imageShadow: {
      enabled: true,
      blur: 40,
      offsetX: 0,
      offsetY: 20,
      spread: -5,
      color: 'rgba(60, 40, 20, 0.3)',
      opacity: 0.5,
    },
    backgroundBlur: 4,
    backgroundNoise: 35,
    shadowOverlay: {
      src: '/overlay-shadow/023.webp',
      opacity: 0.3,
    },
    objectOverlays: [
      { src: '/overlay/Hemisphere-Black.webp', x: 600, y: 120, size: 160, rotation: 0, opacity: 0.9, layer: 'front' },
      {
        src: '/overlay/Cylinder-Black.webp',
        x: 100,
        y: 580,
        size: 120,
        rotation: 30,
        opacity: 0.7,
        layer: 'back',
        flipX: true,
      },
      { src: '/overlay/Pill-Black.webp', x: 620, y: 600, size: 110, rotation: -35, opacity: 0.55, layer: 'back' },
    ],
    perspective3D: {
      ...flatTransform,
      perspective: 1800,
      rotateX: 6,
      rotateY: -14,
      rotateZ: 0,
      translateY: 0,
      scale: 0.78,
    },
  },

  // Browser 1 - Safari Light on bright mesh
  {
    id: 'browser-safari',
    name: 'Safari',
    description: 'Safari browser on bright mesh gradient with sphere accent',
    category: 'Browser',
    aspectRatio: '16_9',
    previewImage: '/mesh/Bliss.webp',
    deviceType: 'browser',
    animated: true,
    isNew: true,
    containerStyle: containerStyle(
      'radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.15), transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(236,72,153,0.1), transparent 50%), #f0f0f5',
      64,
      16,
      6,
      10
    ),
    mockupOverlay: mockupOverlay('browser', 'macos-light', 'light'),
    backgroundConfig: {
      type: 'image',
      value: '/mesh/Bliss.webp',
      opacity: 1,
    },
    borderRadius: 12,
    backgroundBorderRadius: 16,
    imageOpacity: 1,
    imageScale: 82,
    imageBorder: {
      enabled: true,
      width: 8,
      color: 'rgba(0,0,0,0.1)',
      type: 'macos-light',
      padding: 2,
      title: '',
    },
    imageShadow: {
      enabled: true,
      blur: 50,
      offsetX: 0,
      offsetY: 24,
      spread: -10,
      color: 'rgba(0, 0, 0, 0.25)',
      opacity: 0.5,
    },
    backgroundBlur: 8,
    backgroundNoise: 15,
    shadowOverlay: {
      src: '/overlay-shadow/031.webp',
      opacity: 0.25,
    },
    objectOverlays: [
      {
        src: '/overlay/Sphere-Black_J0R1G4FTa.webp',
        x: 930,
        y: 120,
        size: 150,
        rotation: 0,
        opacity: 0.75,
        layer: 'back',
      },
    ],
    perspective3D: {
      ...flatTransform,
      perspective: 2000,
      rotateX: 6,
      rotateY: -10,
      rotateZ: 0,
      translateY: 0,
      scale: 0.84,
    },
  },

  // Browser 2 - Safari Dark on dark raycast
  {
    id: 'browser-safari-dark',
    name: 'Safari Dark',
    description: 'Safari dark browser on dark raycast with torus knot accent',
    category: 'Browser',
    aspectRatio: '16_9',
    previewImage: '/raycast/chromatic_dark_1.webp',
    deviceType: 'browser',
    animated: true,
    isNew: true,
    containerStyle: containerStyle(
      'radial-gradient(circle at 50% 40%, rgba(124,77,255,0.15), transparent 55%), #0a0a12',
      64,
      16,
      6,
      10
    ),
    mockupOverlay: mockupOverlay('browser', 'macos-dark', 'dark'),
    backgroundConfig: {
      type: 'image',
      value: '/raycast/chromatic_dark_1.webp',
      opacity: 1,
    },
    borderRadius: 12,
    backgroundBorderRadius: 16,
    imageOpacity: 1,
    imageScale: 82,
    imageBorder: {
      enabled: true,
      width: 8,
      color: '#1a1a1a',
      type: 'macos-dark',
      padding: 2,
      title: '',
    },
    imageShadow: {
      enabled: true,
      blur: 55,
      offsetX: 0,
      offsetY: 26,
      spread: -10,
      color: 'rgba(80, 50, 200, 0.4)',
      opacity: 0.55,
    },
    backgroundBlur: 10,
    backgroundNoise: 20,
    shadowOverlay: {
      src: '/overlay-shadow/063.webp',
      opacity: 0.35,
    },
    objectOverlays: [
      { src: '/overlay/Torus-Knot-Black.webp', x: 920, y: 130, size: 150, rotation: 20, opacity: 0.85, layer: 'front' },
      { src: '/overlay/Icosahedron-Black.webp', x: 90, y: 460, size: 110, rotation: -15, opacity: 0.6, layer: 'back' },
    ],
    perspective3D: {
      ...flatTransform,
      perspective: 2000,
      rotateX: 8,
      rotateY: 12,
      rotateZ: 0,
      translateY: 0,
      scale: 0.82,
    },
  },

  // Browser 3 - Chrome Light on warm radiant
  {
    id: 'browser-chrome',
    name: 'Chrome',
    description: 'Chrome browser on warm radiant with cube accent',
    category: 'Browser',
    aspectRatio: '5_4',
    previewImage: '/radiant/radiant2.jpg',
    deviceType: 'browser',
    animated: true,
    isNew: true,
    containerStyle: containerStyle(
      'linear-gradient(180deg, rgba(255,180,80,0.15), rgba(255,100,60,0.1)), rgba(25,18,12,0.9)',
      56,
      16,
      6,
      8
    ),
    mockupOverlay: mockupOverlay('browser', 'windows-light', 'light'),
    backgroundConfig: {
      type: 'image',
      value: '/radiant/radiant2.jpg',
      opacity: 1,
    },
    borderRadius: 10,
    backgroundBorderRadius: 14,
    imageOpacity: 1,
    imageScale: 80,
    imageBorder: {
      enabled: true,
      width: 8,
      color: 'rgba(0,0,0,0.08)',
      type: 'windows-light',
      padding: 2,
      title: '',
    },
    imageShadow: {
      enabled: true,
      blur: 45,
      offsetX: 0,
      offsetY: 22,
      spread: -8,
      color: 'rgba(200, 100, 40, 0.35)',
      opacity: 0.5,
    },
    backgroundBlur: 8,
    backgroundNoise: 18,
    shadowOverlay: {
      src: '/overlay-shadow/041.webp',
      opacity: 0.3,
    },
    objectOverlays: [
      {
        src: '/overlay/Cube-Blue_5neS6XLEm.webp',
        x: 730,
        y: 120,
        size: 150,
        rotation: -12,
        opacity: 0.9,
        layer: 'front',
        flipX: true,
      },
      {
        src: '/overlay/Cone-Black_MA6nEafnH.webp',
        x: 80,
        y: 560,
        size: 110,
        rotation: 10,
        opacity: 0.7,
        layer: 'back',
      },
    ],
    perspective3D: {
      ...flatTransform,
      perspective: 1800,
      rotateX: 8,
      rotateY: -14,
      rotateZ: 0,
      translateY: 0,
      scale: 0.8,
    },
  },

  // Browser 4 - Chrome Dark on dark mesh
  {
    id: 'browser-chrome-dark',
    name: 'Chrome Dark',
    description: 'Chrome dark browser on dark mesh with hemisphere accent',
    category: 'Browser',
    aspectRatio: '1_1',
    previewImage: '/mesh/Horizon.webp',
    deviceType: 'browser',
    animated: true,
    isNew: true,
    containerStyle: containerStyle(
      'radial-gradient(circle at 30% 30%, rgba(99,102,241,0.18), transparent 50%), radial-gradient(circle at 70% 70%, rgba(236,72,153,0.12), transparent 50%), #0f0f18',
      56,
      20,
      8,
      12
    ),
    mockupOverlay: mockupOverlay('browser', 'windows-dark', 'dark'),
    backgroundConfig: {
      type: 'image',
      value: '/mesh/Horizon.webp',
      opacity: 1,
    },
    borderRadius: 12,
    backgroundBorderRadius: 18,
    imageOpacity: 1,
    imageScale: 80,
    imageBorder: {
      enabled: true,
      width: 8,
      color: '#202124',
      type: 'windows-dark',
      padding: 2,
      title: '',
    },
    imageShadow: {
      enabled: true,
      blur: 50,
      offsetX: 0,
      offsetY: 28,
      spread: -10,
      color: 'rgba(60, 40, 180, 0.4)',
      opacity: 0.55,
    },
    backgroundBlur: 10,
    backgroundNoise: 22,
    shadowOverlay: {
      src: '/overlay-shadow/057.webp',
      opacity: 0.35,
    },
    objectOverlays: [
      { src: '/overlay/Hemisphere-Black.webp', x: 600, y: 100, size: 150, rotation: 0, opacity: 0.85, layer: 'front' },
      {
        src: '/overlay/Cylinder-Black.webp',
        x: 100,
        y: 580,
        size: 120,
        rotation: 25,
        opacity: 0.65,
        layer: 'back',
        flipX: true,
      },
    ],
    perspective3D: {
      ...flatTransform,
      perspective: 1800,
      rotateX: 10,
      rotateY: -16,
      rotateZ: 0,
      translateY: 0,
      scale: 0.8,
    },
  },
];

export const getPresetById = (id: string): PresetConfig | undefined => {
  return presets.find((preset) => preset.id === id);
};
