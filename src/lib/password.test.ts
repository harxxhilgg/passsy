import { describe, expect, it } from "vitest";
import {
  buildCharset,
  calcPasswordStrength,
  calcStrength,
  generatePassword,
  getStrengthColor,
  getStrengthLabel,
  getStrengthTextColor,
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

describe("calcPasswordStrength", () => {
  it("returns 0 for empty password", () => {
    expect(calcPasswordStrength("")).toBe(0);
  });

  it("scores weak passwords accurately", () => {
    const score = calcPasswordStrength("abc");
    expect(score).toBeLessThan(30);
  });

  it("scores strong passwords accurately", () => {
    const score = calcPasswordStrength("C7!kL9#mP2$xQ5&v89012345");
    expect(score).toBeGreaterThanOrEqual(90);
  });
});

describe("getStrengthLabel", () => {
  it("returns appropriate labels for scores", () => {
    expect(getStrengthLabel(20)).toBe("Weak");
    expect(getStrengthLabel(40)).toBe("Fair");
    expect(getStrengthLabel(65)).toBe("Good");
    expect(getStrengthLabel(80)).toBe("Strong");
    expect(getStrengthLabel(95)).toBe("Very strong");
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

describe("getStrengthTextColor", () => {
  it("returns appropriate text color classes based on score", () => {
    expect(getStrengthTextColor(20)).toBe("text-red-500");
    expect(getStrengthTextColor(45)).toBe("text-orange-500 dark:text-orange-400");
    expect(getStrengthTextColor(65)).toBe("text-amber-500 dark:text-amber-400");
    expect(getStrengthTextColor(80)).toBe("text-lime-500 dark:text-lime-400");
    expect(getStrengthTextColor(95)).toBe("text-emerald-500 dark:text-emerald-400");
  });
});
