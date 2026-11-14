import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PasswordOptions } from "../password-options";
import userEvent from "@testing-library/user-event";

describe("passwordOptions", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render Numbers and Symbols buttons", () => {
    render(
      <PasswordOptions
        withNumbers={true}
        withSpecials={true}
        onToggleNumbers={vi.fn()}
        onToggleSpecials={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Symbols" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Numbers" })).toBeInTheDocument();
  });

  it("should have aria-pressed false when options are disabled", () => {
    render(
      <PasswordOptions
        withNumbers={false}
        withSpecials={false}
        onToggleNumbers={vi.fn()}
        onToggleSpecials={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Numbers" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(screen.getByRole("button", { name: "Symbols" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("should have aria-pressed true when options are selected", () => {
    render(
      <PasswordOptions
        withNumbers={true}
        withSpecials={true}
        onToggleNumbers={vi.fn()}
        onToggleSpecials={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Numbers" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Symbols" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("should call onToggleNumbers when Number button is clicked", async () => {
    // create a mock user
    // used when clicking - typing - keyboard interaction - selecting
    const user = userEvent.setup();

    // mock function - fake function which allows if it was called - how many times it was called and what args it received
    const onToggleNumbers = vi.fn();

    render(
      <PasswordOptions
        withNumbers={false}
        withSpecials={false}
        onToggleNumbers={onToggleNumbers}
        onToggleSpecials={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Numbers" }));
    await user.click(screen.getByRole("button", { name: "Numbers" }));

    expect(onToggleNumbers).toHaveBeenCalledTimes(2);
  });

  it("should not call onToggleNumbers when Symbols button is clicked", async () => {
    const user = userEvent.setup();
    const onToggleSymbols = vi.fn();

    render(
      <PasswordOptions
        withNumbers={false}
        withSpecials={false}
        onToggleNumbers={vi.fn()}
        onToggleSpecials={onToggleSymbols}
      />
    );

    await user.click(screen.getByRole("button", { name: "Numbers" }));

    expect(onToggleSymbols).not.toHaveBeenCalled();
  });

  it("should not call onToggleSymbols when Numbers button is clicked", async () => {
    const user = userEvent.setup();
    const onToggleNumbers = vi.fn();

    render(
      <PasswordOptions
        withNumbers={false}
        withSpecials={false}
        onToggleNumbers={onToggleNumbers}
        onToggleSpecials={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Symbols" }));

    expect(onToggleNumbers).not.toHaveBeenCalled();
  });
});
