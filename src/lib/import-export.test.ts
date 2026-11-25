import { describe, expect, it } from "vitest";
import {
  parseImportFile,
  serializeRecordsToCsv,
  serializeRecordsToJson,
} from "./import-export";
import type { SavedRecord } from "@/app/stores/use-savedata-store";

const sampleRecords: SavedRecord[] = [
  {
    id: "1",
    site: "github.com",
    email: "dev@example.com",
    username: "octocat",
    password: 'p@ss,"word"',
    isPinned: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    site: "google.com",
    email: "user@gmail.com",
    password: "secret123",
    isPinned: false,
    createdAt: "2026-01-02T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  },
];

describe("import-export helpers", () => {
  it("serializes records to CSV and parses them back accurately", () => {
    const csv = serializeRecordsToCsv(sampleRecords);
    const parsed = parseImportFile(csv, "backup.csv");

    expect(parsed.format).toBe("csv");
    expect(parsed.error).toBeUndefined();
    expect(parsed.skippedCount).toBe(0);
    expect(parsed.records).toEqual([
      {
        site: "github.com",
        email: "dev@example.com",
        username: "octocat",
        password: 'p@ss,"word"',
        isPinned: true,
      },
      {
        site: "google.com",
        email: "user@gmail.com",
        password: "secret123",
      },
    ]);
  });

  it("serializes records to JSON and auto-detects JSON without filename", () => {
    const json = serializeRecordsToJson(sampleRecords);
    const parsed = parseImportFile(json);

    expect(parsed.format).toBe("json");
    expect(parsed.error).toBeUndefined();
    expect(parsed.records).toHaveLength(2);
    expect(parsed.records[0].isPinned).toBe(true);
  });

  it("supports browser-style CSV headers and skips invalid rows", () => {
    const browserCsv = [
      "name,url,username,password",
      "Example,https://example.com,alice,pass123",
      "Broken,,,",
    ].join("\n");

    const parsed = parseImportFile(browserCsv, "chrome-passwords.csv");
    expect(parsed.format).toBe("csv");
    expect(parsed.skippedCount).toBe(1);
    expect(parsed.records).toEqual([
      {
        site: "https://example.com",
        email: "alice",
        password: "pass123",
      },
    ]);
  });
});
