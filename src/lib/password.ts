export const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
export const NUMBERS = "0123456789";
export const SPECIALS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
export const MIN_LENGTH = 6;
export const MAX_LENGTH = 100;

export function buildCharset(
  withNumbers: boolean,
  withSpecials: boolean
): string {
  return (
    LETTERS + (withNumbers ? NUMBERS : "") + (withSpecials ? SPECIALS : "")
  );
}

export function generatePassword(len: number, charset: string): string {
  return Array.from({ length: len }, () =>
    charset.charAt(Math.floor(Math.random() * charset.length))
  ).join("");
}

/**
 * Calculates a strength score between 0 and 100 based on length and charset variety.
 * Instantaneous calculation with zero runtime latency.
 */
export function calcStrength(
  len: number,
  withNumbers: boolean,
  withSpecials: boolean
): number {
  const lengthScore = Math.min(70, Math.round((len / 32) * 70));
  const charsetBonus = (withNumbers ? 15 : 0) + (withSpecials ? 15 : 0);
  return Math.min(100, lengthScore + charsetBonus);
}

/**
 * Maps a strength score (0-100) to a Tailwind background color class.
 */
export function getStrengthColor(score: number): string {
  if (score < 30) return "bg-red-500";
  if (score < 55) return "bg-orange-400";
  if (score < 75) return "bg-yellow-400";
  if (score < 90) return "bg-lime-400";
  return "bg-emerald-500";
}
