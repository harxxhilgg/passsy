"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SavedListSearchProps = {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
};

export function SavedListSearch({
  value,
  onChange,
  onClear,
}: SavedListSearchProps) {
  return (
    <div className="relative mb-4 w-full">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search websites..."
        aria-label="Search websites"
        className="h-9 w-full rounded-xl border-border/60 bg-card pr-9 pl-9 shadow-xs transition-colors placeholder:text-muted-foreground/70 focus-visible:ring-1 dark:bg-muted/40"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onClear}
          className="absolute top-1/2 right-2 size-6 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          title="Clear search"
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
