"use client";

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";
import React from "react";
import { industries, expierenceLevels } from "@/constants";


interface FilterDropdownsProps {
  selectedIndustry: string;
  selectedLevel: string;
  onIndustryChange: (industry: string) => void;
  onLevelChange: (level: string) => void;
}

export function FilterDropdowns({ 
  selectedIndustry, 
  selectedLevel, 
  onIndustryChange, 
  onLevelChange 
}: FilterDropdownsProps) {
  return (
    <div className="flex flex-row items-center gap-4 lg:gap-6">
      {/* Industry Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="px-3 py-1 lg:px-4 lg:py-2 text-xs lg:text-sm font-medium min-w-[120px] justify-between"
          >
            {industries.find(opt => opt.value === selectedIndustry)?.key || "Select Industry"}
            <ChevronDownIcon className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuRadioGroup value={selectedIndustry} onValueChange={onIndustryChange}>
            {industries.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.key}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="px-3 py-1 lg:px-4 lg:py-2 text-xs lg:text-sm font-medium min-w-[120px] justify-between"
          >
            {expierenceLevels.find(opt => opt.value === selectedLevel)?.key || "Select Level"}
            <ChevronDownIcon className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuRadioGroup value={selectedLevel} onValueChange={onLevelChange}>
            {expierenceLevels.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.key}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
