"use client";

import React, { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button } from "../ui";
import { InitiativeMock } from "../../lib/mockData";
import { AlertTriangle, Trash2 } from "lucide-react";

export interface DeleteInitiativeDialogProps {
  isOpen: boolean;
  initiative: InitiativeMock | null;
  onClose: () => void;
  onConfirmDelete: (id: string) => Promise<void>;
}

export function DeleteInitiativeDialog({
  isOpen,
  initiative,
  onClose,
  onConfirmDelete,
}: DeleteInitiativeDialogProps) {
  const [deleting, setDeleting] = useState(false);

  if (!initiative) return null;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onConfirmDelete(initiative.id);
      onClose();
    } catch (err: any) {
      alert(err.message || "Failed to delete initiative.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} className="max-w-md text-center">
      <DialogHeader>
        <div className="mx-auto p-3 rounded-full bg-rose-500/10 text-rose-500 w-12 h-12 flex items-center justify-center mb-2">
          <Trash2 className="w-6 h-6" />
        </div>
        <DialogTitle className="text-base font-bold text-foreground">
          Delete Strategic Initiative
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
          Are you sure you want to delete <strong>"{initiative.name}"</strong>?
          <br />
          This will perform a soft-delete and archive historical financial baselines.
        </DialogDescription>
      </DialogHeader>

      <DialogFooter className="justify-center gap-3 mt-4">
        <Button
          onClick={onClose}
          disabled={deleting}
          variant="secondary"
          className="text-xs"
        >
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          loading={deleting}
          loadingText="Deleting..."
          variant="danger"
          className="text-xs"
        >
          Confirm Soft Delete
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
