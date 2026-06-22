// Modified by konlyzx (2026) - Changed background to bg-white; added cursor-pointer to buttons
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

/**
 * Quality preset selector component for export options
 */

import { cn } from '@/lib/utils';
import type { ExportFormat, QualityPreset } from '@/lib/export/types';
import { QUALITY_PRESET_LABELS } from '@/lib/export/types';

interface QualityPresetSelectorProps {
  qualityPreset: QualityPreset;
  format: ExportFormat;
  onQualityPresetChange: (preset: QualityPreset) => void;
}

const PRESETS: QualityPreset[] = ['high', 'medium', 'low'];

export function QualityPresetSelector({ qualityPreset, format, onQualityPresetChange }: QualityPresetSelectorProps) {
  const currentLabel = QUALITY_PRESET_LABELS[qualityPreset];

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">Quality</label>
      <div className="grid grid-cols-3 gap-2 p-1 bg-white rounded-xl">
        {PRESETS.map((preset) => {
          const isSelected = preset === qualityPreset;
          return (
            <button
              key={preset}
              onClick={() => onQualityPresetChange(preset)}
              className={cn(
                'relative px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
                isSelected
                  ? 'bg-muted/50 text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              )}
            >
              {QUALITY_PRESET_LABELS[preset].label}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">{currentLabel.description[format]}</p>
    </div>
  );
}
