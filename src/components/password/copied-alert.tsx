"use client";

import { Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CopiedAlertProps {
  show: boolean;
}

export function CopiedAlert({ show }: CopiedAlertProps) {
  return (
    <div
      className={`fixed bottom-8 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ${show
        ? "translate-y-0 opacity-100"
        : "pointer-events-none translate-y-2 opacity-0"
        }`}
    >
      <Alert className="w-auto shadow-lg">
        <Check className="text-green-500" />
        <AlertDescription>Copied to clipboard</AlertDescription>
      </Alert>
    </div>
  );
}
