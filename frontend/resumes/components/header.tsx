import { UploadModal } from "@/resumes/components/upload/upload-modal";
import { AnimatedButton, UploadIcon } from "@/components/animated-icons";
import { Resume } from "@/resumes/types";

interface ResumeHeaderProps {
  resumes: Resume[];
  onUpload: (
    file: File,
    name: string,
    industry: string,
    yoeBucket: string
  ) => Promise<any>;
}

export function ResumeHeader({ resumes, onUpload }: ResumeHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
          My Resumes
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your uploaded resumes and track their performance
        </p>
      </div>
      <UploadModal
        resumes={resumes}
        onUpload={onUpload}
        trigger={
          <AnimatedButton
            size="lg"
            className="mt-4 md:mt-0"
            icon={UploadIcon}
            iconOnly
          >
            Upload New Resume
          </AnimatedButton>
        }
      />
    </div>
  );
}
