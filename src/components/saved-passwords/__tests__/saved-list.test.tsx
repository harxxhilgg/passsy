import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SavedList } from "../saved-list";
import {
  useSaveDataStore,
  type SavedRecord,
} from "@/app/stores/use-savedata-store";

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({ user: null, isLoading: false }),
}));

vi.mock("@/app/actions/passwords", () => ({
  getUserPasswordsAction: vi
    .fn()
    .mockResolvedValue({ success: true, records: [] }),
}));

vi.mock("../saved-record-item", () => ({
  SavedRecordItem: ({ item }: { item: SavedRecord }) => (
    <div data-testid="saved-record-item">
      <span>{item.site}</span>
      <span>{item.email}</span>
      {item.username && <span>{item.username}</span>}
    </div>
  ),
}));

const sampleRecords: SavedRecord[] = [
  {
    id: "1",
    site: "github.com",
    email: "dev@example.com",
    username: "octocat",
    password: "secret",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    site: "google.com",
    email: "personal@gmail.com",
    password: "secret",
    createdAt: "2026-01-02T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  },
  {
    id: "3",
    site: "gitlab.com",
    email: "work@company.org",
    username: "builder_99",
    password: "secret",
    createdAt: "2026-01-03T00:00:00.000Z",
    updatedAt: "2026-01-03T00:00:00.000Z",
  },
];

describe("SavedList search", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    globalThis.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    useSaveDataStore.setState({
      records: sampleRecords,
      isInitialized: true,
      showFavoritesOnly: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders updated search placeholder and filters by site, email, and username", () => {
    render(<SavedList data={sampleRecords} />);

    const searchInput = screen.getByPlaceholderText(
      "Search by site, email, or username..."
    );
    expect(searchInput).toBeInTheDocument();

    // Filter by site
    fireEvent.change(searchInput, { target: { value: "GITHUB" } });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getAllByTestId("saved-record-item")).toHaveLength(1);
    expect(screen.getByText("github.com")).toBeInTheDocument();

    // Filter by email
    fireEvent.change(searchInput, { target: { value: "gmail.com" } });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getAllByTestId("saved-record-item")).toHaveLength(1);
    expect(screen.getByText("google.com")).toBeInTheDocument();

    // Filter by username
    fireEvent.change(searchInput, { target: { value: "BUILDER_99" } });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.getAllByTestId("saved-record-item")).toHaveLength(1);
    expect(screen.getByText("gitlab.com")).toBeInTheDocument();

    // No matching results
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryAllByTestId("saved-record-item")).toHaveLength(0);
    expect(screen.getByText("No matching records")).toBeInTheDocument();
  });
});
