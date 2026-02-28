import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    // Optional: log for debugging
    console.log("GitHub Marketplace webhook received");
    console.log(body);

    return NextResponse.json(
      { status: "received" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { status: "error" },
      { status: 500 }
    );
  }
}