import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import cache from "@/lib/cache";

// GET /api/admin/products - fetch all products (admin only)
export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== "Admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";

    const cacheKey = `admin:products:${query || ""}:${category || ""}`;
    if (!query) {
      const cached = cache.get(cacheKey);
      if (cached) return NextResponse.json(cached);
    }

    const where = {};
    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { brand: { contains: query, mode: "insensitive" } },
      ];
    }
    if (category && category !== "All") {
      where.category = { equals: category, mode: "insensitive" };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { rating: "desc" },
      include: {
        productPrices: {
          orderBy: { scrapedAt: "desc" },
          take: 5,
        },
      },
    });

    const data = { products };
    if (!query) {
      cache.set(cacheKey, data, 15_000); // Cache for 15 seconds
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Admin products fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

function invalidateProductCache() {
  cache.delPrefix("admin:products:");
  cache.del("admin:stats");
}

// POST /api/admin/products - add a new product
export async function POST(request) {
  const user = await getUserFromRequest(request);
  if (!user || user.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { title, brand, category, price, imageUrl, description, sourceWebsite, rating, specs } = body;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  try {
    const product = await prisma.product.create({
      data: {
        title,
        name: title,
        brand: brand || null,
        category: category || null,
        price: parseFloat(price) || 0,
        imageUrl: imageUrl || null,
        description: description || null,
        sourceUrl: sourceWebsite || null,
        rating: parseFloat(rating) || 0,
        metadata: {
          sourceWebsite: sourceWebsite || null,
          specs: specs || {},
        },
        slug: `${slug}-${Date.now()}`,
      },
    });
    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: user.id,
        adminName: user.name || user.email || "Admin",
        action: "product_created",
        entity: "product",
        entityId: product.id,
        details: `Created "${title}"${brand ? ` by ${brand}` : ""} ($${price || "0"})`,
      },
    }).catch((e) => console.error("Audit log error:", e));

    invalidateProductCache();

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

// DELETE /api/admin/products - delete a product
export async function DELETE(request) {
  const user = await getUserFromRequest(request);
  if (!user || user.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { productId } = await request.json();
  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  const deletedProduct = await prisma.product.findUnique({ where: { id: productId }, select: { title: true, brand: true } });
  await prisma.product.delete({ where: { id: productId } });

  // Audit log
  await prisma.auditLog.create({
    data: {
      adminId: user.id,
      adminName: user.name || user.email || "Admin",
      action: "product_deleted",
      entity: "product",
      entityId: productId,
      details: `Deleted "${deletedProduct?.title || productId}"${deletedProduct?.brand ? ` by ${deletedProduct.brand}` : ""}`,
    },
  }).catch((e) => console.error("Audit log error:", e));

  invalidateProductCache();

  return NextResponse.json({ success: true });
}
