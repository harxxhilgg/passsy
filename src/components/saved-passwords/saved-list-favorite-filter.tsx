"use client";

import { Pin } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSaveDataStore } from "@/app/stores/use-savedata-store";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SavedListFavoriteFilter() {
  const showFavoritesOnly = useSaveDataStore(
    (state) => state.showFavoritesOnly
  );
  const toggleShowFavoritesOnly = useSaveDataStore(
    (state) => state.toggleShowFavoritesOnly
  );

  return (
    <Tooltip>
      <TooltipTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon-xs" }),
          "size-7 cursor-pointer rounded-lg transition-colors",
          showFavoritesOnly
            ? "text-amber-400 hover:bg-amber-400/10 hover:text-amber-400"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
        onClick={toggleShowFavoritesOnly}
        aria-label={
          showFavoritesOnly
            ? "Show all passwords"
            : "Show pinned passwords only"
        }
        aria-pressed={showFavoritesOnly}
      >
        <Pin
          className={cn(
            "size-3.5 transition-all duration-200",
            showFavoritesOnly
              ? "scale-105 fill-amber-400 text-amber-400"
              : "text-muted-foreground"
          )}
        />
      </TooltipTrigger>

      <TooltipContent side="bottom">
        {showFavoritesOnly ? "Show all passwords" : "Show pinned passwords"}
      </TooltipContent>
    </Tooltip>
  );
}
