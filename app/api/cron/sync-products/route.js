import { NextResponse } from "next/server";
import { syncProducts } from "@/lib/product-sync";

/**
 * GET /api/cron/sync-products
 *
 * Cron-safe endpoint for automated product syncing.
 * Designed to be called by:
 *   - Vercel Cron Jobs (via vercel.json)
 *   - GitHub Actions scheduled workflows
 *   - Any external cron service (cron-job.org, cronitor, etc.)
 *
 * Protected by CRON_SECRET to prevent unauthorized triggers.
 * Set CRON_SECRET in your environment variables and pass it as
 * ?secret=YOUR_CRON_SECRET or Authorization: Bearer YOUR_CRON_SECRET
 */
export async function GET(request) {
  try {
    // Verify cron secret for security
    const { searchParams } = new URL(request.url);
    const secretParam = searchParams.get("secret");
    const authHeader = request.headers.get("authorization") || "";
    const bearerToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : "";
    const expectedSecret = process.env.CRON_SECRET;

    // Allow in dev mode without strict auth
    if (process.env.NODE_ENV === "production" && expectedSecret) {
      const isValid =
        secretParam === expectedSecret || bearerToken === expectedSecret;
      if (!isValid) {
        return NextResponse.json(
          { error: "Unauthorized — invalid or missing CRON_SECRET" },
          { status: 401 }
        );
      }
    }

    console.log("[CronSync] Triggering product sync...");
    const result = await syncProducts();

    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString(),
      message:
        result.status === "success"
          ? `Synced ${result.stats.total} products (${result.stats.inserted} new, ${result.stats.updated} updated) in ${result.stats.elapsed}`
          : result.message || result.status,
    });
  } catch (error) {
    console.error("[CronSync] Error:", error);
    return NextResponse.json(
      { error: error.message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
