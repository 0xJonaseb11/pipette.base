import { NextRequest, NextResponse } from "next/server";
import { getUserStatusCounts, listUsers } from "~~/services/supabaseService";
import type { UserStatus } from "~~/types";
import { isAdminListMessageValid, verifyAdminSignature } from "~~/utils/adminAuth";

export async function GET(req: NextRequest) {
  try {
    const adminWallet = req.headers.get("x-admin-wallet") ?? "";
    const signature = req.headers.get("x-admin-signature") ?? "";
    const message = req.headers.get("x-admin-message") ?? "";

    const auth = await verifyAdminSignature({ adminWallet, signature, message });
    if (!auth.ok) {
      const status = auth.error === "ADMIN_NOT_CONFIGURED" ? 503 : 401;
      return NextResponse.json({ data: null, error: auth.error }, { status });
    }

    if (!isAdminListMessageValid(message)) {
      return NextResponse.json({ data: null, error: "INVALID_MESSAGE" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status") ?? "all";
    const page = Number.parseInt(searchParams.get("page") ?? "1", 10);
    const limit = Number.parseInt(searchParams.get("limit") ?? "25", 10);
    const search = searchParams.get("search") ?? undefined;

    const allowed: Array<UserStatus | "all"> = ["all", "active", "pending", "blocked"];
    const status = allowed.includes(statusParam as UserStatus | "all")
      ? (statusParam as UserStatus | "all")
      : "all";

    const [result, counts] = await Promise.all([
      listUsers({ status, page, limit, search }),
      getUserStatusCounts(),
    ]);

    return NextResponse.json({ data: { ...result, counts }, error: null });
  } catch (err) {
    console.error("admin users list error:", err);
    return NextResponse.json({ data: null, error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
