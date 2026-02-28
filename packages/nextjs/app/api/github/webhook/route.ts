import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json(
      { status: "Webhook endpoint active" },
      { status: 200 }
    );
  }

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

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