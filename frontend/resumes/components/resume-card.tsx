import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Resume } from "@/resumes/types";
import {
  FileText,
  Eye,
  Edit,
  Settings,
  MessageSquare,
  TrendingUp,
} from "lucide-react";

interface ResumeCardProps {
  resume: Resume;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onSettings: (id: number) => void;
  onViewFeedback: (id: number) => void;
  onViewPerformance: (id: number) => void;
}

export function ResumeCard({
  resume,
  onView,
  onEdit,
  onSettings,
  onViewFeedback,
  onViewPerformance,
}: ResumeCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "paused":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{resume.name}</CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{resume.industry}</Badge>
              <Badge variant="outline">{resume.level}</Badge>
              <Badge
                variant="secondary"
                className={getStatusColor(resume.status)}
              >
                {resume.status}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onView(resume.id)}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(resume.id)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSettings(resume.id)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resume Preview */}
        <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Resume Preview</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{resume.elo}</div>
            <div className="text-muted-foreground">Elo Rating</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {(resume.winRate * 100).toFixed(0)}%
            </div>
            <div className="text-muted-foreground">Win Rate</div>
          </div>
        </div>

        {/* Battle Stats */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Battles:</span>
            <span className="font-semibold">{resume.battles}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Wins:</span>
            <span className="font-semibold text-green-600">{resume.wins}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Feedback:</span>
            <span className="font-semibold">{resume.feedback}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Battle:</span>
            <span className="font-semibold">{resume.lastBattle}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewFeedback(resume.id)}
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            View Feedback
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewPerformance(resume.id)}
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            Performance
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
