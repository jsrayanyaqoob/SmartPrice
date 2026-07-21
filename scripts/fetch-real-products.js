/**
 * Fetch real product data from working Apify datasets
 * and insert directly into the Neon database.
 *
 * Run: node scripts/fetch-real-products.js
 */
import { PrismaClient } from "@prisma/client";
import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const DATABASE_URL = process.env.DATABASE_URL;

// Working Apify datasets with real product data
const DATA_SOURCES = [
  { url: "https://api.apify.com/v2/datasets/z9jxKdnqXt2kaEPzI/items", category: "General", store: "Amazon" },
  { url: "https://api.apify.com/v2/datasets/Y73kxAicap4JTXemH/items", category: "Electronics", store: "eBay" },
];

function parsePrice(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.\-]/g, "");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (typeof value === "object") {
    const nested = value.amount ?? value.value ?? value.price ?? value.currentPrice ?? null;
    return parsePrice(nested);
  }
  return null;
}

function resolveImageUrl(item) {
  const highResImages = Array.isArray(item.highResolutionImages) ? item.highResolutionImages : [];
  const firstImage = highResImages.find(Boolean);
  if (typeof firstImage === "string") return firstImage;
  if (firstImage && typeof firstImage === "object")
    return firstImage.url || firstImage.src || firstImage.imageUrl || "";
  const images = Array.isArray(item.images) ? item.images : [];
  if (images.length > 0 && typeof images[0] === "string") return images[0];
  return item.imageUrl || item.image || item.thumbnail || item.thumbnailImage || "";
}

function detectCategory(item, defaultCategory) {
  if (item.breadCrumbs) {
    const breadCrumbs = item.breadCrumbs.toLowerCase();
    if (breadCrumbs.includes("electronics") || breadCrumbs.includes("computers") || breadCrumbs.includes("phones"))
      return "Electronics";
    if (breadCrumbs.includes("clothing") || breadCrumbs.includes("fashion") || breadCrumbs.includes("shoes"))
      return "Fashion";
    if (breadCrumbs.includes("home") || breadCrumbs.includes("kitchen") || breadCrumbs.includes("garden"))
      return "Home";
    if (breadCrumbs.includes("sports") || breadCrumbs.includes("fitness"))
      return "Sports";
    if (breadCrumbs.includes("games") || breadCrumbs.includes("toys"))
      return "Gaming Rig";
  }
  return defaultCategory;
}

function normalizeItems(items, sourceCategory, sourceStore) {
  return items
    .filter((item) => item.title || item.productName || item.name)
    .map((item, index) => {
      const name = item.title || item.productName || item.name || `Product ${index}`;
      const price =
        parsePrice(
          item.price ?? item.listPrice ?? item.currentPrice ?? item.priceAmount ?? 0
        ) ?? 0;
      const category = item.category || detectCategory(item, sourceCategory);
      const brand = item.brand || item.manufacturer || item.sellerName || "Top Brand";
      const externalId = item.asin || item.itemId || item.id || `${slugify(name, { lower: true })}-${index}`;
      const slug = slugify(name, { lower: true, strict: true, trim: true }).slice(0, 80) || `product-${uuidv4().slice(0, 8)}`;
      const description = item.description || item.condition || `${brand} ${name}`;
      const rating = parseFloat(item.stars || item.rating || 0) || 0;
      const imageUrl = resolveImageUrl(item);
      const url = item.url || item.productUrl || "";

      return {
        externalId,
        slug,
        name,
        title: name,
        brand,
        category,
        description,
        imageUrl,
        price,
        currency: item.price?.currency || item.listPrice?.currency || "USD",
        rating,
        sourceUrl: url,
        storeName: sourceStore,
        storeUrl: url,
        availability: item.inStock === false ? "out_of_stock" : "in_stock",
      };
    })
    .filter((p) => p.price > 0);
}

