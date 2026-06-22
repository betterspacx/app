import type { MockupDefinition } from '@/types/mockup';

export const MOCKUP_DEFINITIONS: MockupDefinition[] = [
  {
    id: 'mac-1',
    name: 'MacBook',
    type: 'macbook',
    src: '/mockups/mac/macbook.png',
    aspectRatio: 1.43,
    screenArea: {
      x: 0.08,
      y: 0.04,
      width: 0.84,
      height: 0.8,
    },
  },
  {
    id: 'imac-1',
    name: 'iMac',
    type: 'imac',
    src: '/mockups/mac/imac.png',
    aspectRatio: 1.72,
    screenArea: {
      x: 0.04,
      y: 0.03,
      width: 0.92,
      height: 0.72,
      borderRadius: 6,
    },
  },
  {
    id: 'iwatch-1',
    name: 'Apple Watch',
    type: 'iwatch',
    src: '/mockups/mac/iwatch.png',
    aspectRatio: 0.85,
    screenArea: {
      x: 0.06,
      y: 0.12,
      width: 0.88,
      height: 0.76,
      borderRadius: 22,
    },
  },
  {
    id: 'iphone-1',
    name: 'iPhone',
    type: 'iphone',
    src: '/mockups/iphone/iphone.png',
    aspectRatio: 0.48,
    screenArea: {
      x: 0.05,
      y: 0.02,
      width: 0.9,
      height: 0.96,
      borderRadius: 14,
      notch: {
        x: 0.3,
        y: 0.015,
        width: 0.4,
        height: 0.028,
        borderRadius: 12,
      },
    },
  },
];

export const getMockupDefinition = (id: string): MockupDefinition | undefined => {
  return MOCKUP_DEFINITIONS.find((def) => def.id === id);
};

export const getMockupsByType = (type: 'iphone' | 'macbook' | 'imac' | 'iwatch'): MockupDefinition[] => {
  return MOCKUP_DEFINITIONS.filter((def) => def.type === type);
};
