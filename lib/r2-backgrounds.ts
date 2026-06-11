/**
 * Background Assets Configuration
 *
 * Local images served from /public — instant, no network dependency.
 */

export interface BackgroundCategory {
  [category: string]: string[];
}

export const backgroundCategories: BackgroundCategory = {
  assets: [
    '/assets/asset-1.avif',
    '/assets/asset-2.jpg',
    '/assets/asset-3.avif',
    '/assets/asset-4.jpg',
    '/assets/asset-5.jpg',
    '/assets/asset-13.jpg',
    '/assets/asset-19.jpg',
  ],
  mac: [
    '/mac/mac-asset-1.jpeg',
    '/mac/mac-asset-2.jpg',
    '/mac/mac-asset-3.jpg',
    '/mac/mac-asset-4.jpg',
    '/mac/mac-asset-5.jpg',
    '/mac/mac-asset-6.jpeg',
    '/mac/mac-asset-7.png',
    '/mac/mac-asset-8.jpg',
    '/mac/mac-asset-9.jpg',
    '/mac/mac-asset-10.jpg',
  ],
  radiant: [
    '/radiant/radiant1.jpg',
    '/radiant/radiant2.jpg',
    '/radiant/radiant3.jpg',
    '/radiant/radiant4.jpg',
    '/radiant/radiant5.jpg',
    '/radiant/radiant6.jpg',
    '/radiant/radiant8.jpg',
    '/radiant/radiant9.jpg',
    '/radiant/radiant10.jpg',
  ],
  mesh: [
    '/mesh/mesh1.webp',
    '/mesh/mesh2.webp',
    '/mesh/mesh3.webp',
    '/mesh/mesh4.webp',
    '/mesh/mesh5.webp',
    '/mesh/mesh6.webp',
    '/mesh/mesh7.webp',
    '/mesh/mesh8.webp',
    '/mesh/Astra.webp',
    '/mesh/Bliss.webp',
    '/mesh/Burst.webp',
    '/mesh/Dusk.webp',
    '/mesh/Flash.webp',
    '/mesh/Ghost.webp',
    '/mesh/Helix.webp',
    '/mesh/Horizon.webp',
    '/mesh/Peak.webp',
  ],
  paper: [
    '/paper/01.webp',
    '/paper/02.webp',
    '/paper/03.webp',
    '/paper/21.webp',
    '/paper/26.webp',
    '/paper/27.webp',
    '/paper/31.webp',
    '/paper/47.webp',
  ],
  raycast: [
    '/raycast/autumnal-peach.webp',
    '/raycast/blob-red.webp',
    '/raycast/blob.webp',
    '/raycast/blossom-2.webp',
    '/raycast/blue_distortion_1.webp',
    '/raycast/blue_distortion_2.webp',
    '/raycast/blushing-fire.webp',
    '/raycast/bright-rain.webp',
    '/raycast/chromatic_dark_1.webp',
    '/raycast/chromatic_dark_2.webp',
    '/raycast/chromatic_light_1.webp',
    '/raycast/chromatic_light_2.webp',
    '/raycast/cube_mono.webp',
    '/raycast/cube_prod.webp',
    '/raycast/floss.webp',
    '/raycast/glass-rainbow.webp',
    '/raycast/good-vibes.webp',
    '/raycast/loupe-mono-light.webp',
    '/raycast/loupe.webp',
    '/raycast/mono_dark_distortion_1.webp',
    '/raycast/mono_dark_distortion_2.webp',
    '/raycast/mono_light_distortion_1.webp',
    '/raycast/moonrise.webp',
    '/raycast/red_distortion_2.webp',
    '/raycast/red_distortion_4.webp',
    '/raycast/rose-thorn.webp',
  ],
  pattern: [
    '/pattern/1.webp',
    '/pattern/2.webp',
    '/pattern/3.webp',
    '/pattern/4.webp',
    '/pattern/5.webp',
    '/pattern/6.webp',
    '/pattern/7.webp',
    '/pattern/8.webp',
    '/pattern/9.webp',
    '/pattern/10.webp',
    '/pattern/11.webp',
  ],
};

export const backgroundPaths: string[] = Object.values(backgroundCategories).flat();

export const SIGN_IN_BACKGROUND_PATH = '/mac/mac-asset-7.png';
export const SIGN_UP_BACKGROUND_PATH = '/mac/mac-asset-2.jpg';

export function getBackgroundUrl(path: string): string {
  return path;
}

export function getBackgroundThumbnailUrl(path: string): string {
  return path;
}

export function isBackgroundPath(path: string): boolean {
  return backgroundPaths.includes(path);
}

export function getBackgroundsByCategory(category: string): string[] {
  return backgroundCategories[category] || [];
}

export function getAvailableCategories(): string[] {
  return Object.keys(backgroundCategories);
}
