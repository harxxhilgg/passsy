"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSaveDataStore } from "@/app/stores/use-savedata-store";
import { togglePinPasswordAction } from "@/app/actions/passwords";

type SavedRecordPinButtonProps = {
  id: string;
  isPinned?: boolean;
  className?: string;
};

export function SavedRecordPinButton({
  id,
  isPinned = false,
  className,
}: SavedRecordPinButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const togglePin = useSaveDataStore((state) => state.togglePin);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPending) return;

    // Optimistic toggle in store
    togglePin(id);
    setIsPending(true);

    try {
      const res = await togglePinPasswordAction(id);
      if (!res.success) {
        // Rollback if server action failed
        togglePin(id);
      }
    } catch (err) {
      console.error("Failed to toggle pin:", err);
      togglePin(id);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      className={cn(
        "size-6 shrink-0 rounded-md transition-all duration-150 focus-visible:opacity-100",
        isPinned
          ? "fill-amber-400 text-amber-400 opacity-100 hover:bg-amber-400/10"
          : "text-muted-foreground opacity-0 group-hover/record:opacity-100 hover:bg-muted hover:text-amber-400",
        className
      )}
      onClick={handleToggle}
      disabled={isPending}
      title={isPinned ? "Unpin password" : "Pin password"}
      aria-label={isPinned ? "Unpin password" : "Pin password"}
    >
      <Star
        className={cn(
          "size-3.5 transition-all duration-200",
          isPinned && "scale-105 fill-amber-400 text-amber-400"
        )}
      />
    </Button>
  );
}
