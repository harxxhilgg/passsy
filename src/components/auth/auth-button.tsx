"use client";

import { useState } from "react";
import { Info, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";

export function AuthButton() {
  const { user, isLoading, signInWithGoogle, signOut } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isLogoutAlertOpen, setIsLogoutAlertOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);

    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Sign in failed:", err);
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await signOut();
    } finally {
      setIsLoggingOut(false);
      setIsLogoutAlertOpen(false);
    }
  };

  // If loading and we don't have user state yet, show initial sign-in placeholder with spinner
  if (isLoading && !user) {
    return (
      <Button
        variant="secondary"
        disabled
        className="h-10 w-22 rounded-full opacity-70"
      >
        <Spinner className="size-4" />
      </Button>
    );
  }

  // Logged out state: Sign in button
  if (!user) {
    return (
      <Button
        variant="default"
        onClick={handleSignIn}
        disabled={isSigningIn}
        className="h-10 w-22 font-medium"
      >
        {isSigningIn ? <Spinner className="size-4" /> : "Sign in"}
      </Button>
    );
  }

  // User details
  const userName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "User";

  const avatarUrl =
    user.user_metadata?.avatar_url || user.user_metadata?.picture || "";

  const initials =
    userName
      .split(" ")
      .filter(Boolean)
      .map((part: string) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-12 cursor-pointer"
          )}
        >
          <Avatar className="size-6 shrink-0">
            <AvatarImage src={avatarUrl} alt={userName} />

            <AvatarFallback className="text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <span className="truncate text-[15px] font-medium">{userName}</span>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-60 p-1.5">
          <div className="mb-1 flex flex-row items-center gap-2.5 p-1.5 px-2">
            <Avatar className="size-8 shrink-0">
              <AvatarImage src={avatarUrl} alt={userName} />

              <AvatarFallback className="text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex min-w-0 flex-col">
              <span
                className="cursor-default truncate text-[16px] font-semibold"
                title={userName}
              >
                {userName}
              </span>

              {user.email && (
                <span
                  className="cursor-default truncate overflow-hidden text-xs text-muted-foreground"
                  title={user.email}
                >
                  {user.email}
                </span>
              )}
            </div>
          </div>

          <Separator className={"my-1.5"} />

          <DropdownMenuItem
            variant="destructive"
            onClick={() => setIsLogoutAlertOpen(true)}
            className="cursor-pointer"
          >
            <LogOut className="size-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isLogoutAlertOpen} onOpenChange={setIsLogoutAlertOpen}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] gap-0 overflow-hidden p-0 sm:max-w-md">
          <div className="flex flex-col gap-4 p-6">
            <AlertDialogHeader className="flex flex-col items-start gap-1 text-left sm:text-left">
              <AlertDialogTitle className="text-left text-lg font-semibold tracking-tight text-foreground">
                Logout?
              </AlertDialogTitle>

              <AlertDialogDescription className="text-left text-sm text-muted-foreground">
                Are you sure you want to logout?
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="flex flex-col gap-2 pt-1 text-left">
              <Info className="size-4 text-muted-foreground" />

              <p className="text-sm leading-relaxed text-muted-foreground">
                By continuing, you will be logged out and will need to login
                again to keep using your account.
              </p>
            </div>
          </div>

          <AlertDialogFooter className="grid w-full grid-cols-2 gap-3 border-t border-border/40 p-4 sm:grid sm:grid-cols-2 sm:p-5">
            <AlertDialogCancel className="w-full" disabled={isLoggingOut}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? <Spinner className="size-4" /> : "Logout"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
