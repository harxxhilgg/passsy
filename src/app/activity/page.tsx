import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Footer } from "@/components/footer";
import { PasswordHistoryList } from "@/components/password-history/password-history-list";

export const metadata: Metadata = {
  title: "Activity Log | Passsy",
  description: "View activity history for your saved and deleted passwords",
};

export default function ActivityPage() {
  return (
    <div className="flex min-h-svh flex-col p-6 sm:p-10">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col pt-6 sm:pt-10">
        <div className="mb-6">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "-ml-2 rounded-xl text-xs text-muted-foreground hover:text-foreground"
            )}
          >
            <ArrowLeft className="size-3.5" />
            <span>Back</span>
          </Link>
        </div>

        <PasswordHistoryList />
      </main>

      <footer className="mx-auto mt-16 text-sm leading-loose">
        <Footer />
      </footer>
    </div>
  );
}
