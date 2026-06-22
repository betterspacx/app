'use client';

import * as React from 'react';
import { templates } from '@/lib/canvas/templates';
import type { Template, TemplateBackground, TemplateCategory } from '@/types/canvas';
import { cn } from '@/lib/utils';
import { Grid02Icon, Image02Icon, PlayIcon, Add01Icon } from 'hugeicons-react';

interface TemplateSelectorProps {
  selectedTemplateId?: string;
  onSelectTemplate: (template: Template) => void;
  onSaveAsPreset?: () => void;
  className?: string;
}

type FilterTab = 'all' | 'background' | 'animated';

const CATEGORY_ORDER: TemplateCategory[] = ['Minimal', 'Gradient', 'Abstract', 'Product', 'Editorial'];

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  Minimal: 'Minimal',
  Gradient: 'Gradient',
  Abstract: 'Abstract Shapes',
  Product: 'Product',
  Editorial: 'Editorial',
};

function getTemplateBackgroundStyle(background: TemplateBackground): React.CSSProperties {
  if (background.type === 'solid') {
    return { backgroundColor: background.color || '#ffffff' };
  }
  if (background.type === 'gradient' && background.gradient) {
    const { colors, angle = 135 } = background.gradient;
    return {
      background: `linear-gradient(${angle}deg, ${colors.join(', ')})`,
    };
  }
  if (background.type === 'shapes' && background.shapes) {
    return {
      backgroundColor: background.color || '#ffffff',
      backgroundImage: background.shapes
        .map(
          (shape) =>
            `radial-gradient(circle at ${(shape.x / 1920) * 100}% ${(shape.y / 1080) * 100}%, ${shape.color}${Math.round(
              (shape.opacity ?? 1) * 255
            )
              .toString(16)
              .padStart(2, '0')} 0%, transparent ${(shape.width / 1920) * 100}%)`
        )
        .join(', '),
      backgroundSize: 'cover',
    };
  }
  return { backgroundColor: background.color || '#ffffff' };
}

export function TemplateSelector({
  selectedTemplateId,
  onSelectTemplate,
  onSaveAsPreset,
  className,
}: TemplateSelectorProps) {
  const [filter, setFilter] = React.useState<FilterTab>('all');
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>(
    Object.fromEntries(CATEGORY_ORDER.map((cat) => [cat, true]))
  );

  const filteredTemplates = React.useMemo(() => {
    if (filter === 'all') return templates;
    if (filter === 'animated') return templates.filter((t) => t.animated);
    return templates.filter((t) => t.background.type !== 'solid');
  }, [filter]);

  const templatesByCategory = React.useMemo(() => {
    const map = new Map<TemplateCategory, Template[]>();
    for (const cat of CATEGORY_ORDER) {
      const list = filteredTemplates.filter((t) => t.category === cat);
      if (list.length) map.set(cat, list);
    }
    return map;
  }, [filteredTemplates]);

  const tabs: { id: FilterTab; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All', icon: <Grid02Icon size={14} /> },
    { id: 'background', label: 'Background', icon: <Image02Icon size={14} /> },
    { id: 'animated', label: 'Animated', icon: <PlayIcon size={14} /> },
  ];

  return (
    <div className={cn('space-y-5', className)}>
      <div>
        <h2 className="text-lg font-semibold mb-1">Templates</h2>
        <p className="text-sm text-muted-foreground">Choose a background template for your showcase</p>
      </div>
      {onSaveAsPreset && (
        <button
          onClick={onSaveAsPreset}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"
        >
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
            <Add01Icon size={14} className="text-white/70" />
          </div>
          <span className="text-sm font-medium text-white/70">Save Current as Preset</span>
        </button>
      )}
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
      <div className="space-y-5">
        {Array.from(templatesByCategory.entries()).map(([category, categoryTemplates]) => (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categoryTemplates.map((template) => {
                  const active = selectedTemplateId === template.id;
                  return (
                    <button
                      key={template.id}
                      onClick={() => onSelectTemplate(template)}
                      className={cn(
                        'group relative w-full text-left rounded-xl border-2 transition-all cursor-pointer overflow-hidden',
                        active ? 'border-blue-500' : 'border-border hover:border-border/80'
                      )}
                    >
                      <div
                        className="relative aspect-[4/3] w-full overflow-hidden"
                        style={getTemplateBackgroundStyle(template.background)}
                      >
                        {template.preview && (
                          <img
                            src={template.preview}
                            alt={template.name}
                            loading="lazy"
                            draggable={false}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                          />
                        )}
                        {template.animated && (
                          <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 bg-foreground/70 backdrop-blur-sm rounded text-[9px] text-background font-medium">
                            <PlayIcon size={10} />
                            Video
                          </div>
                        )}
                        {template.isNew && (
                          <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-primary rounded text-[9px] text-primary-foreground font-medium">
                            New
                          </div>
                        )}
                        {active && <div className="absolute inset-0 bg-blue-500/10" />}
                      </div>
                      <div className="p-2.5 bg-background">
                        <div className="font-medium text-xs text-foreground truncate">{template.name}</div>
                        {template.description && (
                          <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                            {template.description}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {templatesByCategory.size === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No templates match the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
