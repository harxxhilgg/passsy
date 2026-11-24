"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { Spinner } from "@/components/ui/spinner";

type TurnstileGateProps = {
  initialVerified: boolean;
};

export function TurnstileGate({ initialVerified }: TurnstileGateProps) {
  const [isVerified, setIsVerified] = useState(initialVerified);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [widgetKey, setWidgetKey] = useState(0);

  const hasSiteKey = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  if (isVerified || !hasSiteKey) {
    return null;
  }

  const handleTokenChange = async (token: string | null) => {
    if (!token) {
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const res = await fetch("/api/turnstile/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = (await res.json()) as { success?: boolean; error?: string };

      if (res.ok && data.success) {
        setIsVerified(true);
      } else {
        setError(data.error || "Verification failed. Please try again.");
        setWidgetKey((prev) => prev + 1);
      }
    } catch {
      setError("Network error. Please try again.");
      setWidgetKey((prev) => prev + 1);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Security verification"
      className="fixed inset-0 z-50 flex flex-col justify-between bg-background px-6 py-10 text-foreground"
    >
      <div />

      <div className="mx-auto flex w-full max-w-md flex-col items-start gap-5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="size-5" />
          </div>
          <span className="font-serif text-xl font-semibold tracking-tight">
            Passsy
          </span>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            Verify you are human
          </h1>
          <p className="text-sm text-muted-foreground">
            Needs to review the security of your connection before proceeding.
          </p>
        </div>

        <div className="pt-1">
          <TurnstileWidget key={widgetKey} onTokenChange={handleTokenChange} />
        </div>

        {isVerifying && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Spinner className="size-3.5" />
            <span>Verifying...</span>
          </div>
        )}

        {error && (
          <p className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>

      <p className="mx-auto w-full max-w-md text-xs text-muted-foreground">
        Performance &amp; security by Cloudflare Turnstile
      </p>
    </div>
  );
}
