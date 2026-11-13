"use client";

import { useState } from "react";
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Pencil,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SavedRecord } from "@/app/stores/use-savedata-store";
import { EditPassDialog } from "./edit-pass-dialog";

type SavedRecordItemProps = {
  item: SavedRecord;
};

export function SavedRecordItem({ item }: SavedRecordItemProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const hasUsername = Boolean(item.username?.trim());
  const isUserCopied = copiedKey === `user-${item.id}`;
  const isPassCopied = copiedKey === `pass-${item.id}`;

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
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/40 bg-card text-muted-foreground shadow-xs dark:bg-muted">
              <Globe className="size-4" />
            </div>

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
          {/* Username row - only renders if username exists and is not "" */}
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
              <KeyRound className="size-3.5 shrink-0 text-muted-foreground" />
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
