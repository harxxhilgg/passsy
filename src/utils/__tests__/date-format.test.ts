import { describe, expect, it } from "vitest";
import {
  formatActivityDate,
  formatExactDateTime,
  formatHistoryDay,
  formatHistoryTime,
  getOrdinal,
} from "../date-format";

describe("date-format utilities", () => {
  it("computes correct ordinals", () => {
    expect(getOrdinal(1)).toBe("1st");
    expect(getOrdinal(2)).toBe("2nd");
    expect(getOrdinal(3)).toBe("3rd");
    expect(getOrdinal(4)).toBe("4th");
    expect(getOrdinal(11)).toBe("11th");
    expect(getOrdinal(12)).toBe("12th");
    expect(getOrdinal(13)).toBe("13th");
    expect(getOrdinal(21)).toBe("21st");
    expect(getOrdinal(22)).toBe("22nd");
    expect(getOrdinal(23)).toBe("23rd");
    expect(getOrdinal(31)).toBe("31st");
  });

  it("formats day and date accurately", () => {
    const d = new Date("2026-06-12T18:00:00");
    expect(formatHistoryDay(d)).toBe("12th June 2026");
    expect(formatHistoryTime(d)).toContain("6:00");
    expect(formatExactDateTime(d)).toContain("12th June 2026");
  });

  it("formats relative activity date cleanly", () => {
    const base = new Date("2026-10-25T12:00:00Z");

    // Just now
    expect(formatActivityDate(new Date("2026-10-25T11:59:30Z"), base)).toBe(
      "Just now"
    );

    // Minutes ago
    expect(formatActivityDate(new Date("2026-10-25T11:45:00Z"), base)).toBe(
      "15m ago"
    );

    // Hours ago (same day)
    expect(formatActivityDate(new Date("2026-10-25T08:00:00Z"), base)).toBe(
      "4h ago"
    );

    // Yesterday
    expect(formatActivityDate(new Date("2026-10-24T12:00:00Z"), base)).toBe(
      "Yesterday"
    );

    // Days ago
    expect(formatActivityDate(new Date("2026-10-23T12:00:00Z"), base)).toBe(
      "2 days ago"
    );

    // Earlier this year
    expect(formatActivityDate(new Date("2026-05-15T12:00:00Z"), base)).toBe(
      "May 15"
    );

    // Prior year
    expect(formatActivityDate(new Date("2025-05-15T12:00:00Z"), base)).toBe(
      "May 15, 2025"
    );
  });
});
