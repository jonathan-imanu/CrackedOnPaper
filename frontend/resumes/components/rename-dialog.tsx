"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RenameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  currentName: string;
  onRenameSuccess: (newName: string) => Promise<void>;
}

export function RenameDialog({
  isOpen,
  onClose,
  resumeId,
  currentName,
  onRenameSuccess,
}: RenameDialogProps) {
  const [newName, setNewName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName.trim()) {
      return;
    }

    if (newName.trim() === currentName) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      await onRenameSuccess(newName.trim());
      onClose();
    } catch (error) {
      // Error is already handled by the parent component
      // Just keep the dialog open for user to retry
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNewName(currentName);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename Resume</DialogTitle>
          <DialogDescription>
            Enter a new name for your resume. The name must be alphanumeric and
            between 1-40 characters.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="col-span-3"
                placeholder="Enter resume name"
                maxLength={40}
                pattern="[a-zA-Z0-9]+"
                title="Only alphanumeric characters are allowed"
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !newName.trim()}>
              {isLoading ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
