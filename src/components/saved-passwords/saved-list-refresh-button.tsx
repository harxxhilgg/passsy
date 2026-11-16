"use client";

import { useEffect, useRef, useState } from "react";
import { Check, RotateCw } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useSaveDataStore } from "@/app/stores/use-savedata-store";
import { getUserPasswordsAction } from "@/app/actions/passwords";
import { useAuth } from "@/hooks/use-auth";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function SavedListRefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const setRecords = useSaveDataStore((state) => state.setRecords);
  const { user } = useAuth();
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
  }, []);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    const startTime = Date.now();

    try {
      if (user) {
        const res = await getUserPasswordsAction();
        if (res.success && res.records) {
          setRecords(res.records);
        }
      }
    } catch (err) {
      console.error("Failed to refresh passwords:", err);
    } finally {
      // Ensure smooth spin animation of at least 500ms
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 500 - elapsed);

      setTimeout(() => {
        setIsRefreshing(false);
        setShowAlert(true);

        if (alertTimeoutRef.current) {
          clearTimeout(alertTimeoutRef.current);
        }

        alertTimeoutRef.current = setTimeout(() => {
          setShowAlert(false);
        }, 2000);
      }, remaining);
    }
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon-xs" }),
            "size-7 cursor-pointer rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          )}
          onClick={handleRefresh}
          disabled={isRefreshing}
          aria-label="Refresh saved passwords"
        >
          <RotateCw
            className={cn(
              "size-3.5 transition-transform",
              isRefreshing && "animate-spin text-foreground"
            )}
          />
        </TooltipTrigger>

        <TooltipContent side="bottom">Refresh records</TooltipContent>
      </Tooltip>

      <div
        className={`fixed right-6 bottom-6 z-50 transition-all duration-300 ease-out sm:right-8 sm:bottom-8 ${
          showAlert
            ? "translate-x-0 opacity-100"
            : "pointer-events-none translate-x-8 opacity-0"
        }`}
      >
        <Alert className="w-auto shadow-lg">
          <Check className="text-green-500" />
          <AlertDescription>Passwords refreshed</AlertDescription>
        </Alert>
      </div>
    </>
  );
}
