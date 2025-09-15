"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ResumeViewerContent } from "./resume-viewer-content";

interface ResumeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeName: string;
  imageKeyPrefix: string;
  cdnUrl: string;
}

export function ResumeViewerModal({
  isOpen,
  onClose,
  resumeName,
  imageKeyPrefix,
  cdnUrl,
}: ResumeViewerModalProps) {
  const [rotation, setRotation] = useState(0);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex flex-row items-center justify-between flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">
            {resumeName}
          </DialogTitle>
        </DialogHeader>

        <div className="relative flex-1 overflow-hidden">
          <ResumeViewerContent
            resumeName={resumeName}
            imageKeyPrefix={imageKeyPrefix}
            cdnUrl={cdnUrl}
          />
        </div>

        <div className="px-6 py-3 border-t bg-muted/30 flex-shrink-0">
          <div className="text-center text-sm text-muted-foreground">
            <p>Rotation: {rotation}°</p>
            <p className="mt-1">
              Use mouse wheel to zoom, drag to pan, or use the controls above.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
