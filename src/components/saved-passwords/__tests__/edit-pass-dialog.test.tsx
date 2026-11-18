import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { EditPassDialog } from "../edit-pass-dialog";
import { useSaveDataStore } from "@/app/stores/use-savedata-store";
import * as passActions from "@/app/actions/passwords";

vi.mock("@/app/actions/passwords", () => ({
  updatePasswordAction: vi.fn(),
  deletePasswordAction: vi.fn(),
}));

describe("EditPassDialog", () => {
  const initialRecord = {
    id: "rec-1",
    site: "github.com",
    email: "user@github.com",
    username: "octocat",
    password: "oldPassword123",
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

  it("renders with pre-filled record values", () => {
    render(
      <EditPassDialog
        open={true}
        onOpenChange={vi.fn()}
        record={initialRecord}
      />
    );

    expect(screen.getByText("Edit password")).toBeInTheDocument();
    expect(screen.getByDisplayValue("github.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("user@github.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("octocat")).toBeInTheDocument();
    expect(screen.getByDisplayValue("oldPassword123")).toBeInTheDocument();
  });

  it("calls updatePasswordAction and updates store on submit", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    vi.mocked(passActions.updatePasswordAction).mockResolvedValue({
      success: true,
      record: {
        ...initialRecord,
        site: "new-site.com",
        password: "newPassword456",
      },
    });

    render(
      <EditPassDialog
        open={true}
        onOpenChange={onOpenChange}
        record={initialRecord}
      />
    );

    const siteInput = screen.getByDisplayValue("github.com");
    await user.clear(siteInput);
    await user.type(siteInput, "new-site.com");

    const passInput = screen.getByDisplayValue("oldPassword123");
    await user.clear(passInput);
    await user.type(passInput, "newPassword456");

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(passActions.updatePasswordAction).toHaveBeenCalledWith("rec-1", {
        site: "new-site.com",
        email: "user@github.com",
        username: "octocat",
        password: "newPassword456",
      });
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    const storeRecord = useSaveDataStore.getState().records[0];
    expect(storeRecord.site).toBe("new-site.com");
  });

  it("opens alert dialog on delete click and calls deletePasswordAction after confirmation", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    vi.mocked(passActions.deletePasswordAction).mockResolvedValue({
      success: true,
    });

    render(
      <EditPassDialog
        open={true}
        onOpenChange={onOpenChange}
        record={initialRecord}
      />
    );

    const deleteBtn = screen.getByRole("button", { name: /^delete$/i });
    await user.click(deleteBtn);

    expect(screen.getByText("Delete password?")).toBeInTheDocument();

    const confirmButtons = screen.getAllByRole("button", { name: /^delete$/i });
    // The confirm button in the alert dialog
    const confirmDeleteBtn = confirmButtons[confirmButtons.length - 1];
    await user.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(passActions.deletePasswordAction).toHaveBeenCalledWith("rec-1");
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    expect(useSaveDataStore.getState().records).toHaveLength(0);
  });

  it("renders password strength indicator for current password", () => {
    render(
      <EditPassDialog
        open={true}
        onOpenChange={vi.fn()}
        record={initialRecord}
      />
    );

    expect(screen.getByText("Password strength")).toBeInTheDocument();
  });

  it("maintains a stable min-width on save changes button to prevent layout shift", () => {
    render(
      <EditPassDialog
        open={true}
        onOpenChange={vi.fn()}
        record={initialRecord}
      />
    );

    const saveButton = screen.getByRole("button", { name: /save changes/i });
    expect(saveButton.className).toMatch(/min-w-(?:\[118px\]|29\.5)/);
  });
});
