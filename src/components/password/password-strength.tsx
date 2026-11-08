"use client";

import { cn } from "cn";
import { getStrengthColor } from "@/lib/password";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";

interface PasswordStrengthProps {
  strength: number;
}

export function PasswordStrength({ strength }: PasswordStrengthProps) {
  const indicatorColor = getStrengthColor(strength);

  return (
    <Progress value={strength}>
      <ProgressTrack>
        <ProgressIndicator
          className={cn(indicatorColor, "transition-all duration-500 ease-out")}
        />
      </ProgressTrack>
    </Progress>
  );
}
