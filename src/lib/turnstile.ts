const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileVerifyResult = {
  success: boolean;
  error?: string;
};

/**
 * Verifies a Cloudflare Turnstile token on the server.
 */
export async function verifyTurnstileToken(
  token: string | undefined | null
): Promise<TurnstileVerifyResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error("TURNSTILE_SECRET_KEY is not configured.");
    return {
      success: false,
      error: "Security verification is not configured on the server.",
    };
  }

  if (!token || !token.trim()) {
    return {
      success: false,
      error: "Please complete the security verification.",
    };
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: "Security verification service unavailable. Please try again.",
      };
    }

    const data = (await response.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };

    if (!data.success) {
      return {
        success: false,
        error: "Security verification failed. Please try again.",
      };
    }

    return { success: true };
  } catch (err) {
    console.error("Turnstile verification error:", err);
    return {
      success: false,
      error: "Security verification failed. Please try again.",
    };
  }
}
