import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { PasswordHistoryList } from "../password-history-list";
import { usePasswordHistoryStore } from "@/app/stores/use-password-history-store";
import { useSaveDataStore } from "@/app/stores/use-savedata-store";

describe("PasswordHistoryList", () => {
  beforeEach(() => {
    usePasswordHistoryStore.getState().clearHistory();
    useSaveDataStore.setState({ records: [], isInitialized: true });
  });

  it("renders empty state when no history exists", () => {
    render(<PasswordHistoryList />);

    expect(screen.getByText("No activity history yet")).toBeInTheDocument();
  });

  it("renders activity entries with site name, action badge, and relative date", () => {
    usePasswordHistoryStore.setState({
      history: [
        {
          id: "act-1",
          site: "github.com",
          action: "saved",
          timestamp: new Date().toISOString(),
        },
        {
          id: "act-2",
          site: "netflix.com",
          action: "deleted",
          timestamp: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ],
    });

    render(<PasswordHistoryList />);

    expect(screen.getByText("github.com")).toBeInTheDocument();
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("netflix.com")).toBeInTheDocument();
    expect(screen.getByText("Deleted")).toBeInTheDocument();
  });

  it("filters activity items by site name using search input", () => {
    usePasswordHistoryStore.setState({
      history: [
        {
          id: "act-1",
          site: "github.com",
          action: "saved",
          timestamp: new Date().toISOString(),
        },
        {
          id: "act-2",
          site: "spotify.com",
          action: "saved",
          timestamp: new Date().toISOString(),
        },
      ],
    });

    render(<PasswordHistoryList />);

    expect(screen.getByText("github.com")).toBeInTheDocument();

    expect(screen.getByText("spotify.com")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText("Search sites...");

    fireEvent.change(searchInput, { target: { value: "git" } });

    expect(screen.getByText("github.com")).toBeInTheDocument();

    expect(screen.queryByText("spotify.com")).not.toBeInTheDocument();
  });

  it("opens confirmation dialog and removes individual activity upon confirmation", () => {
    usePasswordHistoryStore.setState({
      history: [
        {
          id: "act-1",
          site: "github.com",
          action: "saved",
          timestamp: new Date().toISOString(),
        },
      ],
    });

    render(<PasswordHistoryList />);

    const removeBtn = screen.getByRole("button", {
      name: /remove github.com saved entry/i,
    });
    fireEvent.click(removeBtn);

    // Confirmation dialog appears
    expect(screen.getByText("Delete log entry?")).toBeInTheDocument();

    expect(
      screen.getByText(/Are you sure you want to delete this saved event for/i)
    ).toBeInTheDocument();

    // Confirm deletion
    const confirmDeleteBtn = screen.getByRole("button", { name: "Delete" });
    fireEvent.click(confirmDeleteBtn);

    expect(usePasswordHistoryStore.getState().history).toHaveLength(0);
    expect(screen.getByText("No activity history yet")).toBeInTheDocument();
  });

  it("opens clear history dialog with matching styling and clears history on confirm", () => {
    usePasswordHistoryStore.setState({
      history: [
        {
          id: "act-1",
          site: "github.com",
          action: "saved",
          timestamp: new Date().toISOString(),
        },
      ],
    });

    render(<PasswordHistoryList />);

    const clearTrigger = screen.getByRole("button", { name: /clear/i });
    fireEvent.click(clearTrigger);

    expect(screen.getByText("Clear activity history?")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Are you sure you want to clear your entire activity log/i
      )
    ).toBeInTheDocument();

    const confirmClearBtn = screen.getByRole("button", {
      name: "Clear history",
    });
    fireEvent.click(confirmClearBtn);

    expect(usePasswordHistoryStore.getState().history).toHaveLength(0);
    expect(screen.getByText("No activity history yet")).toBeInTheDocument();
  });
});
