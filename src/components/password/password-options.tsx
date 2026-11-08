"use client";

import { Button } from "@/components/ui/button";

interface PasswordOptionsProps {
  withNumbers: boolean;
  withSpecials: boolean;
  onToggleNumbers: () => void;
  onToggleSpecials: () => void;
}

export function PasswordOptions({
  withNumbers,
  withSpecials,
  onToggleNumbers,
  onToggleSpecials,
}: PasswordOptionsProps) {
  return (
    <div className="flex w-full gap-3">
      <Button
        variant={withNumbers ? "default" : "outline"}
        className="flex-1 transition-colors duration-200"
        onClick={onToggleNumbers}
        aria-pressed={withNumbers}
      >
        Numbers
      </Button>

      <Button
        variant={withSpecials ? "default" : "outline"}
        className="flex-1 transition-colors duration-200"
        onClick={onToggleSpecials}
        aria-pressed={withSpecials}
      >
        Symbols
      </Button>
    </div>
  );
}
