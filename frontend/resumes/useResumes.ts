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

  const fetchResumes = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const fetchedResumes = await resumeApi.getResumes();
      setResumes(fetchedResumes);

      // Update stats based on fetched resumes
      const totalResumes = fetchedResumes.length;
      const bestElo =
        fetchedResumes.length > 0
          ? Math.max(...fetchedResumes.map((r) => r.CurrentEloInt))
          : 0;
      const totalBattles = fetchedResumes.reduce(
        (sum, r) => sum + r.BattlesCount,
        0
      );

      setStats({
        totalResumes,
        bestElo,
        totalBattles,
        totalFeedback: 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch resumes");
    } finally {
      setLoading(false);
    }
  };

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
      await fetchResumes();
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload resume");
      throw err;
    }
  };

  const deleteResume = async (resumeId: string) => {
    try {
      setError(null);
      await resumeApi.deleteResume(resumeId);
      await fetchResumes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete resume");
      throw err;
    }
  };

  const renameResume = async (resumeId: string, newName: string) => {
    try {
      setError(null);
      await resumeApi.renameResume({
        resume_id: resumeId,
        resume_name: newName,
      });
      await fetchResumes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename resume");
      throw err;
    }
  };

  const downloadResume = async (resumeId: string, resumeName: string) => {
    try {
      setError(null);
      const blob = await resumeApi.downloadResume(resumeId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${resumeName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to download resume"
      );
      throw err;
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [user?.id]);

  return {
    resumes,
    activities,
    stats,
    loading,
    error,
    uploadResume,
    deleteResume,
    renameResume,
    downloadResume,
  };
}
