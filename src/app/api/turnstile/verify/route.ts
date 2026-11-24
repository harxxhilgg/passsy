import { NextResponse } from "next/server";
import { verifyTurnstileToken } from "@/lib/turnstile";

export const TURNSTILE_COOKIE_NAME = "turnstile_verified";
const TWENTY_FOUR_HOURS_SECONDS = 60 * 60 * 24;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string };
    const verification = await verifyTurnstileToken(body.token);

    if (!verification.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            verification.error ||
            "Security verification failed. Please try again.",
        },
        { status: 400 }
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(TURNSTILE_COOKIE_NAME, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: TWENTY_FOUR_HOURS_SECONDS,
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request." },
      { status: 400 }
    );
  }
}
