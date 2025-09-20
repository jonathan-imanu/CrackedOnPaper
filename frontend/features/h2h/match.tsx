import { ResumeCard } from "./resume-card";
import { MatchResponse } from "./use-h2h";
import { Versus } from "./versus";

export interface MatchProps {
    currentMatch: MatchResponse;
    handleVote: (resumeId: string) => void;
    handleSkip: () => void;
    handleFeedback: (resumeId: string) => void;
    votedResume: string | null;
    isVoting: boolean;
    isSkipping: boolean;

}

export function Match({ currentMatch, handleVote, handleSkip, handleFeedback, votedResume, isVoting, isSkipping }: MatchProps) {
    return (
        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 xl:gap-10 2xl:gap-16 mb-16">
            <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-1xl 2xl:max-w-4xl">
              <ResumeCard 
                resume={{
                  ID: currentMatch.resume_a.id,
                  Name: currentMatch.resume_a.name,
                  OwnerUserID: "unknown", // Not provided in match response
                  Industry: currentMatch.industry,
                  YoeBucket: currentMatch.yoe_bucket,
                  CurrentEloInt: currentMatch.resume_a.current_elo,
                  BattlesCount: currentMatch.resume_a.battles_count,
                  LastMatchedAt: currentMatch.created_at,
                  InFlight: "", 
                  CreatedAt: currentMatch.created_at,
                  PdfStorageKey: "",
                  PdfSizeBytes: 0,
                  PdfMime: "",
                  ImageKeyPrefix: currentMatch.resume_a.image_key_prefix,
                  PageCount: 1,
                  ImageReady: true,
                  Slot: 0,
                }}
                onClick={() => handleVote(currentMatch.resume_a.id)}
                isSelected={votedResume === currentMatch.resume_a.id}
                onFeedback={() => handleFeedback(currentMatch.resume_a.id)}
              />
            </div>

            <Versus handleSkip={handleSkip} isVoting={isVoting} isSkipping={isSkipping} />

            <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-1xl 2xl:max-w-4xl">
              <ResumeCard 
                resume={{
                  ID: currentMatch.resume_b.id,
                  Name: currentMatch.resume_b.name,
                  OwnerUserID: "unknown",
                  Industry: currentMatch.industry,
                  YoeBucket: currentMatch.yoe_bucket,
                  CurrentEloInt: currentMatch.resume_b.current_elo,
                  BattlesCount: currentMatch.resume_b.battles_count,
                  LastMatchedAt: currentMatch.created_at,
                  InFlight: "",
                  CreatedAt: currentMatch.created_at,
                  PdfStorageKey: "",
                  PdfSizeBytes: 0,
                  PdfMime: "",
                  ImageKeyPrefix: currentMatch.resume_b.image_key_prefix,
                  PageCount: 1,
                  ImageReady: true,
                  Slot: 0,
                }}
                onClick={() => handleVote(currentMatch.resume_b.id)}
                isSelected={votedResume === currentMatch.resume_b.id}
                onFeedback={() => handleFeedback(currentMatch.resume_b.id)}
              />
            </div>
          </div>
    )
}