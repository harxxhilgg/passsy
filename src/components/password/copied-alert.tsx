"use client";

import { Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CopiedAlertProps {
  show: boolean;
}

export function CopiedAlert({ show }: CopiedAlertProps) {
  return (
    <div
      className={`fixed right-6 bottom-6 z-50 transition-all duration-300 ease-out sm:right-8 sm:bottom-8 ${
        show
          ? "translate-x-0 opacity-100"
          : "pointer-events-none translate-x-8 opacity-0"
      }`}
    >
      <Alert className="w-auto shadow-lg">
        <Check className="text-green-500" />
        <AlertDescription>Copied to clipboard</AlertDescription>
      </Alert>
    </div>
  );
}
