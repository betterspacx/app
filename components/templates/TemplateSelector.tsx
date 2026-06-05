// Modified by konlyzx (2026) - Changed ring-primary to ring-blue-500 for selected template
// Base project structure under Apache License 2.0 (Copyright 2025 Kartik Labhshetwar)

"use client";

import { templates } from "@/lib/canvas/templates";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Template } from "@/types/canvas";
import { cn } from "@/lib/utils";

interface TemplateSelectorProps {
  selectedTemplateId?: string;
  onSelectTemplate: (template: Template) => void;
  className?: string;
}

export function TemplateSelector({
  selectedTemplateId,
  onSelectTemplate,
  className,
}: TemplateSelectorProps) {
  const getPreviewColor = (template: Template): string => {
    if (template.background.type === "solid") {
      return template.background.color || "#ffffff";
    }
    if (template.background.type === "gradient") {
      return template.background.gradient?.colors[0] || "#ffffff";
    }
    return template.background.color || "#ffffff";
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h2 className="text-lg font-semibold mb-2">Templates</h2>
        <p className="text-sm text-muted-foreground">
          Choose a background template for your showcase
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={cn(
              "cursor-pointer transition-all",
              selectedTemplateId === template.id && "ring-2 ring-blue-500"
            )}
            onClick={() => onSelectTemplate(template)}
          >
            <CardHeader className="pb-3">
              <div
                className="w-full h-24 rounded-md mb-2"
                style={{ backgroundColor: getPreviewColor(template) }}
              />
              <CardTitle className="text-base">{template.name}</CardTitle>
              {template.description && (
                <CardDescription className="text-xs">
                  {template.description}
                </CardDescription>
              )}
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
