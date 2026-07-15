import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// GET /api/admin/stats - global platform stats for admin dashboard
export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!user || user.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

  return NextResponse.json({
    totalUsers,
    totalProducts,
    totalAlerts,
    totalStores,
    recentUsers,
  });
}
