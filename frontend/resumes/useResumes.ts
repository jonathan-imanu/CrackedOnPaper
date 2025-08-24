import { useState, useEffect, useCallback } from "react";
import { Resume } from "@/resumes/types";
import { Activity } from "@/resumes/components/recent-activity";
import { resumeApi } from "@/resumes/api";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/ui/toast-context";

interface ResumeStats {
  totalResumes: number;
  bestElo: number;
  totalBattles: number;
  totalFeedback: number;
}

export function useResumes() {
  const { user } = useAuth();
  const { showToast } = useToast();
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
      if (!fetchedResumes) return;
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
    industry: string,
    yoeBucket: string
  ) => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    try {
      setError(null);
      const response = await resumeApi.uploadResume(
        file,
        resumeName,
        user.id,
        industry,
        yoeBucket
      );
      await fetchResumes();
      showToast({
        type: "success",
        title: "Resume uploaded successfully!",
        message: `${resumeName} has been added to your collection.`,
      });
      return response;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload resume";
      setError(errorMessage);
      showToast({
        type: "error",
        title: "Upload failed",
        message: errorMessage,
      });
      throw err;
    }
  };

  const deleteResume = async (
    resumeId: string,
    imageKeyPrefix: string,
    pdfStorageKey: string
  ) => {
    try {
      setError(null);
      await resumeApi.deleteResume(resumeId, imageKeyPrefix, pdfStorageKey);
      await fetchResumes();
      showToast({
        type: "success",
        title: "Resume deleted",
        message: "Resume has been deleted successfully.",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete resume";
      setError(errorMessage);
      showToast({
        type: "error",
        title: "Delete failed",
        message: errorMessage,
      });
      throw err;
    }
  };

  const renameResume = async (
    resumeId: string,
    newName: string,
    currentName: string
  ) => {
    try {
      setError(null);
      await resumeApi.renameResume({
        resume_id: resumeId,
        resume_name: newName,
      });
      await fetchResumes();
      showToast({
        type: "success",
        title: "Resume renamed",
        message: `${currentName} has been renamed to ${newName}.`,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to rename resume";
      setError(errorMessage);
      showToast({
        type: "error",
        title: "Rename failed",
        message: errorMessage,
      });
      throw err;
    }
  };

  const downloadResume = async (
    resumeId: string,
    resumeName: string,
    pdfStorageKey: string
  ) => {
    try {
      setError(null);
      const blob = await resumeApi.downloadResume(resumeId, pdfStorageKey);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${resumeName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast({
        type: "success",
        title: "Download started",
        message: `${resumeName} is being downloaded.`,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to download resume";
      setError(errorMessage);
      showToast({
        type: "error",
        title: "Download failed",
        message: errorMessage,
      });
      throw err;
    }
  };

  const viewResume = useCallback(
    (resumeId: string) => {
      const resume = resumes.find((r) => r.ID === resumeId);
      if (!resume) {
        showToast({
          type: "error",
          title: "Resume not found",
          message: "Could not find the resume to view.",
        });
        return;
      }

      if (!resume.ImageReady || !resume.ImageKeyPrefix) {
        showToast({
          type: "info",
          title: "Resume not ready",
          message:
            "Resume preview is still being processed. Please try again later.",
        });
        return;
      }

      // Return the resume data for the modal to use
      return {
        resumeName: resume.Name,
        imageKeyPrefix: resume.ImageKeyPrefix,
        cdnUrl: process.env.NEXT_PUBLIC_CDN_URL || "",
      };
    },
    [resumes, showToast]
  );

  const viewFeedback = useCallback(
    (resumeId: string) => {
      showToast({
        type: "info",
        title: "View Feedback",
        message: "Feedback view functionality will be implemented soon.",
      });
    },
    [showToast]
  );

  const viewPerformance = useCallback(
    (resumeId: string) => {
      showToast({
        type: "info",
        title: "View Performance",
        message: "Performance view functionality will be implemented soon.",
      });
    },
    [showToast]
  );

  useEffect(() => {
    fetchResumes();
  }, [user?.id]);

  return {
    // State
    resumes,
    activities,
    stats,
    loading,
    error,

    // Actions with toast notifications
    uploadResume,
    deleteResume,
    renameResume,
    downloadResume,
    viewResume,
    viewFeedback,
    viewPerformance,
  };
}
