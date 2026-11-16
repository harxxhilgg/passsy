import { describe, expect, it, beforeEach } from "vitest";
import { encryptText, decryptText } from "./crypto";

describe("crypto AES-256-GCM", () => {
  const TEST_KEY =
    "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

  beforeEach(() => {
    process.env.ENCRYPTION_KEY = TEST_KEY;
  });

  it("encrypts and decrypts text correctly", () => {
    const original = "my-super-secret-password-123!";
    const encrypted = encryptText(original);

    expect(encrypted.ciphertext).not.toBe(original);
    expect(encrypted.iv).toHaveLength(24); // 12 bytes = 24 hex chars
    expect(encrypted.tag).toHaveLength(32); // 16 bytes = 32 hex chars

    const decrypted = decryptText(encrypted);
    expect(decrypted).toBe(original);
  });

  it("generates different ciphertexts and IVs for the same plaintext", () => {
    const text = "repeatable-text";
    const enc1 = encryptText(text);
    const enc2 = encryptText(text);

    expect(enc1.iv).not.toBe(enc2.iv);
    expect(enc1.ciphertext).not.toBe(enc2.ciphertext);

    expect(decryptText(enc1)).toBe(text);
    expect(decryptText(enc2)).toBe(text);
  });

  it("fails decryption if ciphertext or tag is tampered with", () => {
    const encrypted = encryptText("safe-text");
    const tampered = {
      ...encrypted,
      ciphertext: encrypted.ciphertext.slice(0, -2) + "ff",
    };

    expect(() => decryptText(tampered)).toThrow();
  });
});
