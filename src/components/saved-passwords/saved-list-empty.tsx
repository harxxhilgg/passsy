"use client";

import { SearchX, Vault } from "lucide-react";

type SavedListEmptyProps = {
  type: "no-records" | "no-results";
  query?: string;
};

export function SavedListEmpty({ type, query }: SavedListEmptyProps) {
  if (type === "no-results") {
    return (
      <div className="flex animate-in flex-col items-center justify-center py-8 text-center text-muted-foreground duration-200 fade-in-0">
        <SearchX className="mb-2 size-8 opacity-40" />
        <p className="text-sm font-medium text-foreground">
          No matching websites
        </p>
        {query && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            No records found for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex animate-in flex-col items-center justify-center py-10 text-center duration-300 fade-in-0">
      <div className="mb-3 flex size-12 items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/40 text-muted-foreground/80 shadow-xs">
        <Vault className="size-6" />
      </div>
      <p className="text-sm font-medium text-foreground">
        No saved passwords yet
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Added records will show up here
      </p>
    </div>
  );
}
