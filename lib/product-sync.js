import { prisma } from "./prisma";
import { v4 as uuidv4 } from "uuid";
import slugify from "slugify";

const CACHE_TTL = 600_000; // 10 min
let syncLock = false;
let lastSyncAt = 0;

/**
 * Pre-defined Apify dataset sources organized by category/store.
 * These are datasets from previous Apify crawls that contain product data.
 * Add more dataset URLs here to expand coverage.
 */
const DATA_SOURCES = {
  // Verified working datasets with real product data
  general: [
    process.env.APIFY_DATASET_URL,
  ],
  electronics: [
    "https://api.apify.com/v2/datasets/Y73kxAicap4JTXemH/items",
  ],
  // Add more data sources below when you have new dataset IDs:
  // fashion: [...],
  // home: [...],
  // sports: [...],
};



function parsePrice(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.\-]/g, "");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  if (typeof value === "object") {
    const nested =
      value.amount ??
      value.value ??
      value.price ??
      value.currentPrice ??
      value.offerPrice ??
      value.salePrice ??
      value.total;
    return parsePrice(nested);
  }
  return null;
}

function resolveImageUrl(item) {
  const highResImages = Array.isArray(item.highResolutionImages)
    ? item.highResolutionImages
    : [];
  const firstImage = highResImages.find(Boolean);
  if (typeof firstImage === "string") return firstImage;
  if (firstImage && typeof firstImage === "object")
    return firstImage.url || firstImage.src || firstImage.imageUrl || "";
  const images = Array.isArray(item.images) ? item.images : [];
  if (images.length > 0 && typeof images[0] === "string") return images[0];
  return item.imageUrl || item.image || item.thumbnail || "";
}

function detectCategory(item) {
  const cat =
    item.category ||
    item.productCategory ||
    (item.title || item.name || "").toLowerCase();
  if (
    cat.includes("electronic") ||
    cat.includes("computer") ||
    cat.includes("phone") ||
    cat.includes("laptop") ||
    cat.includes("camera") ||
    cat.includes("tv") ||
    cat.includes("headphone")
  )
    return "Electronics";
  if (
    cat.includes("game") ||
    cat.includes("console") ||
    cat.includes("gaming") ||
    cat.includes("wii") ||
    cat.includes("playstation")
  )
    return "Gaming Rig";
  if (
    cat.includes("cloth") ||
    cat.includes("fashion") ||
    cat.includes("shoe") ||
    cat.includes("apparel") ||
    cat.includes("wear")
  )
    return "Fashion";
  if (
    cat.includes("home") ||
    cat.includes("kitchen") ||
    cat.includes("furniture") ||
    cat.includes("decor") ||
    cat.includes("garden")
  )
    return "Home";
  if (
    cat.includes("sport") ||
    cat.includes("fitness") ||
    cat.includes("gym") ||
    cat.includes("outdoor")
  )
    return "Sports";
  return "General";
}

function generateSlug(name) {
  if (!name) return `product-${uuidv4().slice(0, 8)}`;
  return (
    slugify(name, { lower: true, strict: true, trim: true }).slice(0, 80) ||
    `product-${uuidv4().slice(0, 8)}`
  );
}

/**
 * Normalize an Apify item into a product object for DB storage.
 */
function normalizeProduct(item, index, sourceLabel) {
  const name =
    item.productName || item.name || item.title || `Product ${index}`;
  const price =
    parsePrice(
      item.price ??
        item.currentPrice ??
        item.offerPrice ??
        item.salePrice ??
        item.productPrice ??
        item.priceAmount ??
        item.priceValue ??
        item.minPrice ??
        item.maxPrice ??
        item.offers?.[0]?.price ??
        item.pricing?.price ??
        item.priceDetails?.amount
    ) ?? 0;
  const category =
    item.category ||
    item.productCategory ||
    detectCategory(item);
  const brand =
    item.brand || item.manufacturer || item.sellerName || "General Brand";
  const externalId =
    item.itemId ||
    item.productId ||
    item.id ||
    item.attributes?.key ||
    `${generateSlug(name)}-${index}`;

  return {
    externalId,
    name,
    title: name,
    brand,
    category,
    description:
      item.description || item.condition || "",
    imageUrl: resolveImageUrl(item),
    price,
    currency: item.currency || "USD",
    rating: parseFloat(item.rating || item.stars || 0) || 0,
    sourceUrl: item.url || item.productUrl || "",
    slug: generateSlug(name),
    metadata: {
      source: sourceLabel,
      retailers: item.retailers || item.availableStores || 1,
      store: item.store || item.source || sourceLabel,
      originalPrice: item.originalPrice || null,
      scrapedAt: new Date().toISOString(),
    },
  };
}

