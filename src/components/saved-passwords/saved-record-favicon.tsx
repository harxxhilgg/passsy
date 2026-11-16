"use client";

import { useMemo, useState } from "react";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

type SavedRecordFaviconProps = {
  site: string;
  className?: string;
};

function getCleanDomain(site: string): string {
  const trimmed = site.trim();
  if (!trimmed) return "";

  try {
    const url =
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? new URL(trimmed)
        : new URL(`https://${trimmed}`);
    return url.hostname;
  } catch {
    return trimmed
      .replace(/^https?:\/\//i, "")
      .split("/")[0]
      .split(":")[0];
  }
}

export function SavedRecordFavicon({
  site,
  className,
}: SavedRecordFaviconProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const domain = useMemo(() => getCleanDomain(site), [site]);
  const hasValidDomain = domain.includes(".");

  return (
    <div
      className={cn(
        "relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/40 bg-card text-muted-foreground shadow-xs dark:bg-muted",
        className
      )}
    >
      {hasValidDomain && !hasError ? (
        <>
          {!isLoaded && <Globe className="size-4 text-muted-foreground" />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`}
            alt={`${domain} favicon`}
            referrerPolicy="no-referrer"
            className={cn(
              "size-4 rounded-xs object-contain transition-opacity duration-200",
              isLoaded ? "opacity-100" : "absolute opacity-0"
            )}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
          />
        </>
      ) : (
        <Globe className="size-4 text-muted-foreground" />
      )}
    </div>
  );
}
