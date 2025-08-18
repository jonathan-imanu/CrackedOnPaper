import { UploadModal } from "@/resumes/components/upload/upload-modal";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Resume } from "@/resumes/types";

export function ResumeHeader({
  handleUploadSuccess,
  handleUploadError,
}: {
  handleUploadSuccess: (resume: Resume) => void;
  handleUploadError: (error: string) => void;
}) {
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
        trigger={
          <Button size="lg" className="mt-4 md:mt-0">
            <Upload className="w-5 h-5 mr-2" />
            Upload New Resume
          </Button>
        }
        onSuccess={handleUploadSuccess}
        onError={handleUploadError}
      />
    </div>
  );
}
