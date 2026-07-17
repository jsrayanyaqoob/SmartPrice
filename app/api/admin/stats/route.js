import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import cache from "@/lib/cache";

// GET /api/admin/stats - global platform stats for admin dashboard
export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check cache first
    const cached = cache.get("admin:stats");
    if (cached) {
      return NextResponse.json(cached);
    }

    const [totalUsers, totalProducts, totalAlerts, totalStores, recentUsers] =
      await Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.priceAlert.count(),
        prisma.productPrice.findMany({ select: { storeName: true }, distinct: ["storeName"] }).then((stores) => stores.length),
        prisma.user.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            plan: true,
            createdAt: true,
          },
        }),
      ]);

    const data = { totalUsers, totalProducts, totalAlerts, totalStores, recentUsers };
    cache.set("admin:stats", data, 30_000); // Cache for 30 seconds

    return NextResponse.json(data);
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 });
  }
}
