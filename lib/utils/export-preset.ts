import { useImageStore } from '@/lib/store';
import { getBackgroundStyle } from '@/lib/constants/backgrounds';
import { MOCKUP_DEFINITIONS } from '@/lib/constants/mockups';
import type {
  PresetConfig,
  PresetContainerStyle,
  PresetMockupOverlay,
  PresetDeviceType,
} from '@/lib/constants/presets';

export function serializeStateAsPreset(
  id: string,
  name: string,
  description: string,
  category: PresetConfig['category'],
  previewImage: string
): PresetConfig {
  const state = useImageStore.getState();

  const bgStyle = getBackgroundStyle(state.backgroundConfig);

  const containerStyle: PresetContainerStyle = {
    background: bgStyle,
    padding: 72,
    borderRadius: state.backgroundBorderRadius ?? 0,
    backgroundBlur: state.backgroundBlur ?? 0,
    backdropBlur: 0,
    isolation: true,
  };

  let deviceType: PresetDeviceType = 'none';
  let mockupOverlay: PresetMockupOverlay = {
    kind: 'none',
    frame: 'none',
    chrome: 'none',
  };

  if (state.mockups && state.mockups.length > 0) {
    const m = state.mockups[0];
    const def = MOCKUP_DEFINITIONS.find((d) => d.id === m.definitionId);
    const kind = (def?.type ?? 'none') as PresetDeviceType;
    deviceType = kind;
    mockupOverlay = {
      kind,
      frame: state.imageBorder?.type ?? 'none',
      chrome: kind === 'browser' ? 'dark' : 'none',
    };
  } else if (state.imageBorder?.type && state.imageBorder.type !== 'none') {
    const borderType = state.imageBorder.type;
    if (borderType.includes('macos') || borderType.includes('arc')) {
      deviceType = 'browser';
      mockupOverlay = { kind: 'browser', frame: borderType, chrome: borderType.includes('light') ? 'light' : 'dark' };
    }
  }

  return {
    id,
    name,
    description,
    category,
    aspectRatio: state.selectedAspectRatio,
    backgroundConfig: state.backgroundConfig,
    borderRadius: state.borderRadius,
    backgroundBorderRadius: state.backgroundBorderRadius,
    imageOpacity: state.imageOpacity,
    imageScale: state.imageScale,
    imageBorder: state.imageBorder,
    imageShadow: state.imageShadow,
    backgroundBlur: state.backgroundBlur,
    backgroundNoise: state.backgroundNoise,
    perspective3D: state.perspective3D,
    containerStyle,
    mockupOverlay,
    previewImage,
    deviceType,
    animated: false,
  };
}

export async function copyPresetToClipboard(preset: PresetConfig): Promise<boolean> {
  try {
    const json = JSON.stringify(preset, null, 2);
    await navigator.clipboard.writeText(json);
    return true;
  } catch {
    return false;
  }
}