/**
 * Fetch items from a single Apify dataset URL.
 */
async function fetchDataset(url, token) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${url}?token=${token}&limit=250`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok)
      throw new Error(`Dataset fetch failed: ${res.status} for ${url}`);
    return await res.json();
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

/**
 * Fetch products from multiple Apify datasets across all categories
 * and return normalized product objects.
 */
async function fetchFromAllSources(token) {
  const allItems = [];
  const seen = new Set();

  for (const [category, urls] of Object.entries(DATA_SOURCES)) {
    const promises = urls
      .filter(Boolean)
      .map((url) =>
        fetchDataset(url, token).catch((err) => {
          console.error(`[${category}] Dataset error:`, err.message);
          return [];
        })
      );

    const results = await Promise.allSettled(promises);
    for (const result of results) {
      if (result.status === "fulfilled" && Array.isArray(result.value)) {
        for (const item of result.value) {
          const dedupKey = item.itemId || item.productId || item.id || item.title;
          if (dedupKey && seen.has(dedupKey)) continue;
          if (dedupKey) seen.add(dedupKey);
          allItems.push(normalizeProduct(item, allItems.length, category));
        }
      }
    }
  }

  return allItems;
}

/**
 * Persist products and their prices to the PostgreSQL database.
 * Uses UPSERT to avoid duplicates.
 */
async function persistProducts(products) {
  let inserted = 0;
  let updated = 0;

  for (const product of products) {
    // Skip products without a valid price
    if (!product.price || product.price <= 0) continue;

    // Use $transaction for batch operations
    try {
      await prisma.$transaction(async (tx) => {
        const existing = await tx.product.findUnique({
          where: { externalId: product.externalId },
        });

        if (existing) {
          await tx.product.update({
            where: { externalId: product.externalId },
            data: {
              price: product.price,
              brand: product.brand,
              category: product.category,
              imageUrl: product.imageUrl || existing.imageUrl,
              description: product.description || existing.description,
              rating: product.rating || existing.rating,
              metadata: product.metadata,
            },
          });
          updated++;
        } else {
          let slug = product.slug;
          const slugExists = await tx.product.findUnique({ where: { slug } });
          if (slugExists) {
            slug = `${product.slug}-${uuidv4().slice(0, 6)}`;
          }

          await tx.product.create({
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
              metadata: product.metadata,
              productPrices: {
                create: {
                  storeName: product.metadata?.store || "Online",
                  storeUrl: product.sourceUrl,
                  price: product.price,
                  currency: product.currency,
                  availability: "in_stock",
                },
              },
            },
          });
          inserted++;
        }
      });
    } catch (err) {
      console.error(`Failed to persist product "${product.name}":`, err.message);
    }
  }

  return { inserted, updated };
}

/**
 * Fallback seed products — used when Apify data sources fail or are not configured.
 * Covers all major categories with realistic product data.
 */
function getSeedProducts() {
  return [
    // === Electronics ===
    { name: 'MacBook Pro 14" M4', brand: "Apple", category: "Electronics", price: 1999, imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&q=80", rating: 4.8, retailers: 12 },
    { name: "MacBook Air M3 15-inch", brand: "Apple", category: "Electronics", price: 1299, imageUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&q=80", rating: 4.7, retailers: 10 },
    { name: "Dell XPS 16 Intel Ultra 9", brand: "Dell", category: "Electronics", price: 1799, imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&q=80", rating: 4.5, retailers: 8 },
    { name: "Samsung Galaxy S25 Ultra", brand: "Samsung", category: "Electronics", price: 1299, imageUrl: "https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=400&q=80", rating: 4.6, retailers: 15 },
    { name: "Google Pixel 9 Pro", brand: "Google", category: "Electronics", price: 999, imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80", rating: 4.4, retailers: 9 },
    { name: "iPhone 16 Pro Max", brand: "Apple", category: "Electronics", price: 1199, imageUrl: "https://images.unsplash.com/photo-1742157582485-6c07a8c66b9f?w=400&q=80", rating: 4.9, retailers: 20 },
    { name: "Samsung Galaxy Book 4 Ultra", brand: "Samsung", category: "Electronics", price: 2199, imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80", rating: 4.3, retailers: 6 },
    { name: "LG C4 OLED 65-inch TV", brand: "LG", category: "Electronics", price: 1499, imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&q=80", rating: 4.7, retailers: 10 },
    { name: "Samsung QN90D 75-inch", brand: "Samsung", category: "Electronics", price: 2299, imageUrl: "https://images.unsplash.com/photo-1461151304267-38535e780c79?w=400&q=80", rating: 4.5, retailers: 8 },
    { name: "Canon EOS R6 Mark III", brand: "Canon", category: "Electronics", price: 2499, imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80", rating: 4.8, retailers: 7 },
    { name: "Sony A7 IV Mirrorless", brand: "Sony", category: "Electronics", price: 2399, imageUrl: "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=400&q=80", rating: 4.6, retailers: 9 },
    { name: "DJI Mavic Air 3 Drone", brand: "DJI", category: "Electronics", price: 1099, imageUrl: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400&q=80", rating: 4.7, retailers: 5 },

    // === Gaming Rig ===
    { name: "PlayStation 5 Pro", brand: "Sony", category: "Gaming Rig", price: 699, imageUrl: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&q=80", rating: 4.8, retailers: 15 },
    { name: "Xbox Series X 2TB", brand: "Microsoft", category: "Gaming Rig", price: 599, imageUrl: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400&q=80", rating: 4.6, retailers: 12 },
    { name: "Nintendo Switch 2", brand: "Nintendo", category: "Gaming Rig", price: 449, imageUrl: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&q=80", rating: 4.7, retailers: 18 },
    { name: "Steam Deck OLED", brand: "Valve", category: "Gaming Rig", price: 549, imageUrl: "https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=400&q=80", rating: 4.5, retailers: 8 },
    { name: "ASUS ROG Ally X", brand: "ASUS", category: "Gaming Rig", price: 799, imageUrl: "https://images.unsplash.com/photo-1612282131028-2b4f78313bcc?w=400&q=80", rating: 4.3, retailers: 6 },
    { name: "NVIDIA RTX 5090", brand: "NVIDIA", category: "Gaming Rig", price: 1999, imageUrl: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80", rating: 4.9, retailers: 4 },
    { name: "AMD Ryzen 9 9950X", brand: "AMD", category: "Gaming Rig", price: 699, imageUrl: "https://images.unsplash.com/photo-1555617778-6e395b4ec7b3?w=400&q=80", rating: 4.6, retailers: 5 },
    { name: "Corsair Vengeance Gaming PC", brand: "Corsair", category: "Gaming Rig", price: 2499, imageUrl: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=400&q=80", rating: 4.4, retailers: 3 },

    // === Headphones & Audio ===
    { name: "Sony WH-1000XM6", brand: "Sony", category: "Headphones & Audio", price: 399, imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80", rating: 4.8, retailers: 20 },
    { name: "AirPods Pro 3", brand: "Apple", category: "Headphones & Audio", price: 249, imageUrl: "https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=400&q=80", rating: 4.7, retailers: 22 },
    { name: "Bose QuietComfort Ultra", brand: "Bose", category: "Headphones & Audio", price: 429, imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80", rating: 4.6, retailers: 14 },
    { name: "Sennheiser Momentum 4", brand: "Sennheiser", category: "Headphones & Audio", price: 349, imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80", rating: 4.5, retailers: 10 },
    { name: "Sonos Era 300 Speaker", brand: "Sonos", category: "Headphones & Audio", price: 449, imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400&q=80", rating: 4.4, retailers: 8 },
    { name: "JBL Charge 6", brand: "JBL", category: "Headphones & Audio", price: 179, imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&q=80", rating: 4.5, retailers: 16 },
    { name: "Bose Soundbar Ultra", brand: "Bose", category: "Headphones & Audio", price: 899, imageUrl: "https://images.unsplash.com/photo-1548056393-f5a1d62a3c82?w=400&q=80", rating: 4.6, retailers: 9 },

    // === Laptops & Computers ===
    { name: "ThinkPad X1 Carbon Gen 13", brand: "Lenovo", category: "Laptops & Computers", price: 1649, imageUrl: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&q=80", rating: 4.5, retailers: 8 },
    { name: "Surface Laptop 7", brand: "Microsoft", category: "Laptops & Computers", price: 1299, imageUrl: "https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=400&q=80", rating: 4.4, retailers: 7 },
    { name: "HP Spectre x360 16", brand: "HP", category: "Laptops & Computers", price: 1499, imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80", rating: 4.3, retailers: 6 },
    { name: 'iMac 27" M4', brand: "Apple", category: "Laptops & Computers", price: 1799, imageUrl: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80", rating: 4.7, retailers: 9 },
    { name: "Mac Mini M4 Pro", brand: "Apple", category: "Laptops & Computers", price: 1399, imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&q=80", rating: 4.6, retailers: 8 },

    // === Fashion ===
    { name: "Rolex Submariner Date", brand: "Rolex", category: "Fashion", price: 8250, imageUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80", rating: 4.9, retailers: 3 },
    { name: "Apple Watch Ultra 3", brand: "Apple", category: "Fashion", price: 799, imageUrl: "https://images.unsplash.com/photo-1546868871-af0de0ae72f7?w=400&q=80", rating: 4.6, retailers: 15 },
    { name: "Ray-Ban Meta Wayfarer", brand: "Ray-Ban", category: "Fashion", price: 299, imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&q=80", rating: 4.3, retailers: 12 },

    // === Home ===
    { name: "Dyson V15 Detect Vacuum", brand: "Dyson", category: "Home", price: 749, imageUrl: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&q=80", rating: 4.7, retailers: 14 },
    { name: "Dyson Air Purifier Hot+Cool", brand: "Dyson", category: "Home", price: 569, imageUrl: "https://images.unsplash.com/photo-1632055640385-1e5d0e524e84?w=400&q=80", rating: 4.4, retailers: 10 },
    { name: "iRobot Roomba j9+", brand: "iRobot", category: "Home", price: 899, imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&q=80", rating: 4.3, retailers: 8 },
    { name: "KitchenAid Stand Mixer", brand: "KitchenAid", category: "Home", price: 499, imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80", rating: 4.8, retailers: 12 },
    { name: "Philips Hue Starter Kit", brand: "Philips", category: "Home", price: 199, imageUrl: "https://images.unsplash.com/photo-1550985549-1e5c5a6bd9d0?w=400&q=80", rating: 4.5, retailers: 9 },
    { name: "Vitamix A3500 Blender", brand: "Vitamix", category: "Home", price: 649, imageUrl: "https://images.unsplash.com/photo-1570222094111-d3f048a2cf09?w=400&q=80", rating: 4.7, retailers: 7 },

    // === Sports ===
    { name: "Peloton Bike+", brand: "Peloton", category: "Sports", price: 2495, imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80", rating: 4.5, retailers: 5 },
    { name: "Apple Watch Series 10", brand: "Apple", category: "Sports", price: 399, imageUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&q=80", rating: 4.8, retailers: 20 },
    { name: "Garmin Fenix 8", brand: "Garmin", category: "Sports", price: 999, imageUrl: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=400&q=80", rating: 4.6, retailers: 8 },
    { name: "Theragun Pro 6", brand: "Therabody", category: "Sports", price: 599, imageUrl: "https://images.unsplash.com/photo-1600881333168-2ef49b2a971a?w=400&q=80", rating: 4.4, retailers: 6 },

    // === Monitors & Displays ===
    { name: "Samsung Odyssey OLED G8", brand: "Samsung", category: "Monitors & Displays", price: 1399, imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80", rating: 4.6, retailers: 7 },
    { name: 'Dell UltraSharp 32" 6K', brand: "Dell", category: "Monitors & Displays", price: 3199, imageUrl: "https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=400&q=80", rating: 4.5, retailers: 5 },
    { name: 'LG UltraGear 27" OLED', brand: "LG", category: "Monitors & Displays", price: 999, imageUrl: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=400&q=80", rating: 4.7, retailers: 8 },
    { name: "Apple Pro Display XDR 2", brand: "Apple", category: "Monitors & Displays", price: 4999, imageUrl: "https://images.unsplash.com/photo-1575147514634-f9471e1b88c0?w=400&q=80", rating: 4.8, retailers: 4 },
  ];
}

/**
 * Seed the database with fallback product data.
 * Used when Apify data sources fail or are not configured.
 */
async function seedDatabase() {
  const seedProducts = getSeedProducts();
  let inserted = 0;

  for (const product of seedProducts) {
    const externalId = `seed-${product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const slug = `seed-${product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

    try {
      const exists = await prisma.product.findUnique({
        where: { externalId },
      });
      if (exists) {
        // Just update price
        await prisma.product.update({
          where: { externalId },
          data: { price: product.price },
        });
        continue;
      }

      await prisma.product.create({
        data: {
          externalId,
          slug,
          name: product.name,
          title: product.name,
          brand: product.brand,
          category: product.category,
          description: `${product.brand} ${product.name} — premium quality product available at competitive prices. Compare prices across multiple retailers and save.`,
          imageUrl: product.imageUrl,
          price: product.price,
          currency: "USD",
          rating: product.rating,
          metadata: {
            source: "seed-data",
            retailers: product.retailers,
            store: "Online",
            scrapedAt: new Date().toISOString(),
          },
          productPrices: {
            create: [
              { storeName: "Amazon", price: product.price, currency: "USD", storeUrl: "https://amazon.com" },
              { storeName: "Best Buy", price: product.price + Math.round(product.price * 0.05), currency: "USD", storeUrl: "https://bestbuy.com" },
              { storeName: "Walmart", price: product.price - Math.round(product.price * 0.02), currency: "USD", storeUrl: "https://walmart.com" },
            ],
          },
        },
      });
      inserted++;
    } catch (err) {
      console.error(`[Seed] Failed to create "${product.name}":`, err.message);
    }
  }

  return inserted;
}

/**
 * Main sync function: fetch from all sources and persist to database.
 * Falls back to seed data when Apify is not configured or returns empty.
 * Has a built-in lock to prevent concurrent syncs.
 * Returns sync stats.
 */
export async function syncProducts() {
  if (syncLock) {
    return { status: "in_progress", message: "Sync already in progress" };
  }

  const token = process.env.APIFY_TOKEN;

  syncLock = true;
  const startTime = Date.now();

  try {
    let products = [];
    let source = "";

    if (!token) {
      console.log("[ProductSync] No APIFY_TOKEN — using seed data");
      source = "seed";
    } else {
      console.log("[ProductSync] Fetching from all data sources...");
      products = await fetchFromAllSources(token);
      console.log(`[ProductSync] Fetched ${products.length} products from Apify`);
      source = "apify";
    }

    // If Apify returned nothing, fall back to seed data
    if (source === "seed" || products.length === 0) {
      console.log("[ProductSync] Using fallback seed data");
      const seeded = await seedDatabase();
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      lastSyncAt = Date.now();
      dbSeeded = true;

      return {
        status: "success",
        source: "seed",
        stats: {
          inserted: seeded,
          updated: 0,
          total: seeded,
          elapsed: `${elapsed}s`,
        },
      };
    }

    console.log("[ProductSync] Persisting Apify data to database...");
    const stats = await persistProducts(products);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    lastSyncAt = Date.now();
    dbSeeded = true;

    return {
      status: "success",
      source: "apify",
      stats: {
        ...stats,
        total: products.length,
        elapsed: `${elapsed}s`,
      },
    };
  } catch (err) {
    console.error("[ProductSync] Sync failed:", err);

    // Last resort: try seed data on error
    try {
      const seeded = await seedDatabase();
      if (seeded > 0) {
        lastSyncAt = Date.now();
        dbSeeded = true;
        return {
          status: "success",
          source: "seed-fallback",
          stats: { inserted: seeded, updated: 0, total: seeded, elapsed: "0s" },
        };
      }
    } catch {}

    return { status: "error", message: err.message };
  } finally {
    syncLock = false;
  }
}

/**
 * Get products from the database with optional filtering.
 */
export async function getProductsFromDb({ query, category, limit = 50, offset = 0 } = {}) {
  const where = {};

  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { title: { contains: query, mode: "insensitive" } },
      { brand: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }

  if (category && category !== "all") {
    where.category = { contains: category, mode: "insensitive" };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        productPrices: {
          orderBy: { price: "asc" },
          take: 5,
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total };
}

// Server-scoped flag so we only check the DB once per server instance
let dbSeeded = false;

/**
 * Get sync status information for the dashboard.
 */
export async function getSyncStatus() {
  try {
    const [productCount, categoryCount, storeCount, priceCount] = await Promise.all([
      prisma.product.count(),
      prisma.product.groupBy({ by: ["category"], _count: true }),
      prisma.productPrice.groupBy({ by: ["storeName"], _count: true }),
      prisma.productPrice.count(),
    ]);

    const categories = Object.fromEntries(
      Object.entries(DATA_SOURCES).map(([key, urls]) => [
        key,
        { urls: urls.filter(Boolean).length, active: true },
      ])
    );

    // Get a few sample products for preview
    const samples = await prisma.product.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      select: {
        name: true,
        category: true,
        brand: true,
        price: true,
        updatedAt: true,
      },
    });

    return {
      productCount,
      categoryCount: categoryCount.length,
      categories: categoryCount.map((c) => ({
        name: c.category || "Uncategorized",
        count: c._count,
      })),
      storeCount: storeCount.length,
      priceEntries: priceCount,
      dataSources: categories,
      lastSyncAt: lastSyncAt > 0 ? new Date(lastSyncAt).toISOString() : null,
      dbSeeded,
      samples,
    };
  } catch (err) {
    console.error("[ProductSync] getSyncStatus error:", err);
    return {
      productCount: 0,
      categoryCount: 0,
      categories: [],
      storeCount: 0,
      priceEntries: 0,
      dataSources: {},
      lastSyncAt: lastSyncAt > 0 ? new Date(lastSyncAt).toISOString() : null,
      dbSeeded,
      error: err.message,
    };
  }
}

const MIN_PRODUCT_THRESHOLD = 20;

/**
 * Auto-sync if database has too few products.
 * Only checks the database once per server instance (optimistic flag).
 * Triggers seed data sync if product count is below MIN_PRODUCT_THRESHOLD.
 */
export async function ensureProducts() {
  if (dbSeeded) {
    return { status: "cached", message: "Already verified" };
  }

  const count = await prisma.product.count();
  if (count < MIN_PRODUCT_THRESHOLD) {
    console.log(`[ProductSync] Only ${count} products in DB — triggering sync...`);
    const result = await syncProducts();
    if (result.status === "success") {
      dbSeeded = true;
    }
    return result;
  }

  dbSeeded = true;
  return { status: "cached", message: `Database already has ${count} products` };
}
