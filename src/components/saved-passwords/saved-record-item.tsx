"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Pencil,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  calcPasswordStrength,
  getStrengthLabel,
  getStrengthTextColor,
} from "@/lib/password";
import type { SavedRecord } from "@/app/stores/use-savedata-store";
import { EditPassDialog } from "./edit-pass-dialog";
import { SavedRecordFavicon } from "./saved-record-favicon";

type SavedRecordItemProps = {
  item: SavedRecord;
};

export function SavedRecordItem({ item }: SavedRecordItemProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <>
      <div className="group/record flex min-w-0 animate-in flex-col gap-3 overflow-hidden rounded-2xl border border-border/60 bg-muted/30 p-3.5 shadow-xs transition-all duration-300 ease-out fade-in-0 zoom-in-95">
        {/* Header: Site + Edit action */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <SavedRecordFavicon site={item.site} />

            <span className="truncate text-sm font-medium">{item.site}</span>
          </div>

          {/* Edit button: shown on card hover */}
          <Button
            variant="ghost"
            size="icon-xs"
            className="size-7 shrink-0 rounded-lg text-muted-foreground opacity-0 transition-opacity duration-150 group-hover/record:opacity-100 hover:bg-muted hover:text-foreground focus-visible:opacity-100"
            onClick={() => setIsEditDialogOpen(true)}
            title="Edit record"
          >
            <Pencil className="size-3.5" />
          </Button>
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
                  className={cn("size-3.5 shrink-0 transition-colors", keyIconColor)}
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
    </>
  );
}
