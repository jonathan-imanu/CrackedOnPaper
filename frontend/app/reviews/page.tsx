"use client";
import { Navbar } from "@/components/navbar/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Annotator from "@/features/reviews/annotator";
import { useState } from "react";
import { FileText, Star, MessageSquare } from "lucide-react";

export default function ReviewsPage() {
  const [selectedResume, setSelectedResume] = useState<string | null>(null);

  // Mock data for now - this will come from API later
  const mockResumes = [
    {
      id: "1",
      name: "Software Engineer Resume",
      industry: "Technology",
      yoe: "3-5 years",
      imageUrl: "https://crackedonpaperwebp.sfo3.cdn.digitaloceanspaces.com/constants/JonathanManuelResume.pdf",
      reviewCount: 3,
      lastReviewed: "2 days ago"
    },
    {
      id: "2", 
      name: "Marketing Manager Resume",
      industry: "Marketing",
      yoe: "5-7 years",
      imageUrl: "https://crackedonpaperwebp.sfo3.cdn.digitaloceanspaces.com/constants/JonathanManuelResume.pdf",
      reviewCount: 1,
      lastReviewed: "1 week ago"
    }
  ];

  const handleStartReview = (resumeId: string) => {
    setSelectedResume(resumeId);
  };

  const handleSaveReview = (annotations: any[]) => {
    console.log("Saving review with annotations:", annotations);
    setSelectedResume(null);
    // TODO: Save to backend
  };

  const handleCancelReview = () => {
    setSelectedResume(null);
  };

  // Show annotation editor if a resume is selected
  if (selectedResume) {
    const resume = mockResumes.find(r => r.id === selectedResume);
    if (resume) {
      return (
        <Annotator
          resumeId={resume.id}
          resumeName={resume.name}
          imageUrl={resume.imageUrl}
          onSave={handleSaveReview}
          onCancel={handleCancelReview}
        />
      );
    }
  }

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Resume Reviews</h1>
          <p className="text-muted-foreground">
            Review and annotate resumes to provide valuable feedback
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockResumes.map((resume) => (
            <Card key={resume.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{resume.name}</CardTitle>
                  <Badge variant="secondary">{resume.industry}</Badge>
                </div>
                <CardDescription>
                  {resume.yoe} experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Resume Preview Image */}
                  <div className="relative bg-muted rounded-lg h-48 flex items-center justify-center">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                    <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="secondary">
                        Preview
                      </Button>
                    </div>
                  </div>

                  {/* Review Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{resume.reviewCount} reviews</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      <span>4.2</span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Last reviewed {resume.lastReviewed}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleStartReview(resume.id)}
                      className="flex-1"
                    >
                      Start Review
                    </Button>
                    <Button variant="outline" size="sm">
                      View Reviews
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {mockResumes.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No resumes available for review</h3>
              <p className="text-muted-foreground mb-4">
                Check back later for new resumes to review
              </p>
              <Button variant="outline">
                Refresh
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
