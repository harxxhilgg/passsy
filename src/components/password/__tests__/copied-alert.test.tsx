import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CopiedAlert } from "../copied-alert";

describe("CopiedAlert", () => {
  it("should render the copied confirmation message", () => {
    render(<CopiedAlert show={true} />);

    expect(screen.getByText("Copied to clipboard")).toBeInTheDocument();
  });

  it("should have visible styles when show is set to true", () => {
    const { container } = render(<CopiedAlert show={true} />);

    const alert = container.firstElementChild;

    expect(alert).toHaveClass("translate-y-0");
    // OR BOTH IN ONE
    expect(alert).toHaveClass("opacity-100");
  });

  it("should not have visible styles when show is set to false", () => {
    const { container } = render(<CopiedAlert show={false} />);

    const alert = container.firstElementChild;

    expect(alert).not.toHaveClass("opacity-100");
    expect(alert).toHaveClass("opacity-0 translate-y-2");
  });

  it("should update visibility when show prop changes", () => {
    const { container, rerender } = render(<CopiedAlert show={false} />);

    let alert = container.firstElementChild;

    expect(alert).toHaveClass("opacity-0 translate-y-2 pointer-events-none");

    rerender(<CopiedAlert show={true} />);

    alert = container.firstElementChild;

    expect(alert).toHaveClass("translate-y-0 opacity-100");
    expect(alert).not.toHaveClass("pointer-events-none trnslate-y-2 opacity-0");
  });
});
