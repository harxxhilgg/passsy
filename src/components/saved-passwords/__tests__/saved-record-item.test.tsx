import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { SavedRecordItem } from "../saved-record-item";
import { useSaveDataStore } from "@/app/stores/use-savedata-store";
import * as passActions from "@/app/actions/passwords";

vi.mock("@/app/actions/passwords", () => ({
  updatePasswordAction: vi.fn(),
  deletePasswordAction: vi.fn(),
  togglePinPasswordAction: vi.fn().mockResolvedValue({ success: true }),
}));

describe("SavedRecordItem", () => {
  const writeTextMock = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: writeTextMock,
      },
      writable: true,
      configurable: true,
    });
  });

  const mockRecordWithUsername = {
    id: "rec-1",
    site: "github.com",
    email: "dev@github.com",
    username: "octocat",
    password: "super-secret-password-123",
    isPinned: false,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };

  const mockRecordWithoutUsername = {
    id: "rec-2",
    site: "google.com",
    email: "user@gmail.com",
    password: "google-secret-password-456",
    isPinned: false,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };

  it("renders site, email, and password with strength-colored key icon", () => {
    render(<SavedRecordItem item={mockRecordWithoutUsername} />);

    expect(screen.getByText("google.com")).toBeInTheDocument();

    expect(screen.getByText("user@gmail.com")).toBeInTheDocument();

    expect(screen.getByText("••••••••••••")).toBeInTheDocument();

    expect(screen.getByTitle(/Password strength:/i)).toBeInTheDocument();

    expect(screen.queryByText("Password strength")).not.toBeInTheDocument();

    // Username row should not exist
    expect(screen.queryByTitle("Copy username")).not.toBeInTheDocument();
  });

  it("renders username when present", () => {
    render(<SavedRecordItem item={mockRecordWithUsername} />);

    expect(screen.getByText("octocat")).toBeInTheDocument();

    expect(screen.getByTitle("Copy username")).toBeInTheDocument();
  });

  it("toggles password visibility when clicking eye button", async () => {
    const user = userEvent.setup();
    render(<SavedRecordItem item={mockRecordWithoutUsername} />);

    expect(screen.getByText("••••••••••••")).toBeInTheDocument();

    const toggleButton = screen.getByTitle("Show password");
    await user.click(toggleButton);

    expect(screen.getByText("google-secret-password-456")).toBeInTheDocument();

    const hideButton = screen.getByTitle("Hide password");
    await user.click(hideButton);

    expect(screen.getByText("••••••••••••")).toBeInTheDocument();
  });

  it("copies email to clipboard on button click", () => {
    render(<SavedRecordItem item={mockRecordWithUsername} />);

    const copyEmailBtn = screen.getByTitle("Copy email");
    fireEvent.click(copyEmailBtn);

    expect(writeTextMock).toHaveBeenCalledWith("dev@github.com");
  });

  it("copies password to clipboard on button click", () => {
    render(<SavedRecordItem item={mockRecordWithUsername} />);

    const copyPassBtn = screen.getByTitle("Copy password");
    fireEvent.click(copyPassBtn);

    expect(writeTextMock).toHaveBeenCalledWith("super-secret-password-123");
  });

  it("renders external link icon button pointing to full URL while site name remains non-clickable text", () => {
    render(<SavedRecordItem item={mockRecordWithoutUsername} />);

    // Site text itself is not an anchor tag
    const siteText = screen.getByText("google.com");
    expect(siteText.tagName.toLowerCase()).toBe("span");
    expect(siteText.closest("a")).toBeNull();

    // Link icon button is present with normalized full https URL
    const linkButton = screen.getByRole("link", { name: "Open google.com" });
    expect(linkButton).toBeInTheDocument();
    expect(linkButton).toHaveAttribute("href", "https://google.com");
    expect(linkButton).toHaveAttribute("target", "_blank");
    expect(linkButton).toHaveAttribute("rel", "noopener noreferrer");
    expect(linkButton.className).toContain("hover:bg-transparent");
  });

  it("renders pinned badge before external link button when record is pinned", () => {
    const pinnedRecord = { ...mockRecordWithoutUsername, isPinned: true };
    render(<SavedRecordItem item={pinnedRecord} />);

    const pinnedBadge = screen.getByLabelText("Pinned");
    const linkButton = screen.getByRole("link", { name: "Open google.com" });

    expect(pinnedBadge).toBeInTheDocument();
    expect(linkButton).toBeInTheDocument();

    // Verify pinnedBadge appears before linkButton in DOM order
    expect(
      pinnedBadge.compareDocumentPosition(linkButton) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("opens dropdown on three-dots button click with Pin, Edit, and destructive Delete options", async () => {
    const user = userEvent.setup();
    render(<SavedRecordItem item={mockRecordWithoutUsername} />);

    const moreBtn = screen.getByRole("button", { name: "More options" });
    expect(moreBtn).toBeInTheDocument();

    await user.click(moreBtn);

    expect(
      await screen.findByRole("menuitem", { name: /pin/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /edit/i })).toBeInTheDocument();
    const deleteItem = screen.getByRole("menuitem", { name: /delete/i });
    expect(deleteItem).toBeInTheDocument();
    expect(deleteItem).toHaveAttribute("data-variant", "destructive");
    expect(deleteItem.className).toContain("text-destructive");
  });

  it("toggles pin status when clicking Pin in the dropdown", async () => {
    const user = userEvent.setup();
    useSaveDataStore.setState({
      records: [mockRecordWithoutUsername],
      isInitialized: true,
    });

    render(<SavedRecordItem item={mockRecordWithoutUsername} />);

    const moreBtn = screen.getByRole("button", { name: "More options" });
    await user.click(moreBtn);

    const pinItem = await screen.findByRole("menuitem", { name: "Pin" });
    await user.click(pinItem);

    expect(passActions.togglePinPasswordAction).toHaveBeenCalledWith("rec-2");
    expect(useSaveDataStore.getState().records[0].isPinned).toBe(true);
  });

  it("opens edit dialog when clicking Edit in the dropdown", async () => {
    const user = userEvent.setup();
    render(<SavedRecordItem item={mockRecordWithoutUsername} />);

    const moreBtn = screen.getByRole("button", { name: "More options" });
    await user.click(moreBtn);

    const editItem = await screen.findByRole("menuitem", { name: "Edit" });
    await user.click(editItem);

    expect(await screen.findByText("Edit password")).toBeInTheDocument();
  });

  it("opens delete confirmation dialog when clicking Delete in the dropdown", async () => {
    const user = userEvent.setup();
    render(<SavedRecordItem item={mockRecordWithoutUsername} />);

    const moreBtn = screen.getByRole("button", { name: "More options" });
    await user.click(moreBtn);

    const deleteItem = await screen.findByRole("menuitem", { name: "Delete" });
    await user.click(deleteItem);

    expect(await screen.findByText("Delete password?")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Are you sure you want to delete this password for google.com\?/i
      )
    ).toBeInTheDocument();
  });

  it("bolds matching characters in site, email, and username when searchQuery is provided", () => {
    const record = {
      ...mockRecordWithUsername,
      site: "harshil.dev",
      email: "harshil@example.com",
      username: "the_Harshil_dev",
    };

    render(<SavedRecordItem item={record} searchQuery="harshil" />);

    const boldMatches = document.querySelectorAll("strong");
    expect(boldMatches).toHaveLength(3);
    expect(boldMatches[0]).toHaveTextContent("harshil");
    expect(boldMatches[1]).toHaveTextContent("harshil");
    expect(boldMatches[2]).toHaveTextContent("Harshil");
  });
});
