import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SavedRecordFavicon } from "../saved-record-favicon";

describe("SavedRecordFavicon", () => {
  it("renders globe icon for non-domain or single-word site names", () => {
    const { container } = render(<SavedRecordFavicon site="localrouter" />);
    // Should not render img
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    // SVG icon should be present
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("attempts to render favicon img when site contains a valid domain", () => {
    render(<SavedRecordFavicon site="github.com" />);
    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute(
      "src",
      "https://www.google.com/s2/favicons?domain=github.com&sz=64"
    );
  });

  it("falls back to globe icon when image fails to load", () => {
    const { container } = render(
      <SavedRecordFavicon site="broken-domain.xyz" />
    );
    const img = screen.getByRole("img");
    fireEvent.error(img);

    // After error, img should be removed and globe should remain
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
