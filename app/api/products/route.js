import { NextResponse } from "next/server";

let cachedRawItems = null;
let cachedAt = 0;
const CACHE_TTL_MS = 300_000; // 5 minutes cache

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = process.env.APIFY_TOKEN;
    const datasetUrl1 = process.env.APIFY_DATASET_URL;
    const datasetUrl2 = "https://api.apify.com/v2/datasets/Y73kxAicap4JTXemH/items";
    const now = Date.now();

    let items = [];

    if (cachedRawItems && now - cachedAt < CACHE_TTL_MS) {
      items = cachedRawItems;
    } else {
      if (!token) {
        return NextResponse.json({ products: [] });
      }

      const urls = [];
      if (datasetUrl1) urls.push(`${datasetUrl1}?token=${token}&limit=250`);
      urls.push(`${datasetUrl2}?token=${token}&limit=150`);

      const fetchPromises = urls.map(async (url) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        try {
          const res = await fetch(url, {
            headers: { Accept: "application/json" },
            next: { revalidate: 300 },
            signal: controller.signal,
          });
          clearTimeout(timeout);
          if (!res.ok) {
            throw new Error(`Apify request failed with ${res.status} for ${url}`);
          }
          return await res.json();
        } catch (err) {
          clearTimeout(timeout);
          throw err;
        }
      });

      const results = await Promise.allSettled(fetchPromises);
      results.forEach((r) => {
        if (r.status === "fulfilled" && Array.isArray(r.value)) {
          items.push(...r.value);
        } else if (r.status === "rejected") {
          console.error("Apify fetch dataset error:", r.reason);
        }
      });

      if (items.length > 0) {
        cachedRawItems = items;
        cachedAt = Date.now();
      } else if (cachedRawItems) {
        items = cachedRawItems;
      }
    }

    const query = (searchParams.get("q") || "").toLowerCase();
    const category = (searchParams.get("category") || "").toLowerCase();

    const resolveImageUrl = (item) => {
      const highResImages = Array.isArray(item.highResolutionImages) ? item.highResolutionImages : [];
      const firstImage = highResImages.find(Boolean);

      if (typeof firstImage === "string") return firstImage;
      if (firstImage && typeof firstImage === "object") {
        return firstImage.url || firstImage.src || firstImage.imageUrl || "";
      }

      const images = Array.isArray(item.images) ? item.images : [];
      if (images.length > 0 && typeof images[0] === "string") return images[0];

      return item.imageUrl || item.image || item.thumbnail || "";
    };

    const parsePrice = (value) => {
      if (value === null || value === undefined || value === "") return null;
      if (typeof value === "number" && Number.isFinite(value)) return value;
      if (typeof value === "string") {
        const cleaned = value.replace(/[^0-9.\-]/g, "");
        const parsed = Number(cleaned);
        return Number.isFinite(parsed) ? parsed : null;
      }
      if (typeof value === "object") {
        const nested = value.amount ?? value.value ?? value.price ?? value.currentPrice ?? value.offerPrice ?? value.salePrice ?? value.total;
        return parsePrice(nested);
      }
      return null;
    };

    const formatPrice = (value) => {
      const parsed = parsePrice(value);
      return parsed === null ? null : `$${parsed.toFixed(2)}`;
    };

    const normalizedProducts = items
      .filter((item) => {
        const name = String(item.productName || item.name || item.title || "").toLowerCase();
        const brand = String(item.brand || item.manufacturer || item.sellerName || "").toLowerCase();
        const categoryName = String(item.category || item.productCategory || "").toLowerCase();

        const matchesQuery = !query || name.includes(query) || brand.includes(query) || categoryName.includes(query);
        const matchesCategory = !category || category === "all" || categoryName.includes(category);
        return matchesQuery && matchesCategory;
      })
      .map((item, index) => ({
        id: item.itemId || item.attributes?.key || item.productId || item.id || `${item.title || "product"}-${index}`,
        title: item.productName || item.name || item.title || "Untitled product",
        name: item.productName || item.name || item.title || "Untitled product",
        brand: item.brand || item.manufacturer || item.sellerName || "General Brand",
        category: item.category || item.productCategory || (item.title?.toLowerCase().includes("game") || item.title?.toLowerCase().includes("console") || item.title?.toLowerCase().includes("wii") ? "Gaming Rig" : "General"),
        description: item.description || item.condition || item.shippingCost || "Live product from SmartPrice",
        imageUrl: resolveImageUrl(item),
        price: parsePrice(item.price ?? item.currentPrice ?? item.offerPrice ?? item.salePrice ?? item.productPrice ?? item.priceAmount ?? item.priceValue ?? item.minPrice ?? item.maxPrice ?? item.offers?.[0]?.price ?? item.pricing?.price ?? item.priceDetails?.amount) ?? 0,
        bestPrice: formatPrice(item.price ?? item.currentPrice ?? item.offerPrice ?? item.salePrice ?? item.productPrice ?? item.priceAmount ?? item.priceValue ?? item.minPrice ?? item.maxPrice ?? item.offers?.[0]?.price ?? item.pricing?.price ?? item.priceDetails?.amount) || "Price unavailable",
        retailers: item.retailers || item.availableStores || 1,
        currency: item.currency || "USD",
        source: item.url?.includes("ebay.com") ? "eBay" : "Apify",
        originalPrice: item.originalPrice ? `$${Number(item.originalPrice).toFixed(2)}` : null,
      }));

    return NextResponse.json({ products: normalizedProducts });
  } catch (error) {
    console.error("Fetch products error:", error);
    return NextResponse.json({ products: [] });
  }
}
