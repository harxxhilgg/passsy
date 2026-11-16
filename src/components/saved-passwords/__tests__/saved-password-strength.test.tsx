import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SavedPasswordStrength } from "../saved-password-strength";

describe("SavedPasswordStrength", () => {
  it("renders label and progress bar for weak password", () => {
    render(<SavedPasswordStrength password="123" />);

    expect(screen.getByText("Password strength")).toBeInTheDocument();
    expect(screen.getByText("Weak")).toBeInTheDocument();
  });

  it("renders strong label for complex password", () => {
    render(<SavedPasswordStrength password="G9#vL2$mP5*wQ8!xY4" />);

    expect(screen.getByText(/strong/i)).toBeInTheDocument();
  });
});
