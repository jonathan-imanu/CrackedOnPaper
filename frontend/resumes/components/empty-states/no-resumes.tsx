import { FileText, Upload } from "lucide-react";
import { UploadModal } from "@/resumes/components/upload/upload-modal";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

interface NoResumesProps {
  onUpload: (
    file: File,
    name: string,
    industry: string,
    yoeBucket: string
  ) => Promise<any>;
}

export function NoResumes({ onUpload }: NoResumesProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] sm:min-h-[70vh] py-10 sm:py-16 px-2 sm:px-4 w-full">
      <div className="text-center w-full max-w-xs sm:max-w-md md:max-w-lg mx-auto">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          No Resumes Yet
        </h2>
        <p className="text-muted-foreground mb-8 text-base sm:text-lg max-w-5xl mx-auto">
          Upload your first resume to see how you stack up against real
          candidates and get unfiltered feedback.
        </p>

        <div className="flex justify-center">
          <UploadModal
            resumes={[]}
            onUpload={onUpload}
            trigger={
              <InteractiveHoverButton
                icon={<Upload className="w-5 h-5" />}
                iconPosition="left"
              >
                Upload Resume
              </InteractiveHoverButton>
            }
          />
        </div>
      </div>
    </div>
  );
}
