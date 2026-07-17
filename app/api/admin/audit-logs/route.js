import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// POST /api/admin/audit-logs — log an admin action (called by admin API routes)
export async function POST(request) {
  const admin = await getUserFromRequest(request);
  if (!admin || admin.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { action, entity, entityId, details } = await request.json();
  if (!action || !entity) {
    return NextResponse.json({ error: "action and entity are required" }, { status: 400 });
  }

  try {
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        adminName: admin.name || admin.email || "Admin",
        action,
        entity,
        entityId: entityId || null,
        details: details || null,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Audit log error:", error);
    return NextResponse.json({ success: false, error: "Failed to log action" }, { status: 500 });
  }
}

// GET /api/admin/audit-logs — fetch audit log entries
export async function GET(request) {
  const admin = await getUserFromRequest(request);
  if (!admin || admin.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");
  const action = searchParams.get("action") || "";
  const entity = searchParams.get("entity") || "";

  const where = {};
  if (action) where.action = action;
  if (entity) where.entity = entity;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return NextResponse.json({ logs, total, page, limit });
}
