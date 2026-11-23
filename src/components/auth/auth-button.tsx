"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { History, Info, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/use-auth";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function AuthButton() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );
  const { user, isLoading, signInWithGoogle, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
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
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    user.identities?.[0]?.identity_data?.avatar_url ||
    user.identities?.[0]?.identity_data?.picture ||
    "";

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
            <AvatarImage
              src={avatarUrl}
              alt={userName}
              referrerPolicy="no-referrer"
            />

            <AvatarFallback className="text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <span className="truncate text-[15px] font-medium">{userName}</span>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48 p-1.5">
          <DropdownMenuItem
            render={<Link href="/activity" />}
            className="cursor-pointer"
          >
            <History className="size-4" />
            <span>History</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1.5" />

          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-2 py-1 text-xs font-normal text-muted-foreground">
              Appearance
            </DropdownMenuLabel>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="cursor-pointer">
                <span>Theme</span>
              </DropdownMenuSubTrigger>

              <DropdownMenuSubContent
                side="left"
                alignOffset={-4}
                className="min-w-32 p-1"
              >
                <DropdownMenuRadioGroup
                  value={isClient ? theme : "system"}
                  onValueChange={(val) => setTheme(val)}
                >
                  <DropdownMenuRadioItem
                    value="system"
                    className="cursor-pointer"
                  >
                    System
                  </DropdownMenuRadioItem>

                  <DropdownMenuRadioItem
                    value="light"
                    className="cursor-pointer"
                  >
                    Light
                  </DropdownMenuRadioItem>

                  <DropdownMenuRadioItem
                    value="dark"
                    className="cursor-pointer"
                  >
                    Dark
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-1.5" />

          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-2 py-1 text-xs font-normal text-muted-foreground">
              Danger Zone
            </DropdownMenuLabel>

            <DropdownMenuItem
              onClick={() => setIsLogoutAlertOpen(true)}
              className="cursor-pointer"
            >
              <LogOut className="size-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isLogoutAlertOpen} onOpenChange={setIsLogoutAlertOpen}>
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] gap-0 overflow-hidden p-0 sm:max-w-md">
          <div className="flex flex-col gap-4 p-6">
            <AlertDialogHeader className="flex flex-col items-start gap-5 text-left sm:text-left">
              <AlertDialogTitle className="text-left font-serif text-3xl font-semibold tracking-tight">
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
