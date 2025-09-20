"use client";
import { useState } from "react";
import { Navbar } from "@/components/navbar/navbar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ExpandableTable } from "../../features/leaderboards/expandable-table";
import { FilterControls } from "../../features/leaderboards/filter-controls";
import {
  getFilteredData,
} from "../../features/leaderboards/mock-data";

export default function LeaderboardsPage() {
  const industries = ["All", "Tech", "Finance", "Marketing", "Design", "Sales"];
  const experienceLevels = ["All", "Entry", "Mid-Level", "Senior", "Executive"];

  const [selectedIndustry, setSelectedIndustry] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");

  const filteredData = getFilteredData(
    selectedIndustry === "All" ? undefined : selectedIndustry,
    selectedLevel === "All" ? undefined : selectedLevel,
  );

  // Update ranks based on filtered data
  const rankedData = filteredData.map((resume, index) => ({
    ...resume,
    rank: index + 1,
  }));

  const handleIndustryChange = (industry: string) => {
    setSelectedIndustry(industry);
  };

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
  };

  const handleReset = () => {
    setSelectedIndustry("All");
    setSelectedLevel("All");
  };

  const getTitle = () => {
    const industry =
      selectedIndustry === "All" ? "All Industries" : selectedIndustry;
    const level = selectedLevel === "All" ? "All Levels" : selectedLevel;
    return `Top Resumes - ${industry} • ${level}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="text-left mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-left justify-left gap-2">
            Leaderboards
          </h1>
          <p className="text-muted-foreground text-lg">
            See the top-performing resumes ranked by Elo rating.
          </p>
        </div>

        {/* Filters */}
        <FilterControls
          industries={industries}
          experienceLevels={experienceLevels}
          selectedIndustry={selectedIndustry}
          selectedLevel={selectedLevel}
          onIndustryChange={handleIndustryChange}
          onLevelChange={handleLevelChange}
          onReset={handleReset}
        />

        {/* Expandable Table */}
        <ExpandableTable data={rankedData} title={getTitle()} />

        {/* Load More */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Load More Results
          </Button>
        </div>

        <Separator className="my-8" />
      </div>
    </div>
  );
}
