import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { SavedListFavoriteFilter } from "../saved-list-favorite-filter";
import { useSaveDataStore } from "@/app/stores/use-savedata-store";

describe("SavedListFavoriteFilter", () => {
  beforeEach(() => {
    useSaveDataStore.setState({
      showFavoritesOnly: false,
    });
  });

  it("renders inactive state by default", () => {
    render(<SavedListFavoriteFilter />);

    const button = screen.getByRole("button", {
      name: "Show pinned passwords only",
    });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("toggles showFavoritesOnly in store on click", () => {
    render(<SavedListFavoriteFilter />);

    const button = screen.getByRole("button", {
      name: "Show pinned passwords only",
    });

    fireEvent.click(button);

    expect(useSaveDataStore.getState().showFavoritesOnly).toBe(true);

    expect(button).toHaveAttribute("aria-pressed", "true");

    expect(button).toHaveAttribute("aria-label", "Show all passwords");

    // Click again to turn off
    fireEvent.click(button);

    expect(useSaveDataStore.getState().showFavoritesOnly).toBe(false);

    expect(button).toHaveAttribute("aria-pressed", "false");
  });
});
