"use client";

import { Navbar } from "@/components/navbar/navbar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// States
import { NoResumes } from "@/resumes/components/empty-states/no-resumes";
import { NotAuthenticatedPage } from "@/resumes/components/empty-states/not-authenticated";
import { LoadingState } from "@/resumes/components/loading-state";

// Components
import { ResumeCard } from "@/resumes/components/resume-card/resume-card";
import { RecentActivity } from "@/resumes/components/recent-activity";
import { ResumeHeader } from "@/resumes/components/header";
import { useResumes } from "@/resumes/useResumes";
import { useAuth } from "@/components/auth-provider";

export default function MyResumesPage() {
  const { status } = useAuth();
  const { resumes, activities, loading, error } = useResumes();

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
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-8">
        <ResumeHeader />

        {/* Show empty state if no resumes */}
        {resumes.length === 0 ? (
          <NoResumes />
        ) : (
          <>
            {/* Resume Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {resumes.map((resume) => (
                <ResumeCard key={resume.ID} resume={resume} />
              ))}
            </div>

            <Separator className="my-8" />

            {/* Recent Activity */}
            <RecentActivity activities={activities} />
          </>
        )}
      </div>
    </div>
  );
}
