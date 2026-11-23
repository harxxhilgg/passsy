"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { History, Info, Search, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatActivityDate, formatExactDateTime } from "@/utils/date-format";
import {
  usePasswordHistoryStore,
  type PasswordActivityEntry,
} from "@/app/stores/use-password-history-store";
import { useSaveDataStore } from "@/app/stores/use-savedata-store";
import { SavedRecordFavicon } from "@/components/saved-passwords/saved-record-favicon";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function PasswordHistoryList() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const history = usePasswordHistoryStore((state) => state.history);
  const removeActivity = usePasswordHistoryStore(
    (state) => state.removeActivity
  );
  const clearHistory = usePasswordHistoryStore((state) => state.clearHistory);
  const seedFromExistingRecords = usePasswordHistoryStore(
    (state) => state.seedFromExistingRecords
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] =
    useState<PasswordActivityEntry | null>(null);

  // Auto-seed existing saved records if user already has saved passwords
  useEffect(() => {
    const savedRecords = useSaveDataStore.getState().records;
    if (savedRecords && savedRecords.length > 0) {
      seedFromExistingRecords(savedRecords);
    }
  }, [seedFromExistingRecords]);

  // Filter history by search query
  const filteredHistory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return history;
    return history.filter((item) => item.site.toLowerCase().includes(q));
  }, [history, searchQuery]);

  if (!isClient) {
    return (
      <div className="flex flex-col gap-3 py-6">
        <div className="h-10 w-48 animate-pulse rounded-md bg-muted/60" />
        <div className="h-12 w-full animate-pulse rounded-lg bg-muted/40" />
        <div className="h-12 w-full animate-pulse rounded-lg bg-muted/40" />
        <div className="h-12 w-full animate-pulse rounded-lg bg-muted/40" />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col">
      {/* Header bar: Title on left, Search and Clear actions on right */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          History
        </h1>

        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="relative w-full sm:w-60">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sites..."
              className="h-9 rounded-xl bg-muted/30 pr-8 pl-8 text-xs focus-visible:bg-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Clear history dialog trigger */}
          {history.length > 0 && (
            <AlertDialog
              open={isClearDialogOpen}
              onOpenChange={setIsClearDialogOpen}
            >
              <AlertDialogTrigger
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "-mr-2.5 h-9 cursor-pointer gap-1.5 rounded-xl px-2.5 text-xs text-muted-foreground hover:text-destructive sm:-mr-3.5"
                )}
                title="Clear history"
              >
                <Trash2 className="size-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </AlertDialogTrigger>

              <AlertDialogContent className="max-w-[calc(100vw-2rem)] gap-0 overflow-hidden p-0 sm:max-w-md">
                <div className="flex flex-col gap-4 p-6">
                  <AlertDialogHeader className="flex flex-col items-start gap-5 text-left sm:text-left">
                    <AlertDialogTitle className="text-left font-serif text-3xl font-semibold tracking-tight text-foreground">
                      Clear activity history?
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-left text-sm text-muted-foreground">
                      Are you sure you want to clear your entire activity log?
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <div className="flex flex-col gap-2 pt-1 text-left">
                    <Info className="size-4 text-muted-foreground" />

                    <p className="text-sm leading-relaxed text-muted-foreground">
                      This will permanently remove all activity events from this
                      browser. Your actual saved passwords in your vault will
                      not be affected.
                    </p>
                  </div>
                </div>

                <AlertDialogFooter className="grid w-full grid-cols-2 gap-3 border-t border-border/40 p-4 sm:grid sm:grid-cols-2 sm:p-5">
                  <AlertDialogCancel className="w-full">
                    Cancel
                  </AlertDialogCancel>

                  <AlertDialogAction
                    variant="destructive"
                    className="w-full"
                    onClick={() => {
                      clearHistory();
                      setIsClearDialogOpen(false);
                    }}
                  >
                    Clear history
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Main List: Direct minimalist rows separated by faint dividers (Claude style) */}
      {history.length === 0 ? (
        <div className="flex animate-in flex-col items-center justify-center py-20 text-center fade-in-0">
          <div className="mb-3 flex size-12 items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/30 text-muted-foreground shadow-xs">
            <History className="size-6" />
          </div>

          <h2 className="font-serif text-2xl font-normal text-foreground">
            No activity history yet
          </h2>

          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            Passwords you save or delete will automatically show up here.
          </p>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-xs text-muted-foreground">
          No activity found matching &quot;{searchQuery}&quot;
        </div>
      ) : (
        <div className="divide-y divide-border/20 border-t border-b border-border/20">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="group -mx-3 flex items-center justify-between rounded-xl px-3 py-4 transition-colors hover:bg-muted/40 sm:-mx-4 sm:px-4"
            >
              {/* Left side: Favicon + Site Name + Action Badge */}
              <div className="flex min-w-0 items-center gap-3">
                <SavedRecordFavicon
                  site={item.site}
                  className="size-7 text-xs"
                />

                <span
                  className="truncate text-sm font-medium text-foreground"
                  title={item.site}
                >
                  {item.site}
                </span>

                <span
                  className={cn(
                    "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium",
                    item.action === "saved"
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
                      : item.action === "deleted"
                        ? "border-red-500/20 bg-red-500/10 text-red-500 dark:text-red-400"
                        : "border-amber-500/20 bg-amber-500/10 text-amber-500 dark:text-amber-400"
                  )}
                >
                  {item.action === "saved"
                    ? "Saved"
                    : item.action === "deleted"
                      ? "Deleted"
                      : "Updated"}
                </span>
              </div>

              {/* Right side: Individual delete button + Timestamp aligned to end */}
              <div className="flex shrink-0 items-center gap-2.5">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="size-7 rounded-lg text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted hover:text-destructive focus-visible:opacity-100"
                  onClick={() => setItemToDelete(item)}
                  title="Remove from history"
                  aria-label={`Remove ${item.site} ${item.action} entry`}
                >
                  <X className="size-3.5" />
                </Button>

                <span
                  className="text-xs text-muted-foreground"
                  title={formatExactDateTime(item.timestamp)}
                >
                  {formatActivityDate(item.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Item Deletion Confirmation Dialog */}
      <AlertDialog
        open={itemToDelete !== null}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] gap-0 overflow-hidden p-0 sm:max-w-md">
          <div className="flex flex-col gap-4 p-6">
            <AlertDialogHeader className="flex flex-col items-start gap-5 text-left sm:text-left">
              <AlertDialogTitle className="text-left font-serif text-3xl font-semibold tracking-tight text-foreground">
                Delete log entry?
              </AlertDialogTitle>

              <AlertDialogDescription className="text-left text-sm text-muted-foreground">
                Are you sure you want to delete this {itemToDelete?.action}{" "}
                event for{" "}
                <span className="font-medium text-foreground">
                  {itemToDelete?.site}
                </span>
                ?
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="flex flex-col gap-2 pt-1 text-left">
              <Info className="size-4 text-muted-foreground" />

              <p className="text-sm leading-relaxed text-muted-foreground">
                This removes only this event from your activity history. Your
                actual saved password for this site remains unchanged.
              </p>
            </div>
          </div>

          <AlertDialogFooter className="grid w-full grid-cols-2 gap-3 border-t border-border/40 p-4 sm:grid sm:grid-cols-2 sm:p-5">
            <AlertDialogCancel className="w-full">Cancel</AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              className="w-full"
              onClick={() => {
                if (itemToDelete) {
                  removeActivity(itemToDelete.id);
                  setItemToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
