import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProductsFromDb, ensureProducts } from "@/lib/product-sync";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const productId = searchParams.get("id") || "";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    // Auto-sync if database is empty (only on first request)
    const syncResult = await ensureProducts();
    if (syncResult.status === "error") {
      console.warn("Initial sync failed, serving from cache if available");
    }

    // If fetching a single product by ID (externalId or slug)
    if (productId) {
      const product = await prisma.product.findFirst({
        where: {
          OR: [
            { externalId: productId },
            { slug: productId },
          ],
        },
        include: {
          productPrices: {
            orderBy: { scrapedAt: "desc" },
            take: 30,
          },
        },
      });

      if (!product) {
        return NextResponse.json({ product: null, error: "Product not found" }, { status: 404 });
      }

      const bestPrice = product.productPrices?.length > 0
        ? Math.min(...product.productPrices.map((pp) => pp.price))
        : product.price;

      return NextResponse.json({
        product: {
          id: product.externalId || product.slug,
          dbId: product.id,
          title: product.title,
          name: product.name,
          brand: product.brand,
          category: product.category,
          description: product.description,
          imageUrl: product.imageUrl,
          price: product.price,
          bestPrice: `$${bestPrice.toFixed(2)}`,
          retailers: product.productPrices?.length || 1,
          currency: product.currency,
          rating: product.rating,
          priceEntries: product.productPrices?.map((pp) => ({
            store: { name: pp.storeName },
            price: pp.price,
            scrapedAt: pp.scrapedAt,
            storeUrl: pp.storeUrl,
          })) || [],
        },
      });
    }

    // Fetch from database (listing)
    const { products, total } = await getProductsFromDb({
      query,
      category,
      limit,
      offset,
    });

    // Map DB products to the expected API format
    const mapped = products.map((p) => {
      const bestPrice = p.productPrices?.length > 0
        ? Math.min(...p.productPrices.map((pp) => pp.price))
        : p.price;

      return {
        id: p.externalId || p.slug,
        title: p.title,
        name: p.name,
        brand: p.brand,
        category: p.category,
        description: p.description,
        imageUrl: p.imageUrl,
        price: p.price,
        bestPrice: `$${bestPrice.toFixed(2)}`,
        retailers: p.productPrices?.length || 1,
        currency: p.currency,
        rating: p.rating,
        priceEntries: p.productPrices?.map((pp) => ({
          store: { name: pp.storeName },
          price: pp.price,
          scrapedAt: pp.scrapedAt,
        })) || [],
      };
    });

    return NextResponse.json({
      products: mapped,
      total,
      offset,
      limit,
      sync: syncResult.status,
    });
  } catch (error) {
    console.error("Fetch products error:", error);
    return NextResponse.json({ 
      products: [], 
      total: 0, 
      error: process.env.NODE_ENV !== "production" ? error.message : "Failed to fetch products" 
    }, { status: 500 });
  }
}
