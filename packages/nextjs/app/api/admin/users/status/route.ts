import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { getUserByWallet, updateUserStatus } from "~~/services/supabaseService";
import type { UserStatus } from "~~/types";
import { isAdminStatusMessageValid, verifyAdminSignature } from "~~/utils/adminAuth";

const ALLOWED: UserStatus[] = ["active", "pending", "blocked"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      adminWallet,
      signature,
      message,
      targetWallet,
      status,
    } = body as {
      adminWallet?: string;
      signature?: string;
      message?: string;
      targetWallet?: string;
      status?: string;
    };

    if (!adminWallet || !signature || !message || !targetWallet || !status) {
      return NextResponse.json({ data: null, error: "INVALID_REQUEST" }, { status: 400 });
    }

    if (!isAddress(targetWallet) || !ALLOWED.includes(status as UserStatus)) {
      return NextResponse.json({ data: null, error: "INVALID_REQUEST" }, { status: 400 });
    }

    const auth = await verifyAdminSignature({ adminWallet, signature, message });
    if (!auth.ok) {
      const code = auth.error === "ADMIN_NOT_CONFIGURED" ? 503 : 401;
      return NextResponse.json({ data: null, error: auth.error }, { status: code });
    }

    if (!isAdminStatusMessageValid(message, targetWallet, status)) {
      return NextResponse.json({ data: null, error: "INVALID_MESSAGE" }, { status: 400 });
    }

    const user = await getUserByWallet(targetWallet);
    if (!user) {
      return NextResponse.json({ data: null, error: "USER_NOT_FOUND" }, { status: 404 });
    }

    await updateUserStatus(targetWallet, status as UserStatus);
    const updated = await getUserByWallet(targetWallet);

    return NextResponse.json({ data: { user: updated }, error: null });
  } catch (err) {
    console.error("admin status update error:", err);
    return NextResponse.json({ data: null, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
