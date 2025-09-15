import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Resume } from "@/features/resumes/types";
import {
  AnimatedButton,
  MessageSquareMoreIcon,
  TrendingUpIcon,
  TelescopeIcon,
} from "@/components/animated-icons";
import { ResumeActionsDropdown } from "./resume-actions-dropdown";
import { FileText, CheckCircle, Clock } from "lucide-react";
import Image from "next/image";
import { Lens } from "@/components/ui/lens";
import { ResumeViewerModal } from "@/features/resumes/components/resume-viewer/resume-viewer-modal";
import { industries, expierenceLevels } from "@/constants";

interface ResumeCardProps {
  resume: Resume;
  onDelete: (
    resumeId: string,
    imageKeyPrefix: string,
    pdfStorageKey: string
  ) => Promise<void>;
  onDownload: (
    resumeId: string,
    resumeName: string,
    pdfStorageKey: string
  ) => Promise<void>;
  onRename: (
    resumeId: string,
    newName: string,
    currentName: string
  ) => Promise<void>;
  onView: (resumeId: string) => any;
  onViewFeedback: (resumeId: string) => void;
  onViewPerformance: (resumeId: string) => void;
}

export function ResumeCard({
  resume,
  onDelete,
  onDownload,
  onRename,
  onView,
  onViewFeedback,
  onViewPerformance,
}: ResumeCardProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerData, setViewerData] = useState<{
    resumeName: string;
    imageKeyPrefix: string;
    cdnUrl: string;
  } | null>(null);

  const handleViewResume = () => {
    const data = onView(resume.ID);
    if (data) {
      setViewerData(data);
      setIsViewerOpen(true);
    }
  };
;

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{resume.Name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className={`bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-yellow-700 flex items-center gap-1`}
                >
                  <CheckCircle className="w-4 h-4" />
                    Active
                </Badge>
                <Badge variant="outlineSpecial">{industries.find(i => i.value === resume.Industry)?.key}</Badge>
                <Badge variant="outlineSpecial">
                  {expierenceLevels.find(l => l.value === resume.YoeBucket)?.key}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <AnimatedButton
                variant="ghost"
                size="icon"
                onClick={handleViewResume}
                title="View Resume"
                icon={TelescopeIcon}
                iconOnly
              />
              <ResumeActionsDropdown
                resumeId={resume.ID}
                resumeName={resume.Name}
                onView={handleViewResume}
                onViewFeedback={() => onViewFeedback(resume.ID)}
                onViewPerformance={() => onViewPerformance(resume.ID)}
                onDelete={() =>
                  onDelete(
                    resume.ID,
                    resume.ImageKeyPrefix,
                    resume.PdfStorageKey
                  )
                }
                onRename={(id, newName) => onRename(id, newName, resume.Name)}
                onDownload={() =>
                  onDownload(resume.ID, resume.Name, resume.PdfStorageKey)
                }
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 max-h-3xl">
          {resume.ImageReady && resume.ImageKeyPrefix ? (
            <div className="aspect-[3/4] rounded-lg flex items-center justify-center">
              <Lens zoomFactor={2.0} lensSize={300}>
                <Image
                  src={`${process.env.NEXT_PUBLIC_CDN_URL}/${resume.ImageKeyPrefix}`}
                  alt={resume.Name}
                  width={1200}
                  height={1200}
                  className="object-contain"
                />
              </Lens>
            </div>
          ) : (
            <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Resume Preview</p>
                <p className="text-xs text-muted-foreground">
                  {resume.PageCount} page{resume.PageCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {resume.CurrentEloInt}
              </div>
              <div className="text-muted-foreground">Elo Rating</div>
            </div>
            <div className="text-center p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {resume.BattlesCount}
              </div>
              <div className="text-muted-foreground">Battles</div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <AnimatedButton
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onViewFeedback(resume.ID)}
              icon={MessageSquareMoreIcon}
            >
              View Feedback
            </AnimatedButton>
            <AnimatedButton
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onViewPerformance(resume.ID)}
              icon={TrendingUpIcon}
            >
              Performance
            </AnimatedButton>
          </div>
        </CardContent>
      </Card>

      {/* Resume Viewer Modal */}
      {viewerData && (
        <ResumeViewerModal
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          resumeName={viewerData.resumeName}
          imageKeyPrefix={viewerData.imageKeyPrefix}
          cdnUrl={viewerData.cdnUrl}
        />
      )}
    </>
  );
}
