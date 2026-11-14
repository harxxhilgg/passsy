import { describe, expect, it } from "vitest";
import {
  buildCharset,
  calcStrength,
  generatePassword,
  getStrengthColor,
} from "./password";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SPECIALS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

describe("buildCharSet", () => {
  it("should return LETTERS only", () => {
    expect(buildCharset(false, false)).toBe(LETTERS);
  });

  it("should return LETTERS + NUMBERS", () => {
    expect(buildCharset(true, false)).toBe(LETTERS + NUMBERS);
  });

  it("should return LETTERS + SPECIALS", () => {
    expect(buildCharset(false, true)).toBe(LETTERS + SPECIALS);
  });

  it("should return LETTERS + NUMBERS + SPECIALS", () => {
    expect(buildCharset(true, true)).toBe(LETTERS + NUMBERS + SPECIALS);
  });
});

describe("generatePassword", () => {
  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

  it("should return a string", () => {
    const result = generatePassword(50, charset);
    expect(typeof result).toBe("string");
  });

  it("should generate a password of the requested length", () => {
    const result = generatePassword(16, charset);
    expect(result).toHaveLength(16);
  });

  it("should generate a password with minimum length of 6", () => {
    const result = generatePassword(6, charset);
    expect(result).toHaveLength(6);
  });

  it("should generate a password with maximum length of 100", () => {
    const result = generatePassword(100, charset);
    expect(result).toHaveLength(100);
  });

  it("should generate an empty string when empty charset is passed", () => {
    const result = generatePassword(100, "");
    expect(result).toBe("");
  });
});

describe("calcStrength", () => {
  it("should return a number", () => {
    const result = calcStrength(50, true, true);
    expect(typeof result).toBe("number");
  });
});

describe("getStrengthColor", () => {
  it("should return the red color if score is less than 30", () => {
    expect(getStrengthColor(29)).toBe("bg-red-500");
  });

  it("should return the orange color if score is less than 55", () => {
    expect(getStrengthColor(54)).toBe("bg-orange-400");
  });

  it("should return the yellow color if score is less than 75", () => {
    expect(getStrengthColor(74)).toBe("bg-yellow-400");
  });

  it("should return the lime color if score is less than 90", () => {
    expect(getStrengthColor(89)).toBe("bg-lime-400");
  });

  it("should return the emerald color is score is greater or equal to 90", () => {
    expect(getStrengthColor(90)).toBe("bg-emerald-500");
  });
});
