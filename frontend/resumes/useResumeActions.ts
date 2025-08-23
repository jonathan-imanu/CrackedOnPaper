import { useCallback } from "react";
import { useResumes } from "./useResumes";
import { useToast } from "@/components/ui/toast-context";

export function useResumeActions() {
  const { deleteResume, downloadResume, renameResume } = useResumes();
  const { showToast } = useToast();

  const handleDeleteResume = useCallback(
    async (resumeId: string, resumeName: string) => {
      try {
        await deleteResume(resumeId);
        showToast({
          type: "success",
          title: "Resume deleted",
          message: `${resumeName} has been deleted successfully.`,
        });
      } catch (error) {
        showToast({
          type: "error",
          title: "Delete failed",
          message:
            error instanceof Error ? error.message : "Failed to delete resume",
        });
      }
    },
    [deleteResume, showToast]
  );

  const handleDownloadResume = useCallback(
    async (resumeId: string, resumeName: string) => {
      try {
        await downloadResume(resumeId, resumeName);
        showToast({
          type: "success",
          title: "Download started",
          message: `${resumeName} is being downloaded.`,
        });
      } catch (error) {
        showToast({
          type: "error",
          title: "Download failed",
          message:
            error instanceof Error
              ? error.message
              : "Failed to download resume",
        });
      }
    },
    [downloadResume, showToast]
  );

  const handleRenameResume = useCallback(
    async (resumeId: string, newName: string, currentName: string) => {
      try {
        await renameResume(resumeId, newName);
        showToast({
          type: "success",
          title: "Resume renamed",
          message: `${currentName} has been renamed to ${newName}.`,
        });
      } catch (error) {
        showToast({
          type: "error",
          title: "Rename failed",
          message:
            error instanceof Error ? error.message : "Failed to rename resume",
        });
        throw error;
      }
    },
    [renameResume, showToast]
  );

  const handleViewResume = useCallback(
    (resumeId: string) => {
      showToast({
        type: "info",
        title: "View Resume",
        message: "Resume view functionality will be implemented soon.",
      });
    },
    [showToast]
  );

  const handleViewFeedback = useCallback(
    (resumeId: string) => {
      showToast({
        type: "info",
        title: "View Feedback",
        message: "Feedback view functionality will be implemented soon.",
      });
    },
    [showToast]
  );

  const handleViewPerformance = useCallback(
    (resumeId: string) => {
      showToast({
        type: "info",
        title: "View Performance",
        message: "Performance view functionality will be implemented soon.",
      });
    },
    [showToast]
  );

  return {
    handleDeleteResume,
    handleDownloadResume,
    handleRenameResume,
    handleViewResume,
    handleViewFeedback,
    handleViewPerformance,
  };
}
