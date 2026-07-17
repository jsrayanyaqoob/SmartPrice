import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import cache from "@/lib/cache";

// GET /api/admin/users - fetch all users (admin only)
export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!user || user.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  // Only cache the first page with no search query
  const cacheKey = `admin:users:${query || ""}:${page}:${limit}`;
  if (!query && page === 1) {
    const cached = cache.get(cacheKey);
    if (cached) return NextResponse.json(cached);
  }

  const where = query
    ? {
        OR: [
          { email: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            priceAlerts: true,
            wishlist: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const data = { users, total, page, limit };
  if (!query && page === 1) {
    cache.set(cacheKey, data, 15_000); // Cache for 15 seconds
  }

  return NextResponse.json(data);
}

// Invalidate cache when users are modified
function invalidateUserCache() {
  cache.delPrefix("admin:users:");
  cache.del("admin:stats");
}

// PATCH /api/admin/users - update user role or plan
export async function PATCH(request) {
  const currentUser = await getUserFromRequest(request);
  if (!currentUser || currentUser.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, role, plan } = await request.json();
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const updateData = {};
  if (role) updateData.role = role;
  if (plan) updateData.plan = plan;

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, plan: true },
  });

  // Audit log
  const changes = [];
  if (role) changes.push(`role → ${role}`);
  if (plan) changes.push(`plan → ${plan}`);
  await prisma.auditLog.create({
    data: {
      adminId: currentUser.id,
      adminName: currentUser.name || currentUser.email || "Admin",
      action: "user_updated",
      entity: "user",
      entityId: userId,
      details: changes.length > 0 ? `Updated ${updated.name || updated.email}: ${changes.join(", ")}` : `Updated ${updated.name || updated.email}`,
    },
  }).catch((e) => console.error("Audit log error:", e));

  invalidateUserCache();

  return NextResponse.json({ success: true, user: updated });
}

// DELETE /api/admin/users - delete a user
export async function DELETE(request) {
  const currentUser = await getUserFromRequest(request);
  if (!currentUser || currentUser.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await request.json();
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const deletedUser = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
  await prisma.user.delete({ where: { id: userId } });

  // Audit log
  await prisma.auditLog.create({
    data: {
      adminId: currentUser.id,
      adminName: currentUser.name || currentUser.email || "Admin",
      action: "user_deleted",
      entity: "user",
      entityId: userId,
      details: `Deleted ${deletedUser?.name || deletedUser?.email || userId}`,
    },
  }).catch((e) => console.error("Audit log error:", e));

  invalidateUserCache();

  return NextResponse.json({ success: true });
}
