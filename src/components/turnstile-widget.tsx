"use client";

import { Turnstile } from "@marsidev/react-turnstile";
import { useTheme } from "next-themes";

type TurnstileWidgetProps = {
  onTokenChange: (token: string | null) => void;
};

export function TurnstileWidget({ onTokenChange }: TurnstileWidgetProps) {
  const { resolvedTheme } = useTheme();
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    return null;
  }

  return (
    <div className="flex justify-center pt-1">
      <Turnstile
        siteKey={siteKey}
        onSuccess={(token) => onTokenChange(token)}
        onExpire={() => onTokenChange(null)}
        onError={() => onTokenChange(null)}
        options={{
          theme: resolvedTheme === "dark" ? "dark" : "light",
          size: "normal",
        }}
      />
    </div>
  );
}
