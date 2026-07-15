import { NextResponse } from "next/server";

export async function GET() {
  try {
    const token = process.env.APIFY_TOKEN;
    const datasetUrl1 = process.env.APIFY_DATASET_URL;
    const datasetUrl2 = "https://api.apify.com/v2/datasets/Y73kxAicap4JTXemH/items";

    if (!token) {
      return NextResponse.json({ products: [] });
    }

    const urls = [];
    if (datasetUrl1) urls.push(`${datasetUrl1}?token=${token}`);
    urls.push(`${datasetUrl2}?token=${token}`);

    const fetchPromises = urls.map(async (url) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      try {
        const res = await fetch(url, {
          headers: { Accept: "application/json" },
          next: { revalidate: 60 },
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
    const items = [];
    results.forEach((r) => {
      if (r.status === "fulfilled" && Array.isArray(r.value)) {
        items.push(...r.value);
      } else if (r.status === "rejected") {
        console.error("Apify external fetch dataset error:", r.reason);
      }
    });

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

    const mapped = items.slice(0, 24).map((item, index) => ({
      id: item.itemId || item.productId || item.id || `${item.title || "product"}-${index}`,
      name: item.productName || item.name || item.title || "Untitled product",
      title: item.productName || item.name || item.title || "Untitled product",
      brand: item.brand || item.manufacturer || item.sellerName || "General Brand",
      category: item.category || item.productCategory || (item.title?.toLowerCase().includes("game") || item.title?.toLowerCase().includes("console") || item.title?.toLowerCase().includes("wii") ? "Gaming Rig" : "General"),
      description: item.description || item.condition || item.shippingCost || "Live product from SmartPrice",
      imageUrl: resolveImageUrl(item),
      price: parsePrice(item.price ?? item.currentPrice ?? item.offerPrice ?? item.salePrice ?? item.productPrice ?? item.priceAmount ?? item.priceValue ?? item.minPrice ?? item.maxPrice ?? item.offers?.[0]?.price ?? item.pricing?.price ?? item.priceDetails?.amount) ?? 0,
      bestPrice: formatPrice(item.price ?? item.currentPrice ?? item.offerPrice ?? item.salePrice ?? item.productPrice ?? item.priceAmount ?? item.priceValue ?? item.minPrice ?? item.maxPrice ?? item.offers?.[0]?.price ?? item.pricing?.price ?? item.priceDetails?.amount) || "Price unavailable",
      retailers: item.retailers || item.availableStores || 1,
      currency: item.currency || "USD",
      source: item.url?.includes("ebay.com") ? "eBay" : "Apify",
      originalUrl: item.url || item.productUrl || "",
    }));

    return NextResponse.json({ products: mapped });
  } catch (error) {
    console.error("Apify fetch error:", error);
    return NextResponse.json({ products: [] });
  }
}
