import { useState } from "react";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { UploadFlow } from "./upload-flow";
import { Resume } from "@/resumes/types";
import { useResumes } from "@/resumes/useResumes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface UploadModalProps {
  trigger?: React.ReactNode;
  onSuccess?: (resume: Resume) => void;
  onError?: (error: string) => void;
}

export function UploadModal({ trigger, onSuccess, onError }: UploadModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { resumes, uploadResume } = useResumes();

  const handleUpload = async (file: File, name: string, version: string) => {
    setIsUploading(true);
    try {
      await uploadResume(file, name, version);
      // The upload was successful, but we don't have the resume object yet
      // We'll call onSuccess with a placeholder and let the parent handle the refresh
      const placeholderResume: Resume = {
        ID: "temp",
        Name: name,
        OwnerUserID: "",
        Industry: "",
        YoeBucket: "",
        CurrentEloInt: 0,
        BattlesCount: 0,
        LastMatchedAt: null,
        InFlight: true,
        CreatedAt: new Date().toISOString(),
        PdfStorageKey: "",
        PdfSizeBytes: file.size,
        PdfMime: file.type,
        ImageKeyPrefix: "",
        PageCount: 0,
        ImageReady: false,
        Slot: 0,
      };
      onSuccess?.(placeholderResume);
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
