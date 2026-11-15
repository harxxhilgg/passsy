import { render, screen } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import { useSaveDataStore } from "@/app/stores/use-savedata-store";
import { TotalSavedCount } from "../total-saved-count";

describe("TotalSavedCount", () => {
  beforeEach(() => {
    useSaveDataStore.setState({ records: [], _hasHydrated: true });
  });

  it("renders 0 when no records are saved", () => {
    render(<TotalSavedCount />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders the correct count when records exist", () => {
    useSaveDataStore.setState({
      records: [
        {
          id: "1",
          site: "google.com",
          password: "pass",
          createdAt: "2026-01-01",
          updatedAt: "2026-01-01",
        },
        {
          id: "2",
          site: "github.com",
          password: "pass",
          createdAt: "2026-01-01",
          updatedAt: "2026-01-01",
        },
      ],
      _hasHydrated: true,
    });

    render(<TotalSavedCount />);

    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
