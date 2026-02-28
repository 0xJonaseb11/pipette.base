import { NextRequest, NextResponse } from "next/server";
import { createSupportMessage } from "~~/services/supabaseService";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BODY_MIN = 10;
const BODY_MAX = 5000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, message } = body as { email?: string; message?: string };

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }
    const trimmedMessage = message.trim();
    if (trimmedMessage.length < BODY_MIN) {
      return NextResponse.json(
        { error: `Message must be at least ${BODY_MIN} characters` },
        { status: 400 },
      );
    }
    if (trimmedMessage.length > BODY_MAX) {
      return NextResponse.json(
        { error: `Message must be at most ${BODY_MAX} characters` },
        { status: 400 },
      );
    }

    await createSupportMessage(trimmedEmail, trimmedMessage);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Support message error:", err);
    return NextResponse.json({ error: "Failed to send message. Try again later." }, { status: 500 });
  }
}
