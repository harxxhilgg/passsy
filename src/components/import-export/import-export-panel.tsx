"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Download,
  FileJson,
  FileSpreadsheet,
  Search,
  Upload,
  X,
} from "lucide-react";
import {
  getUserPasswordsAction,
  importPasswordsAction,
} from "@/app/actions/passwords";
import {
  useSaveDataStore,
  type SavedRecord,
} from "@/app/stores/use-savedata-store";
import { SavedRecordFavicon } from "@/components/saved-passwords/saved-record-favicon";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import {
  downloadTextFile,
  getExportFilename,
  parseImportFile,
  serializeRecordsToCsv,
  serializeRecordsToJson,
} from "@/lib/import-export";
import { cn } from "@/lib/utils";

type ImportStatus = {
  type: "success" | "error";
  title: string;
  description?: string;
} | null;

type ExportScope = "all" | "selected";

export function ImportExportPanel() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const records = useSaveDataStore((state) => state.records);
  const isInitialized = useSaveDataStore((state) => state.isInitialized);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<ImportStatus>(null);

  const [exportScope, setExportScope] = useState<ExportScope>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [filterQuery, setFilterQuery] = useState("");

  useEffect(() => {
    if (user?.id && !isInitialized) {
      void getUserPasswordsAction().then((res) => {
        if (res.success && res.records) {
          useSaveDataStore.getState().setRecords(res.records);
        }
      });
    }
  }, [user?.id, isInitialized]);

  const filteredRecords = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return records;
    return records.filter(
      (item) =>
        item.site.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        (item.username?.toLowerCase().includes(q) ?? false)
    );
  }, [records, filterQuery]);

  const selectedRecords = useMemo(
    () => records.filter((r) => selectedIds.has(r.id)),
    [records, selectedIds]
  );

  const recordsToExport = exportScope === "all" ? records : selectedRecords;

  const toggleRecordSelection = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const item of filteredRecords) {
        next.add(item.id);
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setImportStatus(null);
    setIsImporting(true);

    try {
      const text = await file.text();
      const parsed = parseImportFile(text, file.name);

      if (parsed.error) {
        setImportStatus({
          type: "error",
          title: "Could not parse file",
          description: parsed.error,
        });
        return;
      }

      if (parsed.records.length === 0) {
        setImportStatus({
          type: "error",
          title: "No valid records found",
          description:
            parsed.skippedCount > 0
              ? `${parsed.skippedCount} row(s) were skipped due to missing site, email/username, or password.`
              : "The file did not contain any valid password entries.",
        });
        return;
      }

      const res = await importPasswordsAction(parsed.records);
      if (!res.success) {
        setImportStatus({
          type: "error",
          title: "Import failed",
          description: res.error ?? "Unable to import passwords.",
        });
        return;
      }

      const imported: SavedRecord[] = res.importedRecords ?? [];
      if (imported.length > 0) {
        const current = useSaveDataStore.getState().records;
        useSaveDataStore.getState().setRecords([...imported, ...current]);
      }

      const details: string[] = [
        `Detected ${parsed.format.toUpperCase()} format.`,
      ];
      const totalSkipped =
        parsed.skippedCount +
        (res.duplicateCount ?? 0) +
        (res.invalidCount ?? 0);
      if (res.duplicateCount) {
        details.push(`${res.duplicateCount} duplicate(s) skipped.`);
      }
      if (parsed.skippedCount + (res.invalidCount ?? 0) > 0) {
        details.push(
          `${parsed.skippedCount + (res.invalidCount ?? 0)} invalid row(s) skipped.`
        );
      }

      setImportStatus({
        type: "success",
        title:
          imported.length > 0
            ? `Imported ${imported.length} password${imported.length === 1 ? "" : "s"}`
            : totalSkipped > 0
              ? "No new passwords imported"
              : "Import complete",
        description: details.join(" "),
      });
    } catch {
      setImportStatus({
        type: "error",
        title: "Import failed",
        description: "An unexpected error occurred while reading the file.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = (format: "csv" | "json") => {
    if (recordsToExport.length === 0) return;

    if (format === "csv") {
      const csv = serializeRecordsToCsv(recordsToExport);
      downloadTextFile(
        csv,
        getExportFilename("csv"),
        "text/csv;charset=utf-8;"
      );
    } else {
      const json = serializeRecordsToJson(recordsToExport);
      downloadTextFile(
        json,
        getExportFilename("json"),
        "application/json;charset=utf-8;"
      );
    }
  };

  const canInteract = Boolean(user) && !isAuthLoading;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
          Import &amp; Export
        </h1>
        <p className="text-sm text-muted-foreground">
          Back up your vault or migrate passwords from another password manager.
          Import automatically detects CSV and JSON files, and you can export
          your entire vault or only selected records.
        </p>
      </div>

      <Alert className="border-amber-500/30 bg-amber-500/5 text-foreground">
        <AlertTriangle className="text-amber-500" />
        <AlertTitle>Handle exported files carefully</AlertTitle>
        <AlertDescription>
          Exported CSV and JSON files contain your passwords in plaintext. Store
          them in a secure location and delete temporary copies when finished.
        </AlertDescription>
      </Alert>

      {!isAuthLoading && !user && (
        <Alert variant="destructive">
          <AlertTitle>Sign in required</AlertTitle>
          <AlertDescription>
            Please sign in from the home page to import or export your saved
            passwords.
          </AlertDescription>
        </Alert>
      )}

      {/* Primary Import & Export actions */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-muted/30 p-4 shadow-xs">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.json,text/csv,application/json"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Import password file"
        />

        <Button
          type="button"
          variant="outline"
          disabled={!canInteract || isImporting}
          onClick={() => fileInputRef.current?.click()}
          className="h-10 cursor-pointer gap-2 rounded-xl"
        >
          {isImporting ? (
            <Spinner className="size-4" />
          ) : (
            <Upload className="size-4" />
          )}
          <span>{isImporting ? "Importing..." : "Import (CSV / JSON)"}</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={!canInteract || recordsToExport.length === 0}
            className={cn(
              buttonVariants({ variant: "default" }),
              "h-10 cursor-pointer gap-2 rounded-xl disabled:pointer-events-none disabled:opacity-50"
            )}
          >
            <Download className="size-4" />
            <span>
              Export
              {exportScope === "selected"
                ? ` (${selectedRecords.length})`
                : records.length > 0
                  ? ` (${records.length})`
                  : ""}
            </span>
            <ChevronDown className="size-3.5 opacity-70" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-44 p-1.5">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2 py-1 text-xs font-medium text-muted-foreground">
                Export as
              </DropdownMenuLabel>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleExport("csv")}
              >
                <FileSpreadsheet className="size-4" />
                <span>CSV</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => handleExport("json")}
              >
                <FileJson className="size-4" />
                <span>JSON</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {importStatus && (
        <Alert
          variant={importStatus.type === "error" ? "destructive" : "default"}
        >
          {importStatus.type === "success" && (
            <CheckCircle2 className="text-emerald-500" />
          )}
          <AlertTitle>{importStatus.title}</AlertTitle>
          {importStatus.description && (
            <AlertDescription>{importStatus.description}</AlertDescription>
          )}
        </Alert>
      )}

      {/* Selective Export Picker */}
      {canInteract && records.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-medium text-foreground">
                Export scope
              </h2>
              <p className="text-xs text-muted-foreground">
                Choose whether to export all saved passwords or pick specific
                records.
              </p>
            </div>

            <div className="inline-flex rounded-xl border border-border/60 bg-muted/40 p-1">
              <button
                type="button"
                onClick={() => setExportScope("all")}
                className={cn(
                  "cursor-pointer rounded-lg px-3 py-1 text-xs font-medium transition-colors",
                  exportScope === "all"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                All records ({records.length})
              </button>
              <button
                type="button"
                onClick={() => setExportScope("selected")}
                className={cn(
                  "cursor-pointer rounded-lg px-3 py-1 text-xs font-medium transition-colors",
                  exportScope === "selected"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Select records ({selectedRecords.length})
              </button>
            </div>
          </div>

          {exportScope === "selected" && (
            <div className="flex flex-col gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-48 flex-1">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Filter by site, email, or username..."
                    aria-label="Filter records to export"
                    className="h-9 rounded-xl pr-8 pl-8 text-xs"
                  />
                  {filterQuery && (
                    <button
                      type="button"
                      onClick={() => setFilterQuery("")}
                      className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
                      aria-label="Clear filter"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAllVisible}
                  disabled={filteredRecords.length === 0}
                  className="h-9 cursor-pointer rounded-xl text-xs"
                >
                  Select all
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  disabled={selectedIds.size === 0}
                  className="h-9 cursor-pointer rounded-xl text-xs"
                >
                  Clear
                </Button>
              </div>

              <div className="flex max-h-80 flex-col divide-y divide-border/50 overflow-y-auto rounded-xl border border-border/60">
                {filteredRecords.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    No matching records
                  </div>
                ) : (
                  filteredRecords.map((record) => {
                    const isChecked = selectedIds.has(record.id);
                    return (
                      <label
                        key={record.id}
                        className="flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/40"
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            toggleRecordSelection(record.id, Boolean(checked))
                          }
                          aria-label={`Select ${record.site}`}
                        />
                        <SavedRecordFavicon site={record.site} />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-sm font-medium text-foreground">
                            {record.site}
                          </span>
                          <span className="truncate font-mono text-xs text-muted-foreground">
                            {record.email}
                            {record.username ? ` · ${record.username}` : ""}
                          </span>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
