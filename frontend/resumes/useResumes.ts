import { useState, useEffect } from "react";
import { Resume } from "@/resumes/types";
import { Activity } from "@/resumes/components/recent-activity";
import { resumeApi } from "@/resumes/api";
import { useAuth } from "@/components/auth-provider";

interface ResumeStats {
  totalResumes: number;
  bestElo: number;
  totalBattles: number;
  totalFeedback: number;
}

export function useResumes() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ResumeStats>({
    totalResumes: 0,
    bestElo: 0,
    totalBattles: 0,
    totalFeedback: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadResume = async (
    file: File,
    resumeName: string,
    version: string
  ) => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    try {
      setError(null);

      const response = await resumeApi.uploadResume(file, resumeName, user.id);

      // For now, we'll just return a success message
      // In the future, you might want to refresh the resumes list
      return {
        id: Date.now(), // Temporary ID
        name: resumeName,
        industry: "Tech", // Default values for now
        level: "Entry",
        elo: 1000,
        battles: 0,
        wins: 0,
        winRate: 0,
        lastBattle: "Never",
        status: "active" as const,
        feedback: 0,
        uploadDate: new Date().toISOString().split("T")[0],
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload resume");
      throw err;
    }
  };

  const refreshData = () => {
    // TODO: Implement when backend endpoints are ready
    console.log("Refresh data not implemented yet");
  };

  return {
    resumes,
    activities,
    stats,
    loading,
    error,
    uploadResume,
    refreshData,
  };
}
