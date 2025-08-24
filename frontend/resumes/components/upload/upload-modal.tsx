import { useState } from "react";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { UploadFlow } from "./upload-flow";
import { Resume } from "@/resumes/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface UploadModalProps {
  trigger?: React.ReactNode;
  resumes: Resume[];
  onUpload: (
    file: File,
    name: string,
    industry: string,
    yoeBucket: string
  ) => Promise<any>;
  onSuccess?: (resume: Resume) => void;
  onError?: (error: string) => void;
}

export function UploadModal({
  trigger,
  resumes,
  onUpload,
  onSuccess,
  onError,
}: UploadModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (
    file: File,
    name: string,
    version: string,
    industry: string,
    yoeBucket: string
  ) => {
    setIsUploading(true);
    try {
      await onUpload(file, name, industry, yoeBucket);
      setIsOpen(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <InteractiveHoverButton>Upload New Resume</InteractiveHoverButton>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30">
          <DialogTitle className="text-xl font-semibold">
            Upload Resume
          </DialogTitle>
        </DialogHeader>
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
          <UploadFlow
            existingResumes={resumes}
            onUpload={handleUpload}
            onCancel={handleClose}
            isUploading={isUploading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
