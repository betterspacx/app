// Modified by konlyzx (2026) - Enhanced border preview aesthetics with darker refined look
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

'use client';

import * as React from 'react';
import { useImageStore } from '@/lib/store';
import { Slider } from '@/components/ui/slider';
import { SectionWrapper } from './SectionWrapper';
import { cn } from '@/lib/utils';

const borderPresets = [
  { value: 0, label: 'Sharp' },
  { value: 12, label: 'Curved' },
  { value: 20, label: 'Round' },
] as const;

function BorderPreview({ radius, selected }: { radius: number; selected: boolean }) {
  const previewRadius = radius === 0 ? '0px' : radius === 12 ? '6px' : '12px';

  return (
    <div
      className={cn(
        'relative w-full aspect-square rounded-xl overflow-hidden transition-all duration-200',
        selected
          ? 'ring-2 ring-primary ring-offset-2 ring-offset-card shadow-lg shadow-primary/10'
          : 'ring-1 ring-white/10 hover:ring-white/20',
      )}
      style={{ backgroundColor: 'rgb(45, 45, 50)' }}
    >
      <div
        className="absolute"
        style={{ top: '19.5%', left: '19.5%', width: '95.5%', height: '95.5%' }}
      >
        <div
          className="w-full h-full bg-gradient-to-br from-white to-gray-100 shadow-sm"
          style={{ borderRadius: previewRadius }}
        />
      </div>
    </div>
  );
}

export function BorderSection() {
  const { borderRadius, setBorderRadius, imageScale, setImageScale } = useImageStore();

  return (
    <SectionWrapper title="Border" defaultOpen={true}>
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2 p-1">
          {borderPresets.map(({ value, label }) => {
            const isSelected = borderRadius === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setBorderRadius(value)}
                className="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <BorderPreview radius={value} selected={isSelected} />
                <span
                  className={cn(
                    'text-[10px] leading-tight transition-colors',
                    isSelected ? 'text-foreground font-medium' : 'text-muted-foreground group-hover:text-foreground/70',
                  )}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        <Slider
          value={[borderRadius]}
          onValueChange={(value) => setBorderRadius(value[0])}
          min={0}
          max={50}
          step={1}
          label="Radius"
          valueDisplay={borderRadius}
        />
        <Slider
          value={[imageScale / 100]}
          onValueChange={(value) => setImageScale(Math.round(value[0] * 100))}
          min={0.1}
          max={2}
          step={0.01}
          label="Scale"
          valueDisplay={(imageScale / 100).toFixed(1)}
        />
      </div>
    </SectionWrapper>
  );
}
