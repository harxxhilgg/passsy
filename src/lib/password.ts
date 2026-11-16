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
 * Calculates the strength score (0-100) of an existing password string based on length and character diversity.
 */
export function calcPasswordStrength(password: string): number {
  if (!password) return 0;

  const len = password.length;
  // Length score up to 60 points (reaching 60 at 24 chars)
  const lengthScore = Math.min(60, Math.round((len / 24) * 60));

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const diversityBonus =
    (hasLower ? 10 : 0) +
    (hasUpper ? 10 : 0) +
    (hasNumber ? 10 : 0) +
    (hasSpecial ? 10 : 0);

  return Math.min(100, lengthScore + diversityBonus);
}

/**
 * Maps a strength score (0-100) to a human-readable label.
 */
export function getStrengthLabel(score: number): string {
  if (score < 30) return "Weak";
  if (score < 55) return "Fair";
  if (score < 75) return "Good";
  if (score < 90) return "Strong";
  return "Very strong";
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

/**
 * Maps a strength score (0-100) to a Tailwind text color class for text or icon strokes.
 */
export function getStrengthTextColor(score: number): string {
  if (score < 30) return "text-red-500";
  if (score < 55) return "text-orange-500 dark:text-orange-400";
  if (score < 75) return "text-amber-500 dark:text-amber-400";
  if (score < 90) return "text-lime-500 dark:text-lime-400";
  return "text-emerald-500 dark:text-emerald-400";
}
