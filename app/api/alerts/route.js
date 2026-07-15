import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// GET /api/alerts - get current user's price alerts
export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alerts = await prisma.priceAlert.findMany({
    where: { userId: user.id },
    include: {
      product: {
        include: {
          productPrices: {
            orderBy: { scrapedAt: "desc" },
            take: 3,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ alerts });
}

// POST /api/alerts - create a new price alert
export async function POST(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId, targetPrice, notifyEmail, notifyPush, notifySMS } = await request.json();
  if (!productId || targetPrice === undefined) {
    return NextResponse.json(
      { error: "productId and targetPrice are required" },
      { status: 400 }
    );
  }

  // Get current price from most recent entry
  const latestEntry = await prisma.productPrice.findFirst({
    where: { productId },
    orderBy: { scrapedAt: "desc" },
  });

  const currentPrice = latestEntry?.price || 0;

  const alert = await prisma.priceAlert.create({
    data: {
      userId: user.id,
      productId,
      targetPrice: parseFloat(targetPrice),
      currentPrice,
      notifyEmail: notifyEmail !== false,
      notifyPush: notifyPush !== false,
      notifySMS: notifySMS === true,
    },
    include: { product: true },
  });

  return NextResponse.json({ success: true, alert }, { status: 201 });
}

// PATCH /api/alerts - update alert status or target price
export async function PATCH(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { alertId, targetPrice, status } = await request.json();
  if (!alertId) {
    return NextResponse.json({ error: "alertId is required" }, { status: 400 });
  }

  const updateData = {};
  if (targetPrice !== undefined) updateData.targetPrice = parseFloat(targetPrice);
  if (status) updateData.status = status;

  const alert = await prisma.priceAlert.updateMany({
    where: { id: alertId, userId: user.id },
    data: updateData,
  });

  return NextResponse.json({ success: true, alert });
}

// DELETE /api/alerts - delete a price alert
export async function DELETE(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { alertId } = await request.json();
  if (!alertId) {
    return NextResponse.json({ error: "alertId is required" }, { status: 400 });
  }

  await prisma.priceAlert.deleteMany({
    where: { id: alertId, userId: user.id },
  });

  return NextResponse.json({ success: true });
}
