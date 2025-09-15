"use client";
import { Navbar } from "@/components/navbar/navbar";
import { FilterDropdowns } from "@/features/h2h/filter-dropdowns";
import { useH2H } from "@/features/h2h/use-h2h";
import React, { useEffect, useRef } from "react";
import { ErrorStates } from "@/features/h2h/states/error";
import { Loading } from "@/features/h2h/states/loading";
import { Match } from "@/features/h2h/match";


export default function H2HPage() {
  const {
    // State
    isVoting,
    isSkipping,
    votedResume,
    selectedIndustry,
    selectedLevel,
    currentMatch,
    isLoadingMatch,
    matchError,
    
    // Actions
    setSelectedIndustry,
    setSelectedLevel,
    handleVote,
    handleSkip,
    loadNewMatch
  } = useH2H();

  const hasLoadedRef = useRef(false);
  const currentFiltersRef = useRef(`${selectedIndustry}-${selectedLevel}`);

  useEffect(() => {
    const currentFilters = `${selectedIndustry}-${selectedLevel}`;
    
    if (!hasLoadedRef.current || currentFiltersRef.current !== currentFilters) {
      hasLoadedRef.current = true;
      currentFiltersRef.current = currentFilters;
      loadNewMatch();
    }
  }, [selectedIndustry, selectedLevel, loadNewMatch]);

  const handleFeedback = (resumeId: string) => {
    console.log("Opening feedback for resume:", resumeId);
  };

  return (
    <div className="bg-background">
      <Navbar />

      <div className="container mx-auto px-4 xl:pt-5 2xl:pt-9 max-w-none mt-18">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 xl:gap-10 2xl:gap-16">
          <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-1xl 2xl:max-w-4xl">
            <FilterDropdowns
              selectedIndustry={selectedIndustry}
              selectedLevel={selectedLevel}
              onIndustryChange={setSelectedIndustry}
              onLevelChange={setSelectedLevel}
            />
          </div>

          {/* Spacers */}
          <div className="hidden lg:block w-12 h-12 lg:w-16 lg:h-16"></div>
          <div className="hidden lg:block w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-1xl 2xl:max-w-4xl"></div>
        </div>
        
        {isLoadingMatch ? (
          <Loading />
        ) : currentMatch ? (
          <Match 
            currentMatch={currentMatch} 
            handleVote={handleVote} 
            handleSkip={handleSkip} 
            handleFeedback={handleFeedback} 
            votedResume={votedResume} 
            isVoting={isVoting} 
            isSkipping={isSkipping} 
          />
        ) : (
          <ErrorStates error={matchError || ""} onRetry={loadNewMatch} />
        )}
      </div>
    </div>
  );
}
