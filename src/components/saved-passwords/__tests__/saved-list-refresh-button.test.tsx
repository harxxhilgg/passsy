import type { User } from "@supabase/supabase-js";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { SavedListRefreshButton } from "../saved-list-refresh-button";
import { useSaveDataStore } from "@/app/stores/use-savedata-store";
import * as passActions from "@/app/actions/passwords";
import * as authHook from "@/hooks/use-auth";

vi.mock("@/app/actions/passwords", () => ({
  getUserPasswordsAction: vi.fn(),
}));

describe("SavedListRefreshButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSaveDataStore.setState({ records: [], isInitialized: true });
  });

  it("renders refresh button with proper accessible label", () => {
    vi.spyOn(authHook, "useAuth").mockReturnValue({
      user: null,
      isLoading: false,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    });

    render(<SavedListRefreshButton />);

    expect(
      screen.getByRole("button", { name: /refresh saved passwords/i })
    ).toBeInTheDocument();
  });

  it("calls getUserPasswordsAction, updates store, and shows alert when refresh is done", async () => {
    const user = userEvent.setup();

    vi.spyOn(authHook, "useAuth").mockReturnValue({
      user: { id: "user-123", email: "test@example.com" } as unknown as User,
      isLoading: false,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    });

    vi.mocked(passActions.getUserPasswordsAction).mockResolvedValue({
      success: true,
      records: [
        {
          id: "rec-1",
          site: "example.com",
          email: "user@example.com",
          password: "password123",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
      ],
    });

    render(<SavedListRefreshButton />);

    const refreshBtn = screen.getByRole("button", {
      name: /refresh saved passwords/i,
    });
    await user.click(refreshBtn);

    await waitFor(() => {
      expect(passActions.getUserPasswordsAction).toHaveBeenCalledTimes(1);
    });

    expect(useSaveDataStore.getState().records).toHaveLength(1);
    expect(useSaveDataStore.getState().records[0].site).toBe("example.com");

    await waitFor(() => {
      expect(screen.getByText("Passwords refreshed")).toBeInTheDocument();
    });
  });
});
