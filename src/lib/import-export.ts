import type { SavedRecord } from "@/app/stores/use-savedata-store";

export type ImportRecordInput = {
  site: string;
  email: string;
  username?: string;
  password: string;
  isPinned?: boolean;
};

export type ParsedImportResult = {
  format: "csv" | "json";
  records: ImportRecordInput[];
  skippedCount: number;
  error?: string;
};

const CSV_HEADERS = [
  "site",
  "email",
  "username",
  "password",
  "isPinned",
] as const;

function escapeCsvField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function serializeRecordsToCsv(records: SavedRecord[]): string {
  const rows = [CSV_HEADERS.join(",")];

  for (const record of records) {
    rows.push(
      [
        escapeCsvField(record.site ?? ""),
        escapeCsvField(record.email ?? ""),
        escapeCsvField(record.username ?? ""),
        escapeCsvField(record.password ?? ""),
        escapeCsvField(String(Boolean(record.isPinned))),
      ].join(",")
    );
  }

  return rows.join("\n");
}

export function serializeRecordsToJson(records: SavedRecord[]): string {
  const portable = records.map((record) => ({
    site: record.site,
    email: record.email,
    ...(record.username ? { username: record.username } : {}),
    password: record.password,
    ...(record.isPinned ? { isPinned: true } : {}),
  }));

  return JSON.stringify(portable, null, 2);
}

export function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  const clean = text.replace(/^\uFEFF/, "");

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const nextChar = clean[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      currentRow.push(currentField);
      currentField = "";
    } else if (char === "\r" && nextChar === "\n") {
      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = "";
      i++;
    } else if (char === "\n" || char === "\r") {
      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = "";
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows.filter((row) => row.some((cell) => cell.trim() !== ""));
}

function normalizeRecordObject(
  raw: Record<string, unknown>
): ImportRecordInput | null {
  const lowerMap = new Map<string, unknown>();
  for (const [key, value] of Object.entries(raw)) {
    lowerMap.set(key.trim().toLowerCase(), value);
  }

  const pickString = (...keys: string[]): string => {
    for (const key of keys) {
      const val = lowerMap.get(key);
      if (typeof val === "string" && val.trim()) {
        return val.trim();
      }
    }
    return "";
  };

  const site = pickString("site", "url", "website", "name", "origin", "domain");
  const rawEmail = pickString("email", "e-mail");
  const rawUsername = pickString("username", "user", "login");
  const passwordVal = lowerMap.get("password") ?? lowerMap.get("pass");
  const password = typeof passwordVal === "string" ? passwordVal : "";

  const email = rawEmail || rawUsername;
  const username = rawEmail && rawUsername ? rawUsername : undefined;

  if (!site || !email || !password.trim()) {
    return null;
  }

  const pinnedVal =
    lowerMap.get("ispinned") ??
    lowerMap.get("pinned") ??
    lowerMap.get("favorite");
  const isPinned =
    pinnedVal === true ||
    (typeof pinnedVal === "string" &&
      pinnedVal.trim().toLowerCase() === "true");

  return {
    site,
    email,
    ...(username ? { username } : {}),
    password,
    ...(isPinned ? { isPinned: true } : {}),
  };
}

function parseJsonContent(content: string): ParsedImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return {
      format: "json",
      records: [],
      skippedCount: 0,
      error: "Invalid JSON file.",
    };
  }

  const items = Array.isArray(parsed)
    ? parsed
    : typeof parsed === "object" &&
        parsed !== null &&
        Array.isArray((parsed as { records?: unknown }).records)
      ? (parsed as { records: unknown[] }).records
      : null;

  if (!items) {
    return {
      format: "json",
      records: [],
      skippedCount: 0,
      error: "JSON must be an array of password records.",
    };
  }

  const records: ImportRecordInput[] = [];
  let skippedCount = 0;

  for (const item of items) {
    if (typeof item !== "object" || item === null) {
      skippedCount++;
      continue;
    }
    const normalized = normalizeRecordObject(item as Record<string, unknown>);
    if (normalized) {
      records.push(normalized);
    } else {
      skippedCount++;
    }
  }

  return { format: "json", records, skippedCount };
}

function parseCsvContent(content: string): ParsedImportResult {
  const rows = parseCsvRows(content);
  if (rows.length < 2) {
    return {
      format: "csv",
      records: [],
      skippedCount: 0,
      error: "CSV file must include a header row and at least one record.",
    };
  }

  const headers = rows[0].map((h) => h.trim());
  const records: ImportRecordInput[] = [];
  let skippedCount = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const obj: Record<string, string> = {};
    for (let col = 0; col < headers.length; col++) {
      obj[headers[col]] = row[col] ?? "";
    }
    const normalized = normalizeRecordObject(obj);
    if (normalized) {
      records.push(normalized);
    } else {
      skippedCount++;
    }
  }

  return { format: "csv", records, skippedCount };
}

export function parseImportFile(
  content: string,
  fileName?: string
): ParsedImportResult {
  const trimmed = content.trim();
  if (!trimmed) {
    return {
      format: fileName?.toLowerCase().endsWith(".json") ? "json" : "csv",
      records: [],
      skippedCount: 0,
      error: "The selected file is empty.",
    };
  }

  const lowerName = fileName?.toLowerCase() ?? "";
  const looksLikeJson =
    lowerName.endsWith(".json") ||
    (!lowerName.endsWith(".csv") &&
      (trimmed.startsWith("[") || trimmed.startsWith("{")));

  return looksLikeJson ? parseJsonContent(trimmed) : parseCsvContent(trimmed);
}

export function getExportFilename(format: "csv" | "json"): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
  return `Passy_Passwords_${date}_${randomSixDigits}.${format}`;
}

export function downloadTextFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
