"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  MoreVertical,
  Pencil,
  Pin,
  Trash2,
  User,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  calcPasswordStrength,
  getStrengthLabel,
  getStrengthTextColor,
} from "@/lib/password";
import {
  useSaveDataStore,
  type SavedRecord,
} from "@/app/stores/use-savedata-store";
import { togglePinPasswordAction } from "@/app/actions/passwords";
import { EditPassDialog } from "./edit-pass-dialog";
import { DeletePassDialog } from "./delete-pass-dialog";
import { SavedRecordFavicon } from "./saved-record-favicon";

type SavedRecordItemProps = {
  item: SavedRecord;
};

export function SavedRecordItem({ item }: SavedRecordItemProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPinning, setIsPinning] = useState(false);

  const togglePin = useSaveDataStore((state) => state.togglePin);

  const hasUsername = Boolean(item.username?.trim());
  const isEmailCopied = copiedKey === `email-${item.id}`;
  const isUserCopied = copiedKey === `user-${item.id}`;
  const isPassCopied = copiedKey === `pass-${item.id}`;

  const strengthScore = useMemo(
    () => calcPasswordStrength(item.password),
    [item.password]
  );
  const keyIconColor = getStrengthTextColor(strengthScore);
  const strengthLabel = getStrengthLabel(strengthScore);

  const siteUrl = useMemo(() => {
    const trimmed = item.site.trim();
    if (!trimmed) return "#";
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    return `https://${trimmed}`;
  }, [item.site]);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleTogglePin = async () => {
    if (isPinning) return;
    setIsPinning(true);
    // Optimistic toggle in store
    togglePin(item.id);
    try {
      const res = await togglePinPasswordAction(item.id);
      if (!res.success) {
        togglePin(item.id);
      }
    } catch (err) {
      console.error("Failed to toggle pin:", err);
      togglePin(item.id);
    } finally {
      setIsPinning(false);
    }
  };

  return (
    <>
      <div className="group/record flex min-w-0 animate-in flex-col gap-3 overflow-hidden rounded-2xl border border-border/60 bg-muted/30 p-3.5 shadow-xs transition-all duration-300 ease-out fade-in-0 zoom-in-95">
        {/* Header: Site + Link button + Pin badge & Three-dots options dropdown */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <SavedRecordFavicon site={item.site} />

            <span className="truncate text-sm font-medium">{item.site}</span>

            {/* Subtle indicator when pinned (placed before link button so it sits flush with the site name) */}
            {item.isPinned && (
              <span
                title="Pinned"
                className="inline-flex shrink-0 text-amber-400"
                aria-label="Pinned"
              >
                <Pin className="size-3 fill-amber-400" />
              </span>
            )}

            {/* Direct site launch link button (only this icon button is clickable, not the site name) */}
            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon-xs" }),
                "size-6 shrink-0 rounded-md text-muted-foreground opacity-0 transition-opacity duration-150 group-hover/record:opacity-100 hover:bg-transparent hover:text-foreground focus-visible:opacity-100"
              )}
              title={`Open ${item.site}`}
              aria-label={`Open ${item.site}`}
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="size-3.5" />
            </a>
          </div>

          {/* Three vertical dots dropdown: visible on card hover or when open */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon-xs" }),
                "size-7 shrink-0 cursor-pointer rounded-lg text-muted-foreground opacity-0 transition-opacity duration-150 group-hover/record:opacity-100 hover:bg-muted hover:text-foreground focus-visible:opacity-100 data-popup-open:opacity-100"
              )}
              title="More options"
              aria-label="More options"
            >
              <MoreVertical className="size-3.5" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-36 p-1">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={handleTogglePin}
                disabled={isPinning}
              >
                <Pin
                  className={cn(
                    "size-4",
                    item.isPinned && "fill-amber-400 text-amber-400"
                  )}
                />
                <span>{item.isPinned ? "Unpin" : "Pin"}</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Pencil className="size-4" />
                <span>Edit</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="size-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Credential rows */}
        <div className="grid min-w-0 gap-2 text-xs">
          {/* Email row - always present */}
          {item.email && (
            <div className="flex min-w-0 items-center justify-between gap-2 overflow-hidden rounded-xl border border-border/60 bg-card px-2.5 py-1.5 shadow-xs dark:bg-muted">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <Mail className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate font-mono text-foreground">
                  {item.email}
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon-xs"
                className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={() => copyToClipboard(item.email, `email-${item.id}`)}
                title="Copy email"
              >
                {isEmailCopied ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>
            </div>
          )}

          {/* Username row - only renders if username exists and is not empty */}
          {hasUsername && (
            <div className="flex min-w-0 items-center justify-between gap-2 overflow-hidden rounded-xl border border-border/60 bg-card px-2.5 py-1.5 shadow-xs dark:bg-muted">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <User className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate font-mono text-foreground">
                  {item.username}
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon-xs"
                className="size-6 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={() =>
                  copyToClipboard(item.username!, `user-${item.id}`)
                }
                title="Copy username"
              >
                {isUserCopied ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>
            </div>
          )}

          {/* Password row */}
          <div className="flex min-w-0 items-center justify-between gap-2 overflow-hidden rounded-xl border border-border/60 bg-card px-2.5 py-1.5 shadow-xs dark:bg-muted">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span
                className="inline-flex shrink-0"
                title={`Password strength: ${strengthLabel}`}
              >
                <KeyRound
                  className={cn(
                    "size-3.5 shrink-0 transition-colors",
                    keyIconColor
                  )}
                />
              </span>
              <span className="truncate font-mono text-foreground">
                {isPasswordVisible ? item.password : "••••••••••••"}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon-xs"
                className="size-6 text-muted-foreground hover:text-foreground"
                onClick={() => setIsPasswordVisible((prev) => !prev)}
                title={isPasswordVisible ? "Hide password" : "Show password"}
              >
                {isPasswordVisible ? (
                  <EyeOff className="size-3.5" />
                ) : (
                  <Eye className="size-3.5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon-xs"
                className="size-6 text-muted-foreground hover:text-foreground"
                onClick={() =>
                  copyToClipboard(item.password, `pass-${item.id}`)
                }
                title="Copy password"
              >
                {isPassCopied ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      <EditPassDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        record={item}
      />

      {/* Delete confirmation modal */}
      <DeletePassDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        record={item}
      />
    </>
  );
}
