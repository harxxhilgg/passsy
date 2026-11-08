"use client";

import { MIN_LENGTH, MAX_LENGTH } from "@/lib/password";
import { Slider } from "@/components/ui/slider";

interface PasswordLengthSliderProps {
  length: number;
  onLengthChange: (length: number) => void;
}

export function PasswordLengthSlider({
  length,
  onLengthChange,
}: PasswordLengthSliderProps) {
  const handleChange = (newValue: number | readonly number[]) => {
    const nextLen = Array.isArray(newValue)
      ? newValue[0]
      : (newValue as number);
    onLengthChange(nextLen);
  };

  return (
    <div className="flex w-full items-center gap-2">
      <Slider
        value={[length]}
        onValueChange={handleChange}
        max={MAX_LENGTH}
        min={MIN_LENGTH}
        step={1}
        className="cursor-pointer"
      />
      <p className="w-10 text-center text-base font-semibold tabular-nums">
        {length}
      </p>
    </div>
  );
}
