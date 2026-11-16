import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SavedRecordPinButton } from "../saved-record-pin-button";
import { useSaveDataStore } from "@/app/stores/use-savedata-store";
import * as passActions from "@/app/actions/passwords";

vi.mock("@/app/actions/passwords", () => ({
  togglePinPasswordAction: vi.fn(),
}));

describe("SavedRecordPinButton", () => {
  const initialRecord = {
    id: "rec-1",
    site: "github.com",
    email: "dev@github.com",
    password: "secretPassword123",
    isPinned: false,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useSaveDataStore.setState({
      records: [initialRecord],
      isInitialized: true,
    });
  });

  it("renders unpinned state when isPinned is false", () => {
    render(<SavedRecordPinButton id="rec-1" isPinned={false} />);

    expect(screen.getByRole("button", { name: "Pin password" })).toBeInTheDocument();
  });

  it("renders pinned state when isPinned is true", () => {
    render(<SavedRecordPinButton id="rec-1" isPinned={true} />);

    expect(screen.getByRole("button", { name: "Unpin password" })).toBeInTheDocument();
  });

  it("optimistically toggles store and calls togglePinPasswordAction on click", async () => {
    vi.mocked(passActions.togglePinPasswordAction).mockResolvedValue({
      success: true,
      isPinned: true,
    });

    render(<SavedRecordPinButton id="rec-1" isPinned={false} />);

    const pinButton = screen.getByRole("button", { name: "Pin password" });
    fireEvent.click(pinButton);

    // Optimistically updated in store
    expect(useSaveDataStore.getState().records[0].isPinned).toBe(true);

    await waitFor(() => {
      expect(passActions.togglePinPasswordAction).toHaveBeenCalledWith("rec-1");
    });
  });

  it("reverts store state if server action fails", async () => {
    vi.mocked(passActions.togglePinPasswordAction).mockResolvedValue({
      success: false,
      error: "Network error",
    });

    render(<SavedRecordPinButton id="rec-1" isPinned={false} />);

    const pinButton = screen.getByRole("button", { name: "Pin password" });
    fireEvent.click(pinButton);

    // After action rejects/fails, it rolls back to false
    await waitFor(() => {
      expect(useSaveDataStore.getState().records[0].isPinned).toBe(false);
    });
  });
});
