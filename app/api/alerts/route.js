import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// GET /api/alerts - get current user's price alerts
export async function GET(request) {
  try {
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
  } catch (error) {
    console.error("GET /api/alerts error:", error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}

// POST /api/alerts - create a new price alert
export async function POST(request) {
  try {
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

    // Resolve the product's database UUID from the frontend-facing ID (externalId or slug)
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { externalId: productId },
          { slug: productId },
        ],
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found. Please try again or select a different product." },
        { status: 404 }
      );
    }

    // Get current price from most recent price entry
    const latestEntry = await prisma.productPrice.findFirst({
      where: { productId: product.id },
      orderBy: { scrapedAt: "desc" },
    });

    const currentPrice = latestEntry?.price || product.price || 0;

    const alert = await prisma.priceAlert.create({
      data: {
        userId: user.id,
        productId: product.id, // Use the actual database UUID
        targetPrice: parseFloat(targetPrice),
        currentPrice,
        notifyEmail: notifyEmail !== false,
        notifyPush: notifyPush !== false,
        notifySMS: notifySMS === true,
      },
      include: { product: true },
    });

    return NextResponse.json({ success: true, alert }, { status: 201 });
  } catch (error) {
    console.error("POST /api/alerts error:", error);
    return NextResponse.json(
      { error: "Failed to create alert. Please try again." },
      { status: 500 }
    );
  }
}

// PATCH /api/alerts - update alert status or target price
export async function PATCH(request) {
  try {
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

    if (alert.count === 0) {
      return NextResponse.json({ error: "Alert not found or access denied" }, { status: 404 });
    }

    // Fetch the updated alert to return it
    const updatedAlert = await prisma.priceAlert.findFirst({
      where: { id: alertId, userId: user.id },
    });

    return NextResponse.json({ success: true, alert: updatedAlert });
  } catch (error) {
    console.error("PATCH /api/alerts error:", error);
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 });
  }
}

// DELETE /api/alerts - delete a price alert
export async function DELETE(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { alertId } = await request.json();
    if (!alertId) {
      return NextResponse.json({ error: "alertId is required" }, { status: 400 });
    }

    const result = await prisma.priceAlert.deleteMany({
      where: { id: alertId, userId: user.id },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Alert not found or access denied" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/alerts error:", error);
    return NextResponse.json({ error: "Failed to delete alert" }, { status: 500 });
  }
}
