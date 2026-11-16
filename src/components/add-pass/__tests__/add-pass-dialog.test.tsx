import type { User } from "@supabase/supabase-js";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { AddPassDialog } from "../add-pass-dialog";
import { useSaveDataStore } from "@/app/stores/use-savedata-store";
import * as authHook from "@/hooks/use-auth";
import * as passActions from "@/app/actions/passwords";

vi.mock("@/app/actions/passwords", () => ({
  savePasswordAction: vi.fn(),
}));

describe("AddPassDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSaveDataStore.setState({ records: [], isInitialized: true });
  });

  it("renders with initial password value in the password field", () => {
    vi.spyOn(authHook, "useAuth").mockReturnValue({
      user: null,
      isLoading: false,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <AddPassDialog open={true} onOpenChange={vi.fn()} value="genPass123!" />
    );

    expect(screen.getByText("Add new password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("example.com")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("email@example.com")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("example_user")).toBeInTheDocument();
    expect(screen.getByDisplayValue("genPass123!")).toBeInTheDocument();
  });

  it("shows auth alert dialog when unauthenticated user clicks Save", async () => {
    const user = userEvent.setup();
    vi.spyOn(authHook, "useAuth").mockReturnValue({
      user: null,
      isLoading: false,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <AddPassDialog open={true} onOpenChange={vi.fn()} value="genPass123!" />
    );

    await user.type(screen.getByPlaceholderText("example.com"), "github.com");
    await user.type(
      screen.getByPlaceholderText("email@example.com"),
      "user@github.com"
    );

    await user.click(screen.getByRole("button", { name: /^Save$/i }));

    await waitFor(() => {
      expect(screen.getByText("Sign in to save passwords")).toBeInTheDocument();
    });
  });

  it("calls savePasswordAction and updates store when authenticated user saves", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    vi.spyOn(authHook, "useAuth").mockReturnValue({
      user: { id: "user-123", email: "user@example.com" } as unknown as User,
      isLoading: false,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
    });

    vi.mocked(passActions.savePasswordAction).mockResolvedValue({
      success: true,
      record: {
        id: "rec-1",
        site: "github.com",
        email: "user@github.com",
        username: "octocat",
        password: "genPass123!",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      },
    });

    render(
      <AddPassDialog
        open={true}
        onOpenChange={onOpenChange}
        value="genPass123!"
      />
    );

    await user.type(screen.getByPlaceholderText("example.com"), "github.com");
    await user.type(
      screen.getByPlaceholderText("email@example.com"),
      "user@github.com"
    );
    await user.type(screen.getByPlaceholderText("example_user"), "octocat");

    await user.click(screen.getByRole("button", { name: /^Save$/i }));

    await waitFor(() => {
      expect(passActions.savePasswordAction).toHaveBeenCalledWith({
        site: "github.com",
        email: "user@github.com",
        username: "octocat",
        password: "genPass123!",
      });
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    const storeRecords = useSaveDataStore.getState().records;
    expect(storeRecords).toHaveLength(1);
    expect(storeRecords[0].site).toBe("github.com");
  });
});
