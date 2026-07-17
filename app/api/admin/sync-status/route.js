import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSyncStatus, syncProducts } from "@/lib/product-sync";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/admin/sync-status
 * Returns current product sync status: counts, data sources, last sync time.
 */
export async function GET() {
  try {
    const status = await getSyncStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error("Sync status error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/sync-status
 * Trigger a full product sync (requires admin auth).
 */
export async function POST() {
  try {
    // Verify admin access
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    let isAdmin = false;

    if (token) {
      const decoded = verifyToken(token);
      isAdmin = decoded?.role === "Admin";
    }

    if (!isAdmin && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Unauthorized — admin access required" },
        { status: 401 }
      );
    }

    const result = await syncProducts();
    const status = await getSyncStatus();
    return NextResponse.json({ ...result, ...status });
  } catch (error) {
    console.error("Sync trigger error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
