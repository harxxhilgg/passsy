import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { verifyTurnstileToken } from "./turnstile";

describe("verifyTurnstileToken", () => {
  const originalSecret = process.env.TURNSTILE_SECRET_KEY;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.TURNSTILE_SECRET_KEY = "test-secret-key";
  });

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.TURNSTILE_SECRET_KEY;
    } else {
      process.env.TURNSTILE_SECRET_KEY = originalSecret;
    }
  });

  it("fails when TURNSTILE_SECRET_KEY is not configured", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    const result = await verifyTurnstileToken("some-token");
    expect(result.success).toBe(false);
    expect(result.error).toBe(
      "Security verification is not configured on the server."
    );
  });

  it("fails when token is missing or empty", async () => {
    expect(await verifyTurnstileToken("")).toEqual({
      success: false,
      error: "Please complete the security verification.",
    });
    expect(await verifyTurnstileToken(null)).toEqual({
      success: false,
      error: "Please complete the security verification.",
    });
  });

  it("returns success true when Cloudflare siteverify succeeds", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const result = await verifyTurnstileToken("valid-token");
    expect(result).toEqual({ success: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      expect.objectContaining({
        method: "POST",
      })
    );
  });

  it("returns success false when Cloudflare siteverify rejects the token", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        success: false,
        "error-codes": ["invalid-input-response"],
      }),
    } as Response);

    const result = await verifyTurnstileToken("invalid-token");
    expect(result).toEqual({
      success: false,
      error: "Security verification failed. Please try again.",
    });
  });

  it("handles fetch network errors gracefully", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));

    const result = await verifyTurnstileToken("valid-token");
    expect(result).toEqual({
      success: false,
      error: "Security verification failed. Please try again.",
    });
  });
});
