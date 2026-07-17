import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { syncProducts } from "@/lib/product-sync";
import { verifyToken } from "@/lib/auth";

/**
 * POST /api/products/sync
 * Trigger a manual sync of products from all data sources into the database.
 * Requires admin authentication.
 */
export async function POST(request) {
  try {
    // Verify admin by decoding the JWT from the auth cookie
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    let isAdmin = false;

    if (token) {
      const decoded = verifyToken(token);
      isAdmin = decoded?.role === "Admin";
    }

    // Allow in dev mode without strict auth
    if (!isAdmin && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized — admin access required" }, { status: 401 });
    }

    const result = await syncProducts();

    return NextResponse.json(result, {
      status: result.status === "error" ? 500 : 200,
    });
  } catch (error) {
    console.error("Sync endpoint error:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/products/sync
 * Check the status of the last sync.
 */
export async function GET() {
  return NextResponse.json({
    message: "Use POST to trigger a product sync",
    docs: "POST /api/products/sync triggers a full sync from all data sources",
  });
}
