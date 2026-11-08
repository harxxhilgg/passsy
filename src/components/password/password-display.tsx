"use client";

import { useState } from "react";
import { Copy, Check, AlertCircle, RotateCw } from "lucide-react";
import { cn } from "cn";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PasswordDisplayProps {
  value: string;
  copied: boolean;
  onCopy: () => void;
  onRefresh: () => void;
}

export function PasswordDisplay({
  value,
  copied,
  onCopy,
  onRefresh,
}: PasswordDisplayProps) {
  const [isRotating, setIsRotating] = useState(false);

  const handleRefreshClick = () => {
    setIsRotating(true);
    onRefresh();
    setTimeout(() => setIsRotating(false), 300);
  };

  return (
    <div className="flex w-full items-center gap-2">
      {/* Security info hover card */}
      <HoverCard>
        <HoverCardTrigger
          delay={150}
          closeDelay={100}
          className="inline-flex shrink-0 cursor-pointer text-muted-foreground/60 transition-colors hover:text-muted-foreground focus-visible:outline-none"
          aria-label="Password generation information"
        >
          <AlertCircle className="size-4" />
        </HoverCardTrigger>
        <HoverCardContent
          side="left"
          sideOffset={12}
          align="center"
          className="w-80"
        >
          <div className="flex flex-col gap-2 text-left">
            <p className="text-sm font-semibold text-foreground">
              Completely Random
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Every character is picked independently using cryptographically
              sound randomness. There are no preset seeds, templates, or
              patterns.
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Generated entirely inside your browser — never saved, tracked, or
              sent across the network.
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>

      {/* Truncated password output */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-xl text-foreground/80">{value}</p>
      </div>

      {/* Action buttons (Copy and Refresh) */}
      <div className="flex shrink-0 items-center gap-1">
        {/* Copy button with tooltip */}
        <Tooltip>
          <TooltipTrigger
            className="cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="Copy to clipboard"
            onClick={onCopy}
          >
            {copied ? (
              <Check className="size-4 text-green-500" />
            ) : (
              <Copy className="size-4" />
            )}
          </TooltipTrigger>
          <TooltipContent>Copy to clipboard</TooltipContent>
        </Tooltip>

        {/* Refresh button with tooltip */}
        <Tooltip>
          <TooltipTrigger
            className="cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="Refresh password"
            onClick={handleRefreshClick}
          >
            <RotateCw
              className={cn(
                "size-4 transition-transform duration-300 ease-out",
                isRotating && "rotate-180"
              )}
            />
          </TooltipTrigger>
          <TooltipContent>Refresh password</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
