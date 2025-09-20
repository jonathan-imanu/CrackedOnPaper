import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Resume } from "@/features/resumes/types";
import { MessageSquareMoreIcon, SparklesIcon, TrendingUpIcon } from "@/components/animated-icons";
import { ResumeImage } from "./resume-image";
import { AnimatedButton } from "@/components/animated-icons";
import { useRef } from "react";
import { expierenceLevels, industries } from "@/constants";

interface ResumeCardProps {
  resume: Resume;
  onClick?: () => void;
  isSelected?: boolean;
  onFeedback?: () => void;
}

export function ResumeCard({ resume, onClick, isSelected, onFeedback }: ResumeCardProps) {
  // Refs for animated icons
  const chartSplineRef = useRef<any>(null);
  const sparklesRef = useRef<any>(null);

  // Handlers to trigger animation on group hover
  const handleCardMouseEnter = () => {
    chartSplineRef.current?.startAnimation?.();
    sparklesRef.current?.startAnimation?.();
  };

  const handleCardMouseLeave = () => {
    chartSplineRef.current?.stopAnimation?.();
    sparklesRef.current?.stopAnimation?.();
  };

  return (
    <Card
      className={`group hover:shadow-lg transition-all duration-300 border cursor-pointer relative shadow-2xl ${
        isSelected
          ? "border-green-500 shadow-green-500/25 ring-2 ring-green-500/30 scale-[1.02]"
          : "hover:border-primary"
      }`}
      onClick={onClick}
      onMouseEnter={handleCardMouseEnter}
      onMouseLeave={handleCardMouseLeave}
    >
      <div className="absolute top-3 right-3 z-10 flex gap-2">
        <AnimatedButton
          variant="accent"
          size="sm"
          className="bg-background/90 backdrop-blur-sm"
          icon={MessageSquareMoreIcon}
          iconOnly
          onClick={(e) => {
            e.stopPropagation();
            onFeedback?.();
          }}
        >
          Give Feedback
        </AnimatedButton>
      </div>

      <CardHeader className="pb-0">
        <div className="flex items-start justify-between mb-0">
          <CardTitle className={`text-lg font-semibold leading-tight line-clamp-2 pr-24 group-hover:text-primary transition-colors ${
            isSelected ? "text-green-600" : ""
          }`}>
            {resume.Name}
          </CardTitle>
        </div>

        <div className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-sm">
              {industries.find(i => i.value === resume.Industry)?.key}
            </Badge>
            <Badge variant="secondary" className="text-sm group-hover:bg-secondary/80 group-hover:text-secondary-foreground transition-colors">
              {expierenceLevels.find(l => l.value === resume.YoeBucket)?.key}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1 min-w-0 group-hover:text-primary">
              <span className="flex-shrink-0 flex items-center">
                <TrendingUpIcon size={15} ref={chartSplineRef} />
              </span>
              <span className="truncate">{resume.BattlesCount} battles</span>
            </div>
            <div className="flex items-center gap-1 group-hover:text-primary ">
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 transition-colors">
                <SparklesIcon size={15} ref={sparklesRef} />
              </span>
              <span className="font-semibold">{resume.CurrentEloInt} Elo</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <ResumeImage
          imageKeyPrefix={resume.ImageKeyPrefix}
          imageReady={resume.ImageReady}
          pageCount={resume.PageCount}
        />
      </CardContent>
    </Card>
  );
}