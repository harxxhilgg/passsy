import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthButton } from "@/components/auth/auth-button";
import { fontMono, montserrat, playfairDisplay } from "@/utils/font";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
              <header className="absolute top-4 right-4 z-40 sm:top-6 sm:right-6">
                <AuthButton />
              </header>

              {children}
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
