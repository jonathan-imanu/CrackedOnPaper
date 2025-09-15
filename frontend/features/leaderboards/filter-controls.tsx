"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Filter, RefreshCw } from "lucide-react";

interface FilterControlsProps {
  industries: string[];
  experienceLevels: string[];
  selectedIndustry: string;
  selectedLevel: string;
  onIndustryChange: (industry: string) => void;
  onLevelChange: (level: string) => void;
  onReset: () => void;
}

export function FilterControls({
  industries,
  experienceLevels,
  selectedIndustry,
  selectedLevel,
  onIndustryChange,
  onLevelChange,
  onReset,
}: FilterControlsProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-8">
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Industry
        </label>
        <div className="flex flex-wrap gap-2">
          {industries.map((industry) => (
            <Button
              key={industry}
              variant={selectedIndustry === industry ? "default" : "outline"}
              size="sm"
              onClick={() => onIndustryChange(industry)}
              className="transition-all duration-200"
            >
              {industry}
            </Button>
          ))}
        </div>
      </div>
      <Separator orientation="vertical" className="h-12" />
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Experience Level
        </label>
        <div className="flex flex-wrap gap-2">
          {experienceLevels.map((level) => (
            <Button
              key={level}
              variant={selectedLevel === level ? "default" : "outline"}
              size="sm"
              onClick={() => onLevelChange(level)}
              className="transition-all duration-200"
            >
              {level}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
