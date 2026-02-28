import { NextRequest, NextResponse } from "next/server";
import { createSupportMessage } from "~~/services/supabaseService";
import { sendSupportNotification } from "~~/services/supportEmailService";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BODY_MIN = 10;
const BODY_MAX = 5000;

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateLimitStore: { key: string; timestamps: number[] }[] = [];

function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const cut = now - RATE_LIMIT_WINDOW_MS;
  let entry = rateLimitStore.find(e => e.key === ip);
  if (!entry) {
    entry = { key: ip, timestamps: [] };
    rateLimitStore.push(entry);
  }
  entry.timestamps = entry.timestamps.filter(t => t > cut);
  if (entry.timestamps.length >= RATE_LIMIT_MAX) return true;
  entry.timestamps.push(now);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests. Please try again in a minute." }, { status: 429 });
    }

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
      return NextResponse.json({ error: `Message must be at least ${BODY_MIN} characters` }, { status: 400 });
    }
    if (trimmedMessage.length > BODY_MAX) {
      return NextResponse.json({ error: `Message must be at most ${BODY_MAX} characters` }, { status: 400 });
    }

    await createSupportMessage(trimmedEmail, trimmedMessage);

    const emailResult = await sendSupportNotification(trimmedEmail, trimmedMessage);
    if (!emailResult.ok) {
      console.error("[Support] Email not sent (message is in Supabase). Reason:", emailResult.error);
      if (!process.env.RESEND_API_KEY) {
        console.error(
          "[Support] Set RESEND_API_KEY in Vercel (or your host) Environment Variables to receive support emails in your inbox.",
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Support message error:", err);
    return NextResponse.json({ error: "Failed to send message. Try again later." }, { status: 500 });
  }
}
