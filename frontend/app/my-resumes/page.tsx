"use client";

import { Navbar } from "@/components/navbar/navbar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// States
import { NoResumes } from "@/resumes/components/empty-states/no-resumes";
import { NotAuthenticatedPage } from "@/resumes/components/empty-states/not-authenticated";
import { LoadingState } from "@/resumes/components/loading-state";

// Components
import { ResumeCard } from "@/resumes/components/resume-card";
import { RecentActivity } from "@/resumes/components/recent-activity";
import { QuickActions } from "@/resumes/components/quick-actions";
import { ResumeHeader } from "@/resumes/components/header";
import { Resume } from "@/resumes/types";
import { useResumes } from "@/resumes/useResumes";
import { useToast } from "@/components/ui/toast-context";
import { useAuth } from "@/components/auth-provider";

export default function MyResumesPage() {
  const { status } = useAuth();
  const { resumes, activities, stats, loading, error, refreshData } =
    useResumes();

  const { showToast } = useToast();

  // Handler functions
  const handleUploadSuccess = (resume: Resume) => {
    showToast({
      type: "success",
      title: "Resume uploaded successfully!",
      message: `${resume.name} has been added to your collection.`,
    });
  };

  const handleUploadError = (error: string) => {
    showToast({
      type: "error",
      title: "Upload failed",
      message: error,
    });
  };

  const handleViewResume = (id: number) => {
    console.log("View resume:", id);
    // TODO: Navigate to resume view page
  };

  const handleEditResume = (id: number) => {
    console.log("Edit resume:", id);
    // TODO: Navigate to resume edit page
  };

  const handleResumeSettings = (id: number) => {
    console.log("Resume settings:", id);
    // TODO: Open settings modal
  };

  const handleViewFeedback = (id: number) => {
    console.log("View feedback for resume:", id);
    // TODO: Navigate to feedback page
  };

  const handleViewPerformance = (id: number) => {
    console.log("View performance for resume:", id);
    // TODO: Navigate to performance page
  };

  const handleViewAllFeedback = () => {
    console.log("View all feedback");
    // TODO: Navigate to all feedback page
  };

  const handleViewAnalytics = () => {
    console.log("View analytics");
    // TODO: Navigate to analytics page
  };

  // Show loading state
  if (status === "loading" || loading) {
    return <LoadingState />;
  }

  // Show not authenticated state
  if (status === "unauthenticated") {
    return <NotAuthenticatedPage />;
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Something went wrong
            </h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={refreshData}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-8">
        <ResumeHeader
          handleUploadSuccess={handleUploadSuccess}
          handleUploadError={handleUploadError}
        />

        {/* Show empty state if no resumes */}
        {resumes.length === 0 ? (
          <NoResumes />
        ) : (
          <>
            {/* Resume Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {resumes.map((resume) => (
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  onView={handleViewResume}
                  onEdit={handleEditResume}
                  onSettings={handleResumeSettings}
                  onViewFeedback={handleViewFeedback}
                  onViewPerformance={handleViewPerformance}
                />
              ))}
            </div>

            <Separator className="my-8" />

            {/* Recent Activity */}
            <RecentActivity activities={activities} />

            {/* Quick Actions */}
            <QuickActions
              onUpload={() => {}} // TODO: Replace with upload modal trigger
              onViewFeedback={handleViewAllFeedback}
              onViewAnalytics={handleViewAnalytics}
            />
          </>
        )}
      </div>
    </div>
  );
}
