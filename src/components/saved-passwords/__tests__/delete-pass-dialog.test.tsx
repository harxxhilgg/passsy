import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { DeletePassDialog } from "../delete-pass-dialog";
import { useSaveDataStore } from "@/app/stores/use-savedata-store";
import * as passActions from "@/app/actions/passwords";

vi.mock("@/app/actions/passwords", () => ({
  deletePasswordAction: vi.fn(),
}));

describe("DeletePassDialog", () => {
  const mockRecord = {
    id: "rec-del-1",
    site: "example.com",
    email: "user@example.com",
    password: "secretPassword123",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useSaveDataStore.setState({
      records: [mockRecord],
      isInitialized: true,
    });
  });

  it("renders confirmation title and site description", () => {
    render(
      <DeletePassDialog
        open={true}
        onOpenChange={vi.fn()}
        record={mockRecord}
      />
    );

    expect(screen.getByText("Delete password?")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Are you sure you want to delete this password for example.com\?/i
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("calls deletePasswordAction, removes from store, and triggers onDeleted on confirm", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onDeleted = vi.fn();

    vi.mocked(passActions.deletePasswordAction).mockResolvedValue({
      success: true,
    });

    render(
      <DeletePassDialog
        open={true}
        onOpenChange={onOpenChange}
        record={mockRecord}
        onDeleted={onDeleted}
      />
    );

    const deleteBtn = screen.getByRole("button", { name: "Delete" });
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(passActions.deletePasswordAction).toHaveBeenCalledWith(
        "rec-del-1"
      );
      expect(useSaveDataStore.getState().records).toHaveLength(0);
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(onDeleted).toHaveBeenCalled();
    });
  });

  it("displays server error message when deletion fails", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    vi.mocked(passActions.deletePasswordAction).mockResolvedValue({
      success: false,
      error: "Could not connect to database.",
    });

    render(
      <DeletePassDialog
        open={true}
        onOpenChange={onOpenChange}
        record={mockRecord}
      />
    );

    const deleteBtn = screen.getByRole("button", { name: "Delete" });
    await user.click(deleteBtn);

    expect(
      await screen.findByText("Could not connect to database.")
    ).toBeInTheDocument();
    expect(useSaveDataStore.getState().records).toHaveLength(1);
  });
});
