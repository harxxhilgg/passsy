import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { SavedRecordItem } from "../saved-record-item";

describe("SavedRecordItem", () => {
  const writeTextMock = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    writeTextMock.mockClear();
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
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };

  const mockRecordWithoutUsername = {
    id: "rec-2",
    site: "google.com",
    email: "user@gmail.com",
    password: "google-secret-password-456",
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

  it("renders pin button in card header", () => {
    render(<SavedRecordItem item={mockRecordWithoutUsername} />);

    expect(
      screen.getByRole("button", { name: "Pin password" })
    ).toBeInTheDocument();
  });
});
