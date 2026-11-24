import "./globals.css";
import { cookies } from "next/headers";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthButton } from "@/components/auth/auth-button";
import { TurnstileGate } from "@/components/turnstile-gate";
import { TURNSTILE_COOKIE_NAME } from "@/app/api/turnstile/verify/route";
import { fontMono, montserrat, playfairDisplay } from "@/utils/font";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialVerified = cookieStore.get(TURNSTILE_COOKIE_NAME)?.value === "1";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "font-sans antialiased",
        fontMono.variable,
        montserrat.variable,
        playfairDisplay.variable
      )}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>
            <div className="relative min-h-svh">
              <header className="absolute top-4 right-4 z-40 flex items-center gap-2 sm:top-6 sm:right-6">
                <AuthButton />
              </header>

              <TurnstileGate initialVerified={initialVerified} />
              {children}
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
