import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Resume } from "@/resumes/types";
import {
  AnimatedButton,
  MessageSquareMoreIcon,
  TrendingUpIcon,
  TelescopeIcon,
} from "@/components/animated-icons";
import { ResumeActionsDropdown } from "./resume-actions-dropdown";
import { FileText, CheckCircle, Clock } from "lucide-react";
import { useResumeActions } from "@/resumes/useResumeActions";

interface ResumeCardProps {
  resume: Resume;
}

export function ResumeCard({ resume }: ResumeCardProps) {
  const {
    handleViewResume,
    handleViewFeedback,
    handleViewPerformance,
    handleDeleteResume,
    handleDownloadResume,
    handleRenameResume,
  } = useResumeActions();

  const getStatusInfo = (inFlight: boolean) => {
    if (inFlight) {
      return {
        icon: <Clock className="w-4 h-4" />,
        text: "Processing",
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700",
      };
    }
    return {
      icon: <CheckCircle className="w-4 h-4" />,
      text: "Active",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-yellow-700",
    };
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const statusInfo = getStatusInfo(resume.InFlight);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{resume.Name}</CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{resume.Industry}</Badge>
              <Badge variant="outline">{resume.YoeBucket} YOE</Badge>
              <Badge
                variant="secondary"
                className={`${statusInfo.color} border flex items-center gap-1`}
              >
                {statusInfo.icon}
                {statusInfo.text}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <AnimatedButton
              variant="ghost"
              size="icon"
              onClick={() => handleViewResume(resume.ID)}
              title="View Resume"
              icon={TelescopeIcon}
              iconOnly
            />
            <ResumeActionsDropdown
              resumeId={resume.ID}
              resumeName={resume.Name}
              onView={() => handleViewResume(resume.ID)}
              onViewFeedback={() => handleViewFeedback(resume.ID)}
              onViewPerformance={() => handleViewPerformance(resume.ID)}
              onDelete={() => handleDeleteResume(resume.ID, resume.Name)}
              onRename={(id, newName) =>
                handleRenameResume(id, newName, resume.Name)
              }
              onDownload={() => handleDownloadResume(resume.ID, resume.Name)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resume Preview */}
        <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Resume Preview</p>
            <p className="text-xs text-muted-foreground">
              {resume.PageCount} page{resume.PageCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {resume.CurrentEloInt}
            </div>
            <div className="text-muted-foreground">Elo Rating</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {resume.BattlesCount}
            </div>
            <div className="text-muted-foreground">Battles</div>
          </div>
        </div>

        {/* Resume Stats */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">File Size:</span>
            <span className="font-semibold">
              {formatFileSize(resume.PdfSizeBytes)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pages:</span>
            <span className="font-semibold">{resume.PageCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Matched:</span>
            <span className="font-semibold">
              {formatDate(resume.LastMatchedAt)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created:</span>
            <span className="font-semibold">
              {formatDate(resume.CreatedAt)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <AnimatedButton
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleViewFeedback(resume.ID)}
            icon={MessageSquareMoreIcon}
          >
            View Feedback
          </AnimatedButton>
          <AnimatedButton
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => handleViewPerformance(resume.ID)}
            icon={TrendingUpIcon}
          >
            Performance
          </AnimatedButton>
        </div>
      </CardContent>
    </Card>
  );
}
