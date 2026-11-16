"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  calcPasswordStrength,
  getStrengthColor,
  getStrengthLabel,
} from "@/lib/password";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";

type SavedPasswordStrengthProps = {
  password: string;
  className?: string;
};

export function SavedPasswordStrength({
  password,
  className,
}: SavedPasswordStrengthProps) {
  const score = useMemo(() => calcPasswordStrength(password), [password]);
  const indicatorColor = getStrengthColor(score);
  const label = getStrengthLabel(score);

  return (
    <div className={cn("flex flex-col gap-1.5 pt-1", className)}>
      <div className="flex items-center justify-between px-0.5 text-[11px] text-muted-foreground">
        <span>Password strength</span>
        <span className="font-serif italic text-xs text-foreground/80">
          {label}
        </span>
      </div>

      <Progress value={score} className="w-full">
        <ProgressTrack className="h-1.5 w-full bg-border/40">
          <ProgressIndicator
            className={cn(
              indicatorColor,
              "transition-all duration-500 ease-out"
            )}
          />
        </ProgressTrack>
      </Progress>
    </div>
  );
}
