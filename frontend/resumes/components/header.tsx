import { UploadModal } from "@/resumes/components/upload/upload-modal";
import { AnimatedButton, UploadIcon } from "@/components/animated-icons";
import { useToast } from "@/components/ui/toast-context";
import { Resume } from "@/resumes/types";

export function ResumeHeader() {
  const { showToast } = useToast();

  const handleUploadSuccess = (resume: Resume) => {
    showToast({
      type: "success",
      title: "Resume uploaded successfully!",
      message: `${resume.Name} has been added to your collection.`,
    });
  };

  const handleUploadError = (error: string) => {
    showToast({
      type: "error",
      title: "Upload failed",
      message: error,
    });
  };

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
          <AnimatedButton
            size="lg"
            className="mt-4 md:mt-0"
            icon={UploadIcon}
            iconOnly
          >
            Upload New Resume
          </AnimatedButton>
        }
        onSuccess={handleUploadSuccess}
        onError={handleUploadError}
      />
    </div>
  );
}
