export const COMPARE_STORAGE_KEY = "smartprice-compare-list";
export const MAX_COMPARE_ITEMS = 4;
export const COMPARE_UPDATED_EVENT = "smartprice-compare-updated";

export function getDisplayRating(product) {
  if (typeof product?.rating === "number" && Number.isFinite(product.rating)) {
    return product.rating;
  }

  const retailerBoost = Math.min(3, Math.max(1, Number(product?.retailers || 1)));
  return Number((4.2 + (retailerBoost % 3) * 0.2).toFixed(1));
}

export function parsePrice(priceValue) {
  if (typeof priceValue === "number" && Number.isFinite(priceValue)) {
    return priceValue;
  }
  if (typeof priceValue === "string") {
    return parseFloat(priceValue.replace(/[^0-9.]/g, "")) || 0;
  }
  return 0;
}

export function enrichProductForCompare(product) {
  if (!product) return null;

  const rating = getDisplayRating(product);
  const price = parsePrice(product.price ?? product.bestPrice);

  return {
    ...product,
    title: product.title || product.name || "Untitled product",
    name: product.name || product.title || "Untitled product",
    rating,
    price,
    bestPrice: product.bestPrice || (price > 0 ? `$${price.toFixed(2)}` : "Price unavailable"),
    specs: {
      ...(product.specs && typeof product.specs === "object" ? product.specs : {}),
      Category: product.category || "General",
      "Retailer Count": `${product.retailers || 1} stores`,
      Source: product.source || "Live feed",
      Currency: product.currency || "USD",
    },
  };
}

export function getCompareList() {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(COMPARE_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(enrichProductForCompare).filter(Boolean).slice(0, MAX_COMPARE_ITEMS);
  } catch {
    return [];
  }
}

function notifyCompareUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(COMPARE_UPDATED_EVENT));
  }
}

export function setCompareList(products) {
  if (typeof window === "undefined") return [];

  const normalized = (Array.isArray(products) ? products : [])
    .map(enrichProductForCompare)
    .filter(Boolean)
    .slice(0, MAX_COMPARE_ITEMS);

  localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(normalized));
  notifyCompareUpdated();
  return normalized;
}

export function isInCompareList(productId) {
  return getCompareList().some((item) => item.id === productId);
}

export function addToCompareList(product) {
  const current = getCompareList();
  const enriched = enrichProductForCompare(product);
  if (!enriched) return { list: current, added: false, reason: "invalid" };

  if (current.some((item) => item.id === enriched.id)) {
    return { list: current, added: false, reason: "duplicate" };
  }

  if (current.length >= MAX_COMPARE_ITEMS) {
    const next = [...current.slice(1), enriched];
    setCompareList(next);
    return { list: next, added: true, reason: "replaced-oldest" };
  }

  const next = [...current, enriched];
  setCompareList(next);
  return { list: next, added: true, reason: "added" };
}

export function removeFromCompareList(productId) {
  const next = getCompareList().filter((item) => item.id !== productId);
  setCompareList(next);
  return next;
}

export function clearCompareList() {
  setCompareList([]);
  return [];
}

export function getUniqueSpecKeys(compareList) {
  const keys = new Set();
  compareList.forEach((product) => {
    if (product.specs && typeof product.specs === "object") {
      Object.keys(product.specs).forEach((key) => keys.add(key));
    }
  });
  return Array.from(keys);
}
