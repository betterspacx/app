// Modified by konlyzx (2026) - Moved Aspect Ratio to Ratio tab and 3D controls to right panel; reorganized tabs
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

'use client';

import * as React from 'react';
import { useImageStore } from '@/lib/store';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BorderControls } from '@/components/controls/BorderControls';
import { ShadowControls } from '@/components/controls/ShadowControls';
import { AspectRatioPicker } from '@/components/aspect-ratio/aspect-ratio-picker';

export function StyleTabs() {
  const {
    borderRadius,
    imageOpacity,
    imageScale,
    imageShadow,
    setBorderRadius,
    setImageOpacity,
    setImageScale,
    setImageShadow,
  } = useImageStore();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="style" className="w-full">
        <TabsList className="w-full grid grid-cols-3 rounded-none bg-transparent h-12 p-1.5 gap-1.5">
          <TabsTrigger value="style" className="data-[state=active]:bg-background rounded-md border-0 data-[state=active]:border-0 transition-all duration-200 text-xs">
            Style
          </TabsTrigger>
          <TabsTrigger value="ratio" className="data-[state=active]:bg-background rounded-md border-0 data-[state=active]:border-0 transition-all duration-200 text-xs">
            Ratio
          </TabsTrigger>
          <TabsTrigger value="transforms" className="data-[state=active]:bg-background rounded-md border-0 data-[state=active]:border-0 transition-all duration-200 text-xs">
            Transforms
          </TabsTrigger>
        </TabsList>

        <TabsContent value="style" className="mt-4 space-y-6">
        <div className="space-y-4">
          <Label className="text-sm font-semibold text-foreground">Border Radius</Label>
          <div className="flex gap-2 mb-3">
            <Button
              variant={borderRadius === 0 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBorderRadius(0)}
              className={`flex-1 text-sm font-medium transition-all rounded-lg h-9 border ${
                borderRadius === 0
                  ? 'bg-primary hover:opacity-90 text-primary-foreground border-primary'
                  : 'border-border/50 hover:border-border hover:bg-accent text-foreground bg-background'
              }`}
            >
              Sharp Edge
            </Button>
            <Button
              variant={borderRadius > 0 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setBorderRadius(24)}
              className={`flex-1 text-sm font-medium transition-all rounded-lg h-9 border ${
                borderRadius > 0
                  ? 'bg-primary hover:opacity-90 text-primary-foreground border-primary'
                  : 'border-border/50 hover:border-border hover:bg-accent text-foreground bg-background'
              }`}
            >
              Rounded
            </Button>
          </div>
          <Slider
            value={[borderRadius]}
            onValueChange={(value) => setBorderRadius(value[0])}
            min={0}
            max={100}
            step={1}
            label="Radius"
            valueDisplay={`${borderRadius}px`}
          />
        </div>

        <div className="space-y-3">
          <Slider
            value={[imageScale]}
            onValueChange={(value) => setImageScale(value[0])}
            min={10}
            max={200}
            step={1}
            label="Image Size"
            valueDisplay={`${imageScale}%`}
          />
          <p className="text-xs text-muted-foreground">
            Adjust the size of the image (10% - 200%)
          </p>
        </div>

        <Slider
          value={[imageOpacity]}
          onValueChange={(value) => setImageOpacity(value[0])}
          min={0}
          max={1}
          step={0.01}
          label="Opacity"
          valueDisplay={`${Math.round(imageOpacity * 100)}%`}
        />

        <BorderControls />

        <ShadowControls shadow={imageShadow} onShadowChange={setImageShadow} />
        </TabsContent>

        <TabsContent value="ratio" className="mt-4 space-y-6">
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Canvas Size
            </h4>
            <p className="text-xs text-muted-foreground">
              Select aspect ratio for different platforms
            </p>
            <AspectRatioPicker />
          </div>
        </TabsContent>

        <TabsContent value="transforms" className="mt-4 space-y-6">
          <div className="text-sm text-muted-foreground text-center py-8">
            Transform controls coming soon
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
