import { NextRequest, NextResponse } from "next/server";
import { bulkApprovePending } from "~~/services/supabaseService";
import { isAdminBulkApproveMessageValid, verifyAdminSignature } from "~~/utils/adminAuth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { adminWallet, signature, message } = body as {
      adminWallet?: string;
      signature?: string;
      message?: string;
    };

    if (!adminWallet || !signature || !message) {
      return NextResponse.json({ data: null, error: "INVALID_REQUEST" }, { status: 400 });
    }

    const auth = await verifyAdminSignature({ adminWallet, signature, message });
    if (!auth.ok) {
      const code = auth.error === "ADMIN_NOT_CONFIGURED" ? 503 : 401;
      return NextResponse.json({ data: null, error: auth.error }, { status: code });
    }

    if (!isAdminBulkApproveMessageValid(message)) {
      return NextResponse.json({ data: null, error: "INVALID_MESSAGE" }, { status: 400 });
    }

    const updated = await bulkApprovePending();
    return NextResponse.json({ data: { updated }, error: null });
  } catch (err) {
    console.error("admin bulk approve error:", err);
    return NextResponse.json({ data: null, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
