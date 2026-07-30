import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "Webhook endpoint active" }, { status: 200 });
}

function verifyGitHubSignature(payload: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader?.startsWith("sha256=")) return false;
  const received = signatureHeader.slice("sha256=".length);
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(received, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.GITHUB_WEBHOOK_SECRET?.trim();
    if (!secret) {
      return NextResponse.json({ status: "error", error: "WEBHOOK_NOT_CONFIGURED" }, { status: 503 });
    }

    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature-256");
    if (!verifyGitHubSignature(rawBody, signature, secret)) {
      return NextResponse.json({ status: "error", error: "UNAUTHORIZED" }, { status: 401 });
    }

    return NextResponse.json({ status: "received" }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
