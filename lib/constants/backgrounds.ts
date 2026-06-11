import { gradientColors, GradientKey } from './gradient-colors';
import { SolidColorKey, solidColors } from './solid-colors';
import { meshGradients, magicGradients, MeshGradientKey, MagicGradientKey } from './mesh-gradients';

export type BackgroundType = 'gradient' | 'solid' | 'image';

export interface BackgroundConfig {
  type: BackgroundType;
  value: GradientKey | SolidColorKey | string;
  opacity?: number;
}

export const getBackgroundStyle = (config: BackgroundConfig): string => {
  const { type, value, opacity = 1 } = config;

  switch (type) {
    case 'gradient': {
      if (typeof value === 'string' && value.startsWith('mesh:')) {
        const meshKey = value.replace('mesh:', '') as MeshGradientKey;
        return meshGradients[meshKey] || gradientColors.vibrant_orange_pink;
      }
      if (typeof value === 'string' && value.startsWith('magic:')) {
        const magicKey = value.replace('magic:', '') as MagicGradientKey;
        return magicGradients[magicKey] || gradientColors.vibrant_orange_pink;
      }
      return gradientColors[value as GradientKey];
    }

    case 'solid': {
      if (value === 'transparent') {
        return 'transparent';
      }
      if (typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb'))) {
        return value;
      }
      const color = solidColors[value as SolidColorKey];
      return color || '#ffffff';
    }

    case 'image':
      return `url(${value})`;

    default:
      return gradientColors.vibrant_orange_pink;
  }
};

export const getBackgroundCSS = (
  config: BackgroundConfig
): React.CSSProperties => {
  const { type, value, opacity = 1 } = config;

  switch (type) {
    case 'gradient': {
      let gradient: string;

      if (typeof value === 'string' && value.startsWith('mesh:')) {
        const meshKey = value.replace('mesh:', '') as MeshGradientKey;
        gradient = meshGradients[meshKey] || gradientColors.vibrant_orange_pink;
      } else if (typeof value === 'string' && value.startsWith('magic:')) {
        const magicKey = value.replace('magic:', '') as MagicGradientKey;
        gradient = magicGradients[magicKey] || gradientColors.vibrant_orange_pink;
      } else {
        gradient = gradientColors[value as GradientKey] || gradientColors.vibrant_orange_pink;
      }

      return {
        background: gradient,
        opacity,
      };
    }

    case 'solid': {
      if (value === 'transparent') {
        return {
          backgroundColor: 'transparent',
          opacity: 1,
        };
      }
      if (typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb'))) {
        return {
          backgroundColor: value,
          opacity,
        };
      }
      const color = solidColors[value as SolidColorKey] || '#ffffff';
      return {
        backgroundColor: color,
        opacity,
      };
    }

    case 'image': {
      const imageUrl = typeof value === 'string' ? value : '';
      return {
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity,
      };
    }

    default:
      return {
        background: gradientColors.vibrant_orange_pink,
        opacity,
      };
  }
};