async function fetchDataset(url, token) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const fullUrl = `${url}?token=${token}&limit=250`;
    console.log(`  Fetching: ${url.split("/").pop()}`);
    const res = await fetch(fullUrl, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      console.error(`  Failed: ${res.status} for ${url}`);
      return [];
    }
    const data = await res.json();
    console.log(`  Got ${data.length} items`);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    clearTimeout(timeout);
    console.error(`  Error: ${err.message}`);
    return [];
  }
}

async function main() {
  console.log("🚀 Fetching real product data from Apify datasets...\n");

  if (!APIFY_TOKEN) {
    console.error("❌ APIFY_TOKEN not set!");
    process.exit(1);
  }

  let allProducts = [];

  for (const source of DATA_SOURCES) {
    console.log(`📦 [${source.store}] ${source.category}:`);
    const items = await fetchDataset(source.url, APIFY_TOKEN);
    const products = normalizeItems(items, source.category, source.store);
    console.log(`  Normalized: ${products.length} products\n`);
    allProducts.push(...products);
  }

  console.log(`\n📊 Total products to insert: ${allProducts.length}`);

  if (allProducts.length === 0) {
    console.log("❌ No products found. Exiting.");
    await prisma.$disconnect();
    return;
  }

  // Clear existing data
  console.log("\n🗑️  Clearing old products...");
  await prisma.productPrice.deleteMany();
  await prisma.product.deleteMany();
  console.log("✅ Old products cleared!");

  // Insert new products
  console.log("\n💾 Inserting new products...");
  let inserted = 0;
  let skipped = 0;

  for (const product of allProducts) {
    try {
      // Check if externalId already exists
      const existing = await prisma.product.findUnique({
        where: { externalId: product.externalId },
      });

      if (existing) {
        // Update existing product with new price
        await prisma.product.update({
          where: { externalId: product.externalId },
          data: {
            price: product.price,
            imageUrl: product.imageUrl || existing.imageUrl,
            sourceUrl: product.sourceUrl || existing.sourceUrl,
            metadata: {
              ...(existing.metadata || {}),
              lastUpdated: new Date().toISOString(),
            },
          },
        });

        // Also add a new price entry
        await prisma.productPrice.create({
          data: {
            productId: existing.id,
            storeName: product.storeName,
            storeUrl: product.storeUrl || product.sourceUrl,
            price: product.price,
            currency: product.currency,
            availability: product.availability,
          },
        });
        inserted++;
        continue;
      }

      // Check slug uniqueness
      let slug = product.slug;
      const slugExists = await prisma.product.findUnique({ where: { slug } });
      if (slugExists) {
        slug = `${product.slug}-${uuidv4().slice(0, 6)}`;
      }

      // Create product with price
      await prisma.product.create({
        data: {
          externalId: product.externalId,
          slug,
          name: product.name,
          title: product.title,
          brand: product.brand,
          category: product.category,
          description: product.description,
          imageUrl: product.imageUrl,
          price: product.price,
          currency: product.currency,
          rating: product.rating,
          sourceUrl: product.sourceUrl,
          metadata: {
            source: "apify-real-data",
            store: product.storeName,
            scrapedAt: new Date().toISOString(),
          },
          productPrices: {
            create: {
              storeName: product.storeName,
              storeUrl: product.storeUrl || product.sourceUrl,
              price: product.price,
              currency: product.currency,
              availability: product.availability,
            },
          },
        },
      });
      inserted++;
    } catch (err) {
      console.error(`  ❌ Failed: ${product.name?.slice(0, 50)}: ${err.message}`);
      skipped++;
    }

    // Progress every 10 products
    if (inserted % 10 === 0) {
      process.stdout.write(`  Progress: ${inserted}/${allProducts.length}\r`);
    }
  }

  console.log(`\n✅ Done! Inserted: ${inserted}, Skipped: ${skipped}`);

  // Verify
  const count = await prisma.product.count();
  console.log(`📊 Database now has ${count} products`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
