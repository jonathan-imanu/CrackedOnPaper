import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AnimatedDropdownItem,
  AnimatedButton,
  SettingsGearIcon,
  SquarePenIcon,
  DownloadIcon,
  DeleteIcon,
} from "@/components/animated-icons";
import { RenameDialog } from "@/resumes/components/rename-dialog";

interface ResumeActionsDropdownProps {
  resumeId: string;
  resumeName: string;
  onView: (id: string) => void;
  onViewFeedback: (id: string) => void;
  onViewPerformance: (id: string) => void;
  onDelete?: (id: string) => void;
  onRename?: (id: string, newName: string) => void;
  onDownload?: (id: string) => void;
}

export function ResumeActionsDropdown({
  resumeId,
  resumeName,
  onDelete,
  onRename,
  onDownload,
}: ResumeActionsDropdownProps) {
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);

  const handleRenameClick = () => {
    setIsRenameDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <AnimatedButton
            variant="ghost"
            size="icon"
            title="Resume Actions"
            className="hover:bg-accent hover:text-accent-foreground"
            icon={SettingsGearIcon}
            iconOnly
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48" sideOffset={8}>
          <AnimatedDropdownItem
            icon={SquarePenIcon}
            onClick={handleRenameClick}
          >
            Rename
          </AnimatedDropdownItem>
          <AnimatedDropdownItem
            icon={DownloadIcon}
            onClick={() => onDownload?.(resumeId)}
          >
            Download PDF
          </AnimatedDropdownItem>

          <DropdownMenuSeparator />

          <AnimatedDropdownItem
            icon={DeleteIcon}
            onClick={() => onDelete?.(resumeId)}
            destructive
          >
            Delete
          </AnimatedDropdownItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenameDialog
        isOpen={isRenameDialogOpen}
        onClose={() => setIsRenameDialogOpen(false)}
        resumeId={resumeId}
        currentName={resumeName}
        onRenameSuccess={async (newName) => {
          await onRename?.(resumeId, newName);
          setIsRenameDialogOpen(false);
        }}
      />
    </>
  );
}
