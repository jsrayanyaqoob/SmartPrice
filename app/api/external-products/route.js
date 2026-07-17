import { NextResponse } from "next/server";
import { getProductsFromDb, ensureProducts } from "@/lib/product-sync";

export async function GET() {
  try {
    // Auto-sync if database is empty
    const syncResult = await ensureProducts();

    // Get a random selection of products (for trending display)
    const { products } = await getProductsFromDb({ limit: 24 });

    // Shuffle for variety and map to expected format
    const shuffled = [...products].sort(() => Math.random() - 0.5);

    const mapped = shuffled.map((p) => {
      const bestPrice = p.productPrices?.length > 0
        ? Math.min(...p.productPrices.map((pp) => pp.price))
        : p.price;

      return {
        id: p.externalId || p.slug,
        name: p.name,
        title: p.title,
        brand: p.brand,
        category: p.category,
        description: p.description,
        imageUrl: p.imageUrl,
        price: p.price,
        bestPrice: `$${bestPrice.toFixed(2)}`,
        originalPrice: null,
        retailers: p.productPrices?.length || 1,
        currency: p.currency,
        source: "SmartPrice Database",
      };
    });

    return NextResponse.json({
      products: mapped,
      cached: syncResult.status === "cached",
    });
  } catch (error) {
    console.error("External products fetch error:", error);
    return NextResponse.json({ products: [], error: "Failed to fetch external products" }, { status: 500 });
  }
}
