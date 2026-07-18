"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Star,
  Store,
  Tag,
  ChevronLeft,
  ChevronRight,
  Scale,
  Search,
  SlidersHorizontal,
  Zap,
  TrendingUp,
  Package,
  ArrowUpDown,
  X,
} from "lucide-react";
import { SkeletonProductCard } from "@/components/ui/Skeleton";
import { useCompareList } from "@/hooks/useCompareList";
import { MAX_COMPARE_ITEMS } from "@/lib/compare";

/* -------------------------------------------------------------------------- */
/*  Category sections                                                         */
/* -------------------------------------------------------------------------- */

const CATEGORY_SECTIONS = [
  // ── Featured ──
  {
    id: "trending",
    name: "Trending Deals",
    match: () => true,
    sort: (items) => [...items].sort((a, b) => getDisplayRating(b) - getDisplayRating(a)),
    limit: 16,
    featured: true,
  },

  // ── Category-based sections (matched on product.category first) ──
  {
    id: "electronics",
    name: "Electronics",
    categories: ["Electronics"],
    matchFallback: (p) => {
      const txt = `${p.category || ""} ${p.title || ""} ${p.brand || ""}`.toLowerCase();
      return /electronic|computer|phone|camera|tv|tablet|drone/.test(txt);
    },
  },
  {
    id: "gaming",
    name: "Gaming & Consoles",
    categories: ["Gaming Rig"],
    matchFallback: (p) => {
      const txt = `${p.title || ""} ${p.brand || ""}`.toLowerCase();
      return /game|console|xbox|playstation|ps5|ps4|nintendo|wii|switch|controller|steam deck/.test(txt);
    },
  },
  {
    id: "laptops",
    name: "Laptops & Computers",
    categories: ["Laptops & Computers"],
    matchFallback: (p) => {
      const txt = `${p.title || ""} ${p.brand || ""}`.toLowerCase();
      return /laptop|macbook|chromebook|notebook|computer|pc|desktop|imac|mac mini|thinkpad|surface/.test(txt);
    },
  },
  {
    id: "monitors",
    name: "Monitors & Displays",
    categories: ["Monitors & Displays"],
    matchFallback: (p) => {
      const txt = `${p.title || ""}`.toLowerCase();
      return /monitor|display|screen|oled|4k tv|television|projector/.test(txt);
    },
  },
  {
    id: "audio",
    name: "Headphones & Audio",
    categories: ["Headphones & Audio"],
    matchFallback: (p) => {
      const txt = `${p.title || ""} ${p.brand || ""}`.toLowerCase();
      return /headphone|earbud|airpod|speaker|audio|soundbar|microphone|headset|beats|sony wh|bose/.test(txt);
    },
  },
  {
    id: "mobile",
    name: "Phones & Tablets",
    categories: ["Phones & Tablets"],
    matchFallback: (p) => {
      const txt = `${p.title || ""} ${p.brand || ""}`.toLowerCase();
      return /phone|iphone|android|samsung galaxy|pixel|tablet|ipad|smartwatch|watch|kindle/.test(txt);
    },
  },
  {
    id: "keyboards",
    name: "Keyboards",
    matchFallback: (p) => {
      const txt = `${p.title || ""} ${p.category || ""}`.toLowerCase();
      return /keyboard|mechanical key/.test(txt);
    },
  },
  {
    id: "mouse",
    name: "Mouse & Input",
    matchFallback: (p) => {
      const txt = `${p.title || ""} ${p.category || ""}`.toLowerCase();
      return /mouse|trackpad|trackball/.test(txt);
    },
  },
  {
    id: "storage",
    name: "Storage & Components",
    matchFallback: (p) => {
      const txt = `${p.title || ""} ${p.category || ""}`.toLowerCase();
      return /ssd|hard drive|hdd|nvme|ram|memory|graphics card|gpu|cpu|processor|motherboard|storage/.test(txt);
    },
  },
  {
    id: "fashion",
    name: "Fashion & Wearables",
    categories: ["Fashion"],
    matchFallback: (p) => {
      const txt = `${p.title || ""} ${p.category || ""} ${p.brand || ""}`.toLowerCase();
      return /fashion|cloth|shoe|apparel|wearable|watch|rolex|ray-ban/.test(txt);
    },
  },
  {
    id: "home",
    name: "Home & Kitchen",
    categories: ["Home"],
    matchFallback: (p) => {
      const txt = `${p.title || ""} ${p.category || ""}`.toLowerCase();
      return /home|kitchen|furniture|vacuum|roomba|dyson|blender|purifier/.test(txt);
    },
  },
  {
    id: "sports",
    name: "Sports & Fitness",
    categories: ["Sports"],
    matchFallback: (p) => {
      const txt = `${p.title || ""} ${p.category || ""}`.toLowerCase();
      return /sport|fitness|gym|peloton|garmin|theragun|outdoor/.test(txt);
    },
  },
  {
    id: "office",
    name: "Office & Productivity",
    matchFallback: (p) => {
      const txt = `${p.title || ""} ${p.category || ""}`.toLowerCase();
      return /office|desk|chair|lamp|router|wifi|smart home|camera|security|printer|scanner/.test(txt);
    },
  },

  // ── Budget section ──
  {
    id: "budget",
    name: "Best Value Deals",
    match: (p) => Number(p.price) > 0 && Number(p.price) <= 150,
    sort: (items) => [...items].sort((a, b) => Number(a.price) - Number(b.price)),
  },

  // ── Catch-all ──
  {
    id: "other",
    name: "Other Electronics",
    match: () => true,
  },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function getDisplayRating(product) {
  if (typeof product?.rating === "number" && Number.isFinite(product.rating)) {
    return product.rating;
  }
  const retailerBoost = Math.min(3, Math.max(1, Number(product?.retailers || 1)));
  return Number((4.2 + (retailerBoost % 3) * 0.2).toFixed(1));
}

function renderStars(rating) {
  const stars = [];
  const rounded = Math.round(rating);
  for (let i = 0; i < 5; i += 1) {
    stars.push(
      <Star
        key={i}
        size={13}
        fill={i < rounded ? "currentColor" : "none"}
        stroke="currentColor"
      />
    );
  }
  return stars;
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

const CARD_WIDTH = 260;
const CARD_GAP = 16;
const CARD_STEP = CARD_WIDTH + CARD_GAP;
const VISIBLE_CARDS = 4;

const filterChipStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "4px 10px",
  borderRadius: 999,
  background: "rgba(99, 102, 241, 0.08)",
  color: "var(--primary, #6366f1)",
  fontSize: 12,
  fontWeight: 600,
};

/* -------------------------------------------------------------------------- */
/*  Carousel Row                                                              */
/* -------------------------------------------------------------------------- */

function ProductCarouselRow({ cat, items, scrollIndex, onScroll, renderProductCard }) {
  const maxScroll = Math.max(0, items.length - VISIBLE_CARDS);
  const canScrollLeft = scrollIndex > 0;
  const canScrollRight = scrollIndex < maxScroll;

  return (
    <div
      className="card products-category-row"
      style={{
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        minWidth: 0,
        overflow: "hidden",
        borderRadius: 16,
        border: cat.featured
          ? "1.5px solid rgba(99, 102, 241, 0.15)"
          : "1px solid var(--border, #e5e7eb)",
        background: cat.featured
          ? "linear-gradient(135deg, rgba(255,255,255,1), rgba(245,243,255,1))"
          : "var(--card-bg, #ffffff)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <h3
          className="heading-3"
          style={{
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 17,
            fontWeight: 700,
          }}
        >
          <span>{cat.icon}</span> {cat.name}
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "var(--text-muted, #9ca3af)",
              background: "var(--bg-subtle, #f3f4f6)",
              padding: "2px 10px",
              borderRadius: 999,
            }}
          >
            {items.length} items
          </span>
        </h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => onScroll("left")}
            disabled={!canScrollLeft}
            className="btn btn-ghost btn-sm"
            style={{
              width: 36,
              height: 36,
              padding: 0,
              borderRadius: "50%",
              border: "1px solid var(--border, #e5e7eb)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: canScrollLeft ? 1 : 0.4,
              cursor: canScrollLeft ? "pointer" : "default",
              transition: "all 0.2s ease",
              background: "var(--card-bg, #ffffff)",
            }}
            aria-label={`Scroll ${cat.name} left`}
            onMouseEnter={(e) => {
              if (canScrollLeft) e.currentTarget.style.background = "var(--bg-subtle, #f3f4f6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--card-bg, #ffffff)";
            }}
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => onScroll("right")}
            disabled={!canScrollRight}
            className="btn btn-ghost btn-sm"
            style={{
              width: 36,
              height: 36,
              padding: 0,
              borderRadius: "50%",
              border: "1px solid var(--border, #e5e7eb)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: canScrollRight ? 1 : 0.4,
              cursor: canScrollRight ? "pointer" : "default",
              transition: "all 0.2s ease",
              background: "var(--card-bg, #ffffff)",
            }}
            aria-label={`Scroll ${cat.name} right`}
            onMouseEnter={(e) => {
              if (canScrollRight) e.currentTarget.style.background = "var(--bg-subtle, #f3f4f6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--card-bg, #ffffff)";
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="products-carousel-viewport" style={{ overflow: "hidden" }}>
        <div
          className="products-carousel-track"
          style={{
            display: "flex",
            gap: CARD_GAP,
            transform: `translateX(-${scrollIndex * CARD_STEP}px)`,
            transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {items.map((product) => (
            <div key={product.id} className="products-carousel-slide" style={{ flexShrink: 0 }}>
              {renderProductCard(product, true)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Page                                                                 */
/* -------------------------------------------------------------------------- */

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(50);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [compareMessage, setCompareMessage] = useState("");
  const { compareList, addProduct } = useCompareList();
  const [scrollIndexes, setScrollIndexes] = useState({});
  const [sortBy, setSortBy] = useState("default");
  const [priceFilter, setPriceFilter] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  /* ── Sort / Filter functions ── */
  const applySort = useCallback((items) => {
    const sorted = [...items];
    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => (Number(a.price) || Infinity) - (Number(b.price) || Infinity));
        break;
      case "price-desc":
        sorted.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        break;
      case "rating":
        sorted.sort((a, b) => getDisplayRating(b) - getDisplayRating(a));
        break;
      case "stores":
        sorted.sort((a, b) => (Number(b.retailers) || 0) - (Number(a.retailers) || 0));
        break;
      default:
        break;
    }
    return sorted;
  }, [sortBy]);

  const applyFilters = useCallback((items) => {
    let filtered = items;
    if (priceFilter === "under50") {
      filtered = filtered.filter((p) => Number(p.price) > 0 && Number(p.price) <= 50);
    } else if (priceFilter === "50-200") {
      filtered = filtered.filter((p) => Number(p.price) > 50 && Number(p.price) <= 200);
    } else if (priceFilter === "200-500") {
      filtered = filtered.filter((p) => Number(p.price) > 200 && Number(p.price) <= 500);
    } else if (priceFilter === "over500") {
      filtered = filtered.filter((p) => Number(p.price) > 500);
    }
    if (minRating > 0) {
      filtered = filtered.filter((p) => getDisplayRating(p) >= minRating);
    }
    return filtered;
  }, [priceFilter, minRating]);

  const hasActiveFilters = sortBy !== "default" || priceFilter !== "all" || minRating > 0;

  const clearFilters = useCallback(() => {
    setSortBy("default");
    setPriceFilter("all");
    setMinRating(0);
  }, []);

  /* ── Fetch products ── */
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products?q=${encodeURIComponent(search)}`);
        const data = await res.json();
        if (active) {
          setProducts(data.products || []);
          setTotalCount(data.total || 0);
          setVisibleCount(50);
          setShowLoadMore(false);
          setScrollIndexes({});
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setProducts([]);
          setTotalCount(0);
        }
      } finally {
        if (active) setLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search]);

  /* ── Scroll detection for load more ── */
  useEffect(() => {
    if (!search) {
      setShowLoadMore(false);
      return;
    }
    const handleScroll = () => {
      if (visibleCount >= products.length) {
        setShowLoadMore(false);
        return;
      }
      const threshold = 150;
      const position = window.innerHeight + window.scrollY;
      const height = document.documentElement.scrollHeight;
      if (height - position <= threshold) {
        setShowLoadMore(true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [products, visibleCount, search]);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + 50);
    setShowLoadMore(false);
  }, []);

  /* ── Compare helpers ── */
  const handleAddToCompare = useCallback(
    (product) => {
      const result = addProduct(product);
      if (!result.added && result.reason === "duplicate") {
        setCompareMessage(`${product.title} is already in compare.`);
      } else if (result.added && result.reason === "replaced-oldest") {
        setCompareMessage(`Compare tray is full. Replaced oldest item with ${product.title}.`);
      } else if (result.added) {
        setCompareMessage(`Added ${product.title} to compare.`);
      }
      window.setTimeout(() => setCompareMessage(""), 2600);
    },
    [addProduct]
  );

  const isProductInCompare = useCallback(
    (productId) => compareList.some((item) => item.id === productId),
    [compareList]
  );

  /* ── Category scroll handlers ── */
  const handleCategoryScroll = useCallback((catId, direction, itemCount) => {
    setScrollIndexes((prev) => {
      const current = prev[catId] || 0;
      const maxScroll = Math.max(0, itemCount - VISIBLE_CARDS);
      const next =
        direction === "left"
          ? Math.max(0, current - 1)
          : Math.min(maxScroll, current + 1);
      return { ...prev, [catId]: next };
    });
  }, []);

  /* ── Build category groups ── */
  const groupedCategories = useMemo(() => {
    const assigned = new Set();
    const groups = [];

    for (const section of CATEGORY_SECTIONS) {
      let items;

      if (section.featured && section.id === "trending") {
        // Trending: take top-rated items
        items = [...products]
          .sort((a, b) => getDisplayRating(b) - getDisplayRating(a))
          .slice(0, section.limit);

        // ✅ FIX: add trending items to assigned set so they don't duplicate
        items.forEach((p) => assigned.add(p.id));
      } else if (section.id === "budget") {
        // Budget section
        items = products.filter((p) => {
          if (assigned.has(p.id)) return false;
          return p.price > 0 && Number(p.price) <= 150;
        });
        items.sort((a, b) => Number(a.price) - Number(b.price));
        items.forEach((p) => assigned.add(p.id));
      } else if (section.id === "other") {
        // Catch-all: everything not yet assigned
        items = products.filter((p) => !assigned.has(p.id));
        items.forEach((p) => assigned.add(p.id));
      } else {
        // All other category sections
        items = products.filter((p) => {
          if (assigned.has(p.id)) return false;

          // First try: match on product.category field
          if (
            section.categories &&
            section.categories.some(
              (c) => (p.category || "").toLowerCase() === c.toLowerCase()
            )
          ) {
            return true;
          }

          // Second try: fallback to keyword matching
          if (section.matchFallback) {
            return section.matchFallback(p);
          }

          return false;
        });

        if (section.sort) items = section.sort(items);
        if (section.limit) items = items.slice(0, section.limit);
        items.forEach((p) => assigned.add(p.id));
      }

      if (items.length > 0) {
        groups.push({
          id: section.id,
          name: section.name,
          icon: section.icon,
          items,
          featured: section.featured,
        });
      }
    }

    return groups;
  }, [products]);

  /* ── Product Card ── */
  const renderProductCard = useCallback(
    (product, isHorizontal = false) => {
      const priceLabel =
        product.bestPrice || `$${Number(product.price || 0).toFixed(2)}`;
      const rating = getDisplayRating(product);
      const inCompare = isProductInCompare(product.id);

      return (
        <div
          className="card card-hover"
          style={{
            padding: 14,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            minHeight: 330,
            width: isHorizontal ? CARD_WIDTH : "auto",
            flexShrink: isHorizontal ? 0 : 1,
            borderRadius: 14,
            transition: "all 0.25s ease",
            border: "1px solid var(--border, #e5e7eb)",
            background: "var(--card-bg, #ffffff)",
          }}
        >
          {/* Image */}
          <div
            style={{
              position: "relative",
              borderRadius: 12,
              overflow: "hidden",
              background: "var(--bg-surface-2, #f9fafb)",
              minHeight: 150,
              height: 150,
            }}
          >
            <img
              src={product.imageUrl || ""}
              alt={product.title}
              loading="lazy"
              decoding="async"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(99, 102, 241, 0.12)",
                backdropFilter: "blur(8px)",
                color: "var(--primary, #6366f1)",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              <Zap size={12} /> Live
            </div>
          </div>

          {/* Content */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 8px",
                  borderRadius: 999,
                  background: "rgba(107, 51, 246, 0.08)",
                  color: "var(--primary, #6366f1)",
                  fontSize: 11,
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                <Tag size={11} />
                {product.category || product.brand || "Product"}
              </div>
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  margin: "0 0 6px",
                  lineHeight: 1.3,
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                  minHeight: 34,
                  height: 34,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {product.title}
              </h3>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--text-muted, #9ca3af)",
                  margin: 0,
                  lineHeight: 1.4,
                  minHeight: 16,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {product.brand || "Live product from SmartPrice"}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
                marginTop: "auto",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  color: "#f59e0b",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {renderStars(rating)}
                <span style={{ marginLeft: 4, color: "var(--text-muted, #9ca3af)" }}>
                  {rating.toFixed(1)}
                </span>
              </div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  color: "var(--text-muted, #9ca3af)",
                }}
              >
                <Store size={12} /> {product.retailers || 1} store
                {(product.retailers || 1) > 1 ? "s" : ""}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
                marginTop: 4,
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: "var(--primary, #6366f1)" }}>
                  {priceLabel}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted, #9ca3af)" }}>
                  Updated live
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => handleAddToCompare(product)}
                  className={`btn btn-sm ${inCompare ? "btn-primary" : "btn-ghost"}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "5px 10px",
                    fontSize: 11,
                    transition: "all 0.2s ease",
                  }}
                >
                  <Scale size={12} /> {inCompare ? "Added" : "Compare"}
                </button>
                <Link
                  href={`/products/${product.id}`}
                  className="btn btn-primary btn-sm"
                  style={{
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "5px 10px",
                    fontSize: 11,
                  }}
                >
                  Details <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    },
    [handleAddToCompare, isProductInCompare]
  );

  /* ── Render ── */
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: "100%", overflowX: "hidden" }}>
      {/* ── Header ── */}
      <div
        className="card"
        style={{
          padding: 24,
          borderRadius: 16,
          border: "1px solid var(--border, #e5e7eb)",
          background: "linear-gradient(135deg, #ffffff, #f5f3ff)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <h2 className="heading-2" style={{ margin: 0, fontSize: "clamp(22px, 3vw, 28px)" }}>
                Products
              </h2>
              {!loading && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 14px",
                    borderRadius: 999,
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  <Package size={14} />
                  {totalCount} Products
                </span>
              )}
            </div>
            <p style={{ margin: "6px 0 0", color: "var(--text-muted, #9ca3af)", fontSize: 14 }}>
              Browse the latest live deals across thousands of retailers, organized by category.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted, #9ca3af)",
                  pointerEvents: "none",
                }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
                style={{
                  minWidth: 220,
                  padding: "9px 12px 9px 38px",
                  borderRadius: 10,
                  border: "1.5px solid var(--border, #e5e7eb)",
                  background: "var(--bg-surface, #ffffff)",
                  color: "var(--foreground)",
                  fontSize: 14,
                  fontFamily: "inherit",
                  outline: "none",
                  transition: "all 0.2s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--primary, #6366f1)";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border, #e5e7eb)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Sort button */}
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`btn btn-sm ${hasActiveFilters ? "btn-primary" : "btn-ghost"}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "9px 12px",
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: hasActiveFilters ? 700 : 500,
                }}
                aria-label="Sort and filter products"
              >
                <ArrowUpDown size={14} />
                Sort{hasActiveFilters ? ` (${[sortBy !== "default" ? 1 : 0, priceFilter !== "all" ? 1 : 0, minRating > 0 ? 1 : 0].filter(Boolean).length})` : ""}
              </button>
            </div>

            {compareList.length > 0 && (
              <Link
                href="/products/compare"
                className="btn btn-primary btn-sm"
                style={{
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "9px 14px",
                  borderRadius: 10,
                }}
              >
                <Scale size={14} /> Compare ({compareList.length}/{MAX_COMPARE_ITEMS})
              </Link>
            )}
          </div>
        </div>

        {/* Sort/Filter panel */}
        {showFilters && (
          <div
            style={{
              marginTop: 16,
              padding: "16px 18px",
              borderRadius: 12,
              background: "var(--card-bg, #ffffff)",
              border: "1px solid var(--border, #e5e7eb)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
              animation: "fadeSlideIn 0.2s ease",
            }}
          >
            {/* Sort row */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted, #9ca3af)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Sort by
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {[
                  { value: "default", label: "Best Match" },
                  { value: "price-asc", label: "Price: Low to High" },
                  { value: "price-desc", label: "Price: High to Low" },
                  { value: "rating", label: "Highest Rated" },
                  { value: "stores", label: "Most Stores" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSortBy(opt.value)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 999,
                      border: sortBy === opt.value
                        ? "1.5px solid var(--primary, #6366f1)"
                        : "1.5px solid var(--border, #e5e7eb)",
                      background: sortBy === opt.value
                        ? "rgba(99, 102, 241, 0.08)"
                        : "transparent",
                      color: sortBy === opt.value
                        ? "var(--primary, #6366f1)"
                        : "var(--text-secondary, #6b7280)",
                      fontSize: 13,
                      fontWeight: sortBy === opt.value ? 700 : 500,
                      fontFamily: "inherit",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price filter row */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted, #9ca3af)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Price Range
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {[
                  { value: "all", label: "All Prices" },
                  { value: "under50", label: "Under $50" },
                  { value: "50-200", label: "$50 — $200" },
                  { value: "200-500", label: "$200 — $500" },
                  { value: "over500", label: "Over $500" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPriceFilter(opt.value)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 999,
                      border: priceFilter === opt.value
                        ? "1.5px solid var(--primary, #6366f1)"
                        : "1.5px solid var(--border, #e5e7eb)",
                      background: priceFilter === opt.value
                        ? "rgba(99, 102, 241, 0.08)"
                        : "transparent",
                      color: priceFilter === opt.value
                        ? "var(--primary, #6366f1)"
                        : "var(--text-secondary, #6b7280)",
                      fontSize: 13,
                      fontWeight: priceFilter === opt.value ? 700 : 500,
                      fontFamily: "inherit",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Min rating filter row */}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted, #9ca3af)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Minimum Rating
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {[
                  { value: 0, label: "Any Rating" },
                  { value: 3, label: "3+ Stars" },
                  { value: 4, label: "4+ Stars" },
                  { value: 4.5, label: "4.5+ Stars" },
                ].map((opt) => (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => setMinRating(opt.value)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 999,
                      border: minRating === opt.value
                        ? "1.5px solid var(--primary, #6366f1)"
                        : "1.5px solid var(--border, #e5e7eb)",
                      background: minRating === opt.value
                        ? "rgba(99, 102, 241, 0.08)"
                        : "transparent",
                      color: minRating === opt.value
                        ? "var(--primary, #6366f1)"
                        : "var(--text-secondary, #6b7280)",
                      fontSize: 13,
                      fontWeight: minRating === opt.value ? 700 : 500,
                      fontFamily: "inherit",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 4, borderTop: "1px solid var(--border, #e5e7eb)" }}>
                <button
                  type="button"
                  onClick={clearFilters}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "none",
                    background: "transparent",
                    color: "var(--text-muted, #9ca3af)",
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary, #6366f1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted, #9ca3af)")}
                >
                  <X size={14} /> Clear all filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Active filter chips (compact view when panel closed) */}
        {!showFilters && hasActiveFilters && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
            {sortBy !== "default" && (
              <span style={filterChipStyle}>
                Sort: {{"default": "Best Match", "price-asc": "Price: Low to High", "price-desc": "Price: High to Low", "rating": "Highest Rated", "stores": "Most Stores"}[sortBy]}
                <button onClick={() => setSortBy("default")} style={{ marginLeft: 4, display: "inline-flex", background: "none", border: "none", cursor: "pointer", padding: 0, color: "inherit", verticalAlign: "middle" }} aria-label="Remove sort">
                  <X size={12} />
                </button>
              </span>
            )}
            {priceFilter !== "all" && (
              <span style={filterChipStyle}>
                Price: {{"under50": "Under $50", "50-200": "$50 - $200", "200-500": "$200 - $500", "over500": "Over $500"}[priceFilter]}
                <button onClick={() => setPriceFilter("all")} style={{ marginLeft: 4, display: "inline-flex", background: "none", border: "none", cursor: "pointer", padding: 0, color: "inherit", verticalAlign: "middle" }} aria-label="Remove price filter">
                  <X size={12} />
                </button>
              </span>
            )}
            {minRating > 0 && (
              <span style={filterChipStyle}>
                {minRating}+ Stars
                <button onClick={() => setMinRating(0)} style={{ marginLeft: 4, display: "inline-flex", background: "none", border: "none", cursor: "pointer", padding: 0, color: "inherit", verticalAlign: "middle" }} aria-label="Remove rating filter">
                  <X size={12} />
                </button>
              </span>
            )}
            <button onClick={clearFilters} style={{ fontSize: 11, color: "var(--text-muted, #9ca3af)", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", textDecoration: "underline", textUnderlineOffset: 2 }}>
              Clear all
            </button>
          </div>
        )}

        {/* Compare message toast */}
        {compareMessage && (
          <div
            style={{
              marginTop: 12,
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgba(99, 102, 241, 0.08)",
              color: "var(--primary, #6366f1)",
              fontSize: 13,
              fontWeight: 600,
              animation: "fadeSlideIn 0.3s ease",
            }}
          >
            {compareMessage}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonProductCard key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div
          className="card"
          style={{
            padding: 48,
            textAlign: "center",
            color: "var(--text-muted, #9ca3af)",
            borderRadius: 16,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
          <h3 style={{ margin: "0 0 6px", color: "var(--text-primary)", fontWeight: 700 }}>
            No products found
          </h3>
          <p style={{ margin: 0, fontSize: 13 }}>
            {search
              ? `No results for "${search}". Try a different search term.`
              : "No products are available right now. Please check back soon."}
          </p>
        </div>
      ) : search || hasActiveFilters ? (
        /* ── Search / Filtered results ── */
        (() => {
          const filteredProducts = applyFilters(applySort(products));
          const filteredCount = filteredProducts.length;

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Results info bar */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 8,
                  fontSize: 13,
                  color: "var(--text-muted, #9ca3af)",
                }}
              >
                <span>
                  Showing <strong>{Math.min(visibleCount, filteredCount)}</strong>
                  {filteredCount > visibleCount && ` of ${filteredCount}`} product{filteredCount === 1 ? "" : "s"}
                  {search && ` for "${search}"`}
                </span>
                {sortBy !== "default" && (
                  <span style={{ fontSize: 12 }}>
                    Sorted: <strong>{{"price-asc": "Price ↑", "price-desc": "Price ↓", "rating": "Rating", "stores": "Stores"}[sortBy]}</strong>
                  </span>
                )}
              </div>

              {filteredCount === 0 ? (
                /* ── Empty filtered state ── */
                <div
                  className="card"
                  style={{
                    padding: 48,
                    textAlign: "center",
                    color: "var(--text-muted, #9ca3af)",
                    borderRadius: 16,
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                  <h3 style={{ margin: "0 0 6px", color: "var(--text-primary)", fontWeight: 700 }}>
                    No products match
                  </h3>
                  <p style={{ margin: "0 0 16px", fontSize: 13 }}>
                    Try adjusting your filters or search term.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="btn btn-ghost"
                    style={{ fontSize: 13, padding: "8px 18px", borderRadius: 8 }}
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                /* ── Products grid ── */
                <>
                  <div
                    style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}
                  >
                    {filteredProducts.slice(0, visibleCount).map((product) => renderProductCard(product, false))}
                  </div>

                  {showLoadMore && visibleCount < filteredCount && (
                    <div
                      className="animate-fade-up"
                      style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}
                    >
                      <button
                        onClick={handleLoadMore}
                        className="btn btn-gradient"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "12px 30px",
                          fontSize: 14,
                          borderRadius: 12,
                          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontFamily: "inherit",
                          transition: "all 0.25s ease",
                          boxShadow: "0 4px 14px rgba(99, 102, 241, 0.25)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow = "0 6px 20px rgba(99, 102, 241, 0.35)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 4px 14px rgba(99, 102, 241, 0.25)";
                        }}
                      >
                        <Sparkles size={16} /> Load 50 More Products
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })()
      ) : (
        /* ── Category sections ── */
        <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 0 }}>
          {/* Section quick-nav pills */}
          <div
            className="card"
            style={{
              padding: "14px 20px",
              borderRadius: 14,
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
              background: "var(--card-bg, #ffffff)",
              border: "1px solid var(--border, #e5e7eb)",
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--text-muted, #9ca3af)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginRight: 4,
              }}
            >
              Jump to:
            </span>
            {groupedCategories.map((cat) => (
              <a
                key={cat.id}
                href={`#section-${cat.id}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "5px 12px",
                  borderRadius: 999,
                  background: "var(--bg-subtle, #f3f4f6)",
                  color: "var(--text-secondary, #6b7280)",
                  fontSize: 12,
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  border: "1px solid transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(99,102,241,0.08)";
                  e.currentTarget.style.color = "var(--primary, #6366f1)";
                  e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--bg-subtle, #f3f4f6)";
                  e.currentTarget.style.color = "var(--text-secondary, #6b7280)";
                  e.currentTarget.style.borderColor = "transparent";
                }}
              >
                {cat.icon} {cat.name}
              </a>
            ))}
          </div>

          {/* Category sections */}
          {groupedCategories.map((cat, idx) => (
            <div key={cat.id} id={`section-${cat.id}`}>
              <ProductCarouselRow
                cat={cat}
                items={cat.items}
                scrollIndex={scrollIndexes[cat.id] || 0}
                onScroll={(direction) => handleCategoryScroll(cat.id, direction, cat.items.length)}
                renderProductCard={renderProductCard}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Sticky compare bar ── */}
      {compareList.length > 0 && (
        <div
          className="card"
          style={{
            position: "sticky",
            bottom: 16,
            zIndex: 20,
            padding: "12px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            border: "1.5px solid var(--primary, #6366f1)",
            boxShadow: "0 8px 28px rgba(99, 102, 241, 0.15)",
            borderRadius: 14,
            background: "linear-gradient(135deg, #ffffff, #f5f3ff)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Scale size={18} style={{ color: "var(--primary, #6366f1)" }} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              {compareList.length} product{compareList.length === 1 ? "" : "s"} ready to compare
            </span>
          </div>
          <Link
            href="/products/compare"
            className="btn btn-primary"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 18px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff",
              border: "none",
            }}
          >
            <ArrowRight size={14} /> Open Compare Page
          </Link>
        </div>
      )}

      {/* ── Keyframe animation ── */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
