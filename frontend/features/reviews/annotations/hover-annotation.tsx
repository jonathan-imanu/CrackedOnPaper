import React from "react";
import { Badge } from "@/components/ui/badge";
import { Annotation } from "@/features/reviews/types";

interface HoverAnnotationProps {
  annotation: Annotation;
  getCategoryColor: (category: string) => string;
}

const HoverAnnotation: React.FC<HoverAnnotationProps> = ({
  annotation,
  getCategoryColor,
}) => {
  return (
    <div className="absolute top-8 left-0 bg-card border border-border rounded-lg shadow-lg p-2 min-w-[150px] max-w-[250px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: getCategoryColor(
              annotation.properties.category || "general"
            ),
          }}
        />
        <Badge variant="secondary" className="text-xs">
          {annotation.properties.category}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-3">
        {annotation.properties.text}
      </p>
    </div>
  );
};

export default HoverAnnotation;