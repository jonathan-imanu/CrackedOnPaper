import { useState, useCallback } from "react";
import axiosInstance from "@/lib/axiosInstance";

export interface CreateMatchRequest {
  industry: string;
  yoe_bucket: string;
}

export interface ResolveMatchRequest {
  winner_resume_id: string;
}

export interface LeaderboardRequest {
  industry?: string;
  yoe_bucket?: string;
  min_battles?: number;
  limit?: number;
  offset?: number;
}

export interface ResumeDetail {
  id: string;
  name: string;
  image_key_prefix: string;
  current_elo: number;
  battles_count: number;
}

export interface MatchResponse {
  match_id: string;
  resume_a: ResumeDetail;
  resume_b: ResumeDetail;
  industry: string;
  yoe_bucket: string;
  created_at: string;
}

export interface ResolveMatchResponse {
  match_id: string;
  winner_resume_id: string;
  loser_resume_id: string;
  delta_a: number;
  delta_b: number;
  k_factor_used: number;
  resolved_at: string;
}

export interface LeaderboardResume {
  id: string;
  name: string;
  owner_user_id: string;
  industry: string;
  yoe_bucket: string;
  current_elo: number;
  battles_count: number;
  rank: number;
}

export interface LeaderboardResponse {
  resumes: LeaderboardResume[];
  total: number;
  industry?: string;
  yoe_bucket?: string;
}

export function useH2H() {
  const [isVoting, setIsVoting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [votedResume, setVotedResume] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("tech");
  const [selectedLevel, setSelectedLevel] = useState<string>("intern");
  
  // Match state
  const [currentMatch, setCurrentMatch] = useState<MatchResponse | null>(null);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  const createMatch = useCallback(async (industry: string, yoeBucket: string) => {
    setIsLoadingMatch(true);
    setMatchError(null);
    
    try {
      const response = await axiosInstance.post<MatchResponse>('/h2h/matches', {
        industry,
        yoe_bucket: yoeBucket
      });
      
      setCurrentMatch(response.data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create match';
      setMatchError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoadingMatch(false);
    }
  }, []);

  const resolveMatch = useCallback(async (matchId: string, winnerResumeId: string) => {
    setIsVoting(true);
    setVotedResume(winnerResumeId);
    
    try {
      const response = await axiosInstance.post<ResolveMatchResponse>(
        `/h2h/matches/${matchId}/resolve`,
        {
          winner_resume_id: winnerResumeId
        }
      );
      
      setCurrentMatch(null);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to resolve match';
      throw new Error(errorMessage);
    } finally {
      setIsVoting(false);
      setVotedResume(null);
    }
  }, []);

  const getLeaderboard = useCallback(async (params: LeaderboardRequest = {}) => {
    setIsLoadingLeaderboard(true);
    setLeaderboardError(null);
    
    try {
      const response = await axiosInstance.get<LeaderboardResponse>('/h2h/leaderboard', {
        params: {
          industry: params.industry,
          yoe_bucket: params.yoe_bucket,
          min_battles: params.min_battles || 0,
          limit: params.limit || 50,
          offset: params.offset || 0
        }
      });
      
      setLeaderboard(response.data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to get leaderboard';
      setLeaderboardError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  }, []);

  const skipMatch = useCallback(async () => {
    if (!currentMatch) {
      throw new Error('No match to skip');
    }

    setIsSkipping(true);
    setVotedResume(null);
    
    try {
      await axiosInstance.post(`/h2h/matches/${currentMatch.match_id}/skip`);
      
      setCurrentMatch(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to skip match';
      throw new Error(errorMessage);
    } finally {
      setIsSkipping(false);
    }
  }, [currentMatch]);

  // Load new match based on current filters
  const loadNewMatch = useCallback(async () => {
    try {
      await createMatch(selectedIndustry, selectedLevel);
    } catch (error) {
      console.error('Failed to load new match:', error);
    }
  }, [selectedIndustry, selectedLevel, createMatch]);

  return {
    // State
    isVoting,
    isSkipping,
    votedResume,
    selectedIndustry,
    selectedLevel,
    currentMatch,
    isLoadingMatch,
    matchError,
    leaderboard,
    isLoadingLeaderboard,
    leaderboardError,
    
    // Actions
    setSelectedIndustry,
    setSelectedLevel,
    createMatch,
    resolveMatch,
    skipMatch,
    getLeaderboard,
    loadNewMatch,
    
    // Vote handlers
    handleVote: (resumeId: string) => {
      if (!currentMatch || isVoting) return;
      
      const isResumeA = resumeId === currentMatch.resume_a.id;
      const winnerId = isResumeA ? currentMatch.resume_a.id : currentMatch.resume_b.id;
      
      resolveMatch(currentMatch.match_id, winnerId)
        .then(() => {
          loadNewMatch();
        })
        .catch((error) => {
          console.error('Vote failed:', error);
        });
    },
    
    handleSkip: () => {
      if (isVoting) return;
      
      skipMatch()
        .then(() => {
          loadNewMatch();
        })
        .catch((error) => {
          console.error('Skip failed:', error);
        });
    }
  };
}
