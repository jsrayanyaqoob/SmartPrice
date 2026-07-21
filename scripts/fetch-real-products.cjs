/**
 * Fetch real product data from working Apify datasets
 * and insert directly into the Neon database.
 * CommonJS version for compatibility.
 */
const { PrismaClient } = require("@prisma/client");
const slugify = require("slugify");
const { v4: uuidv4 } = require("uuid");

const prisma = new PrismaClient();

const APIFY_TOKEN = process.env.APIFY_TOKEN;
const FETCH_LIMIT = 50; // Keep it manageable

const DATA_SOURCES = [
  { url: "https://api.apify.com/v2/datasets/z9jxKdnqXt2kaEPzI/items", category: "General", store: "Amazon" },
  { url: "https://api.apify.com/v2/datasets/Y73kxAicap4JTXemH/items", category: "Electronics", store: "eBay" },
];

function parsePrice(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.\-]/g, "");
    return Number.isFinite(Number(cleaned)) ? Number(cleaned) : null;
  }
  if (typeof value === "object") {
    return parsePrice(value.amount ?? value.value ?? value.price ?? value.currentPrice ?? null);
  }
  return null;
}

function resolveImageUrl(item) {
  return item.imageUrl || item.image || item.thumbnail || item.thumbnailImage
    || (Array.isArray(item.images) && item.images[0])
    || (Array.isArray(item.highResolutionImages) && item.highResolutionImages[0])
    || "";
}

function detectCategory(item, defaultCategory) {
  const bc = (item.breadCrumbs || item.category || "").toLowerCase();
  if (bc.includes("electronic") || bc.includes("computer") || bc.includes("phone") || bc.includes("camera") || bc.includes("tv")) return "Electronics";
  if (bc.includes("cloth") || bc.includes("fashion") || bc.includes("shoe") || bc.includes("wear")) return "Fashion";
  if (bc.includes("home") || bc.includes("kitchen") || bc.includes("garden") || bc.includes("furniture")) return "Home";
  if (bc.includes("sport") || bc.includes("fitness") || bc.includes("gym")) return "Sports";
  if (bc.includes("game") || bc.includes("console") || bc.includes("toy")) return "Gaming Rig";
  return defaultCategory;
}

function normalizeItems(items, sourceCategory, sourceStore) {
  return items
    .filter((item) => item.title || item.productName || item.name)
    .map((item, index) => {
      const name = item.title || item.productName || item.name || `Product ${index}`;
      const priceVal = parsePrice(item.price ?? item.listPrice ?? item.currentPrice ?? item.priceAmount ?? 0) ?? 0;
      const category = item.category || detectCategory(item, sourceCategory);
      const brand = item.brand || item.manufacturer || item.sellerName || "Top Brand";
      const externalId = item.asin || item.itemId || item.id || `prod-${index}-${Date.now()}`;
      const slug = slugify(name, { lower: true, strict: true, trim: true }).slice(0, 80) || `product-${uuidv4().slice(0, 8)}`;
      const imageUrl = resolveImageUrl(item);
      const url = item.url || item.productUrl || "";

      return {
        externalId: String(externalId),
        slug,
        name: name.slice(0, 200),
        title: name.slice(0, 200),
        brand: brand.slice(0, 100),
        category,
        description: (item.description || item.condition || `${brand} ${name}`).slice(0, 500),
        imageUrl: typeof imageUrl === "string" ? imageUrl : "",
        price: priceVal,
        currency: item.price?.currency || item.listPrice?.currency || "USD",
        rating: parseFloat(item.stars || item.rating || 0) || 0,
        sourceUrl: typeof url === "string" ? url : "",
        storeName: sourceStore,
        storeUrl: typeof url === "string" ? url : "",
        availability: item.inStock === false ? "out_of_stock" : "in_stock",
      };
    })
    .filter((p) => p.price > 0 && p.name && p.name !== "Product");
}

async function fetchDataset(url, token) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const fullUrl = `${url}?token=${token}&limit=${FETCH_LIMIT}`;
    console.log(`  Fetching: ${url.split("/datasets/")[1]?.split("/")[0] || url}`);
    const res = await fetch(fullUrl, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      console.error(`  Failed: ${res.status}`);
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
  console.log("🚀 Fetching REAL product data from Apify...\n");
  console.log(`Using token: ${APIFY_TOKEN ? APIFY_TOKEN.slice(0, 15) + "..." : "NOT SET"}`);
  console.log(`Database: ${(process.env.DATABASE_URL || "").slice(0, 30)}...\n`);

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
  console.log("🗑️  Clearing old products...");
  try {
    await prisma.productPrice.deleteMany({});
    await prisma.product.deleteMany({});
    console.log("✅ Old products cleared!");
  } catch (err) {
    console.log("Note: Could not clear (might be empty already):", err.message);
  }

  // Insert new products
  console.log("\n💾 Inserting new products...");
  let inserted = 0;
  let errors = 0;

  for (const product of allProducts) {
    try {
      const existing = await prisma.product.findUnique({ where: { externalId: product.externalId } });

      if (existing) {
        await prisma.product.update({
          where: { externalId: product.externalId },
          data: { price: product.price, imageUrl: product.imageUrl || existing.imageUrl },
        });
        await prisma.productPrice.create({
          data: {
            productId: existing.id,
            storeName: product.storeName,
            storeUrl: product.storeUrl,
            price: product.price,
            currency: product.currency,
            availability: product.availability,
          },
        });
        inserted++;
        continue;
      }

      let slug = product.slug;
      const slugExists = await prisma.product.findUnique({ where: { slug } });
      if (slugExists) slug = `${product.slug}-${uuidv4().slice(0, 6)}`;

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
          metadata: { source: "apify-real-data", store: product.storeName, scrapedAt: new Date().toISOString() },
          productPrices: {
            create: {
              storeName: product.storeName,
              storeUrl: product.storeUrl,
              price: product.price,
              currency: product.currency,
              availability: product.availability,
            },
          },
        },
      });
      inserted++;
    } catch (err) {
      console.error(`  ❌ Failed: ${(product.name || "").slice(0, 40)}: ${err.message.slice(0, 60)}`);
      errors++;
    }

    if (inserted % 10 === 0) process.stdout.write(`  Progress: ${inserted}/${allProducts.length}\r`);
  }

  console.log(`\n✅ Done! Inserted: ${inserted}, Errors: ${errors}`);

  const count = await prisma.product.count();
  console.log(`📊 Database now has ${count} products`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
