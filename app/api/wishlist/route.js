import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

// GET /api/wishlist - get current user's wishlist
export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const wishlist = await prisma.wishlist.findMany({
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

  return NextResponse.json({ wishlist });
}

// POST /api/wishlist - add a product to wishlist
export async function POST(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await request.json();
  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  // Check if already in wishlist
  const existing = await prisma.wishlist.findFirst({
    where: { userId: user.id, productId },
  });

  if (existing) {
    return NextResponse.json({ error: "Already in wishlist" }, { status: 400 });
  }

  const item = await prisma.wishlist.create({
    data: { userId: user.id, productId },
    include: { product: true },
  });

  return NextResponse.json({ success: true, item }, { status: 201 });
}

// DELETE /api/wishlist - remove from wishlist
export async function DELETE(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await request.json();
  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  await prisma.wishlist.deleteMany({
    where: { userId: user.id, productId },
  });

  return NextResponse.json({ success: true });
}
