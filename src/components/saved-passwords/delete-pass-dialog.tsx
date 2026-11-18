"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  useSaveDataStore,
  type SavedRecord,
} from "@/app/stores/use-savedata-store";
import { usePasswordHistoryStore } from "@/app/stores/use-password-history-store";
import { deletePasswordAction } from "@/app/actions/passwords";

type DeletePassDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: Pick<SavedRecord, "id" | "site">;
  onDeleted?: () => void;
};

export function DeletePassDialog({
  open,
  onOpenChange,
  record,
  onDeleted,
}: DeletePassDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const removeRecord = useSaveDataStore((state) => state.removeRecord);

  const handleDelete = async () => {
    setIsDeleting(true);
    setServerError(null);

    const res = await deletePasswordAction(record.id);

    setIsDeleting(false);

    if (res.success) {
      removeRecord(record.id);
      usePasswordHistoryStore.getState().addActivity({
        site: record.site,
        action: "deleted",
      });
      onOpenChange(false);
      onDeleted?.();
    } else {
      setServerError(res.error || "Failed to delete password.");
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isDeleting) {
          setServerError(null);
          onOpenChange(nextOpen);
        }
      }}
    >
      <AlertDialogContent className="max-w-[calc(100vw-2rem)] gap-0 overflow-hidden p-0 sm:max-w-md">
        <div className="flex flex-col gap-4 p-6">
          <AlertDialogHeader className="flex flex-col items-start gap-5 text-left sm:text-left">
            <AlertDialogTitle className="text-left font-serif text-3xl font-semibold tracking-tight text-foreground">
              Delete password?
            </AlertDialogTitle>

            <AlertDialogDescription className="text-left text-sm text-muted-foreground">
              Are you sure you want to delete this password for {record.site}?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-2 pt-1 text-left">
            <Info className="size-4 text-muted-foreground" />

            <p className="text-sm leading-relaxed text-muted-foreground">
              This action cannot be undone. This record will be permanently
              removed from your encrypted vault.
            </p>
          </div>

          {serverError && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive">
              {serverError}
            </div>
          )}
        </div>

        <AlertDialogFooter className="grid w-full grid-cols-2 gap-3 border-t border-border/40 p-4 sm:grid sm:grid-cols-2 sm:p-5">
          <AlertDialogCancel className="w-full" disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            variant="destructive"
            className="w-full"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <Spinner className="size-4" /> : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
