"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Star, Store, Tag, ChevronLeft, ChevronRight, Scale } from "lucide-react";
import { SkeletonProductCard } from "@/components/ui/Skeleton";
import { useCompareList } from "@/hooks/useCompareList";
import { MAX_COMPARE_ITEMS } from "@/lib/compare";

const CATEGORY_SECTIONS = [
  {
    id: "trending",
    name: "Trending Deals",
    icon: "🔥",
    match: () => true,
    sort: (items) => [...items].sort((a, b) => getDisplayRating(b) - getDisplayRating(a)),
    limit: 16,
  },
  {
    id: "gaming",
    name: "Gaming & Consoles",
    icon: "🎮",
    match: (p) => {
      const text = `${p.category || ""} ${p.title || ""} ${p.brand || ""}`.toLowerCase();
      return /game|gaming|console|xbox|playstation|ps5|ps4|nintendo|wii|switch|controller|steam deck/.test(text);
    },
  },
  {
    id: "laptops",
    name: "Laptops & Computers",
    icon: "💻",
    match: (p) => {
      const text = `${p.category || ""} ${p.title || ""} ${p.brand || ""}`.toLowerCase();
      return /laptop|macbook|chromebook|notebook|computer|pc|desktop|imac|mac mini|thinkpad|surface/.test(text);
    },
  },
  {
    id: "monitors",
    name: "Monitors & Displays",
    icon: "🖥️",
    match: (p) => {
      const text = `${p.category || ""} ${p.title || ""}`.toLowerCase();
      return /monitor|display|screen|oled|4k tv|television|projector/.test(text);
    },
  },
  {
    id: "audio",
    name: "Headphones & Audio",
    icon: "🎧",
    match: (p) => {
      const text = `${p.category || ""} ${p.title || ""} ${p.brand || ""}`.toLowerCase();
      return /headphone|earbud|airpod|speaker|audio|soundbar|microphone|headset|beats|sony wh|bose/.test(text);
    },
  },
  {
    id: "peripherals",
    name: "Keyboards & Peripherals",
    icon: "⌨️",
    match: (p) => {
      const text = `${p.category || ""} ${p.title || ""}`.toLowerCase();
      return /keyboard|mouse|trackpad|webcam|printer|scanner|peripheral|mechanical key/.test(text);
    },
  },
  {
    id: "mobile",
    name: "Phones & Tablets",
    icon: "📱",
    match: (p) => {
      const text = `${p.category || ""} ${p.title || ""} ${p.brand || ""}`.toLowerCase();
      return /phone|iphone|android|samsung galaxy|pixel|tablet|ipad|smartwatch|watch|kindle/.test(text);
    },
  },
  {
    id: "storage",
    name: "Storage & Components",
    icon: "💾",
    match: (p) => {
      const text = `${p.category || ""} ${p.title || ""}`.toLowerCase();
      return /ssd|hard drive|hdd|nvme|ram|memory|graphics card|gpu|cpu|processor|motherboard|storage/.test(text);
    },
  },
  {
    id: "home-office",
    name: "Home & Office",
    icon: "🏠",
    match: (p) => {
      const text = `${p.category || ""} ${p.title || ""}`.toLowerCase();
      return /office|desk|chair|lamp|router|wifi|smart home|camera|security|home/.test(text);
    },
  },
  {
    id: "budget",
    name: "Best Value Deals",
    icon: "💎",
    match: (p) => Number(p.price) > 0 && Number(p.price) <= 150,
    sort: (items) => [...items].sort((a, b) => Number(a.price) - Number(b.price)),
  },
  {
    id: "other",
    name: "More Live Catalog",
    icon: "✨",
    match: () => true,
  },
];

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
    stars.push(<Star key={i} size={13} fill={i < rounded ? "currentColor" : "none"} stroke="currentColor" />);
  }

  return stars;
}

const CARD_WIDTH = 260;
const CARD_GAP = 16;
const CARD_STEP = CARD_WIDTH + CARD_GAP;
const VISIBLE_CARDS = 4;

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
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <h3 className="heading-3" style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <span>{cat.icon}</span> {cat.name}
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>({items.length} items)</span>
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
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: canScrollLeft ? 1 : 0.4,
              cursor: canScrollLeft ? "pointer" : "default",
            }}
            aria-label={`Scroll ${cat.name} left`}
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
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: canScrollRight ? 1 : 0.4,
              cursor: canScrollRight ? "pointer" : "default",
            }}
            aria-label={`Scroll ${cat.name} right`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="products-carousel-viewport">
        <div
          className="products-carousel-track"
          style={{
            transform: `translateX(-${scrollIndex * CARD_STEP}px)`,
          }}
        >
          {items.map((product) => (
            <div key={product.id} className="products-carousel-slide">
              {renderProductCard(product, true)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  useEffect(() => { document.title = "Products - SmartPrice"; document.querySelector('meta[name="description"]')?.setAttribute('content', 'Browse live deals and products on SmartPrice. Compare prices across retailers, track price drops, and find the best value.'); }, []);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(50);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [compareMessage, setCompareMessage] = useState("");
  const { compareList, addProduct } = useCompareList();
  const [scrollIndexes, setScrollIndexes] = useState({});

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products?q=${encodeURIComponent(search)}`);
        const data = await res.json();
        if (active) {
          setProducts(data.products || []);
          setVisibleCount(50);
          setShowLoadMore(false);
          setScrollIndexes({});
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setProducts([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search]);

  // Scroll detection to show "Load More" button when user scrolls close to bottom (only when search active)
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
      
      const threshold = 150; // px from bottom
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

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 50);
    setShowLoadMore(false);
  };

  const handleAddToCompare = (product) => {
    const result = addProduct(product);

    if (!result.added && result.reason === "duplicate") {
      setCompareMessage(`${product.title} is already in compare.`);
    } else if (result.added && result.reason === "replaced-oldest") {
      setCompareMessage(`Compare tray is full. Replaced oldest item with ${product.title}.`);
    } else if (result.added) {
      setCompareMessage(`Added ${product.title} to compare.`);
    }

    window.setTimeout(() => setCompareMessage(""), 2600);
  };

  const isProductInCompare = (productId) => compareList.some((item) => item.id === productId);

  const handleCategoryScroll = (catId, direction, itemCount) => {
    setScrollIndexes((prev) => {
      const current = prev[catId] || 0;
      const maxScroll = Math.max(0, itemCount - VISIBLE_CARDS);
      const next = direction === "left" ? Math.max(0, current - 1) : Math.min(maxScroll, current + 1);
      return { ...prev, [catId]: next };
    });
  };

  const getGroupedCategories = () => {
    const assigned = new Set();
    const groups = [];

    for (const section of CATEGORY_SECTIONS) {
      let items;

      if (section.id === "trending") {
        items = [...products].sort((a, b) => getDisplayRating(b) - getDisplayRating(a));
        if (section.limit) {
          items = items.slice(0, section.limit);
        }
      } else {
        items = products.filter((p) => {
          if (assigned.has(p.id)) return false;
          return section.match(p);
        });

        if (section.sort) {
          items = section.sort(items);
        }

        if (section.limit) {
          items = items.slice(0, section.limit);
        }

        items.forEach((p) => assigned.add(p.id));
      }

      if (items.length > 0) {
        groups.push({
          id: section.id,
          name: section.name,
          icon: section.icon,
          items,
        });
      }
    }

    return groups;
  };

  const renderProductCard = (product, isHorizontal = false) => {
    const priceLabel = product.bestPrice || `$${Number(product.price || 0).toFixed(2)}`;
    const rating = getDisplayRating(product);
    const inCompare = isProductInCompare(product.id);

    return (
      <div 
        key={product.id} 
        className="card card-hover" 
        style={{ 
          padding: 14, 
          display: "flex", 
          flexDirection: "column", 
          gap: 10, 
          minHeight: 330,
          width: isHorizontal ? CARD_WIDTH : "auto",
          flexShrink: isHorizontal ? 0 : 1,
        }}
      >
        <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", background: "var(--bg-surface-2)", minHeight: 150, height: 150 }}>
          <img
            src={product.imageUrl || ""}
            alt={product.title}
            loading="lazy"
            decoding="async"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <div style={{ position: "absolute", top: 10, left: 10, display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999, background: "rgba(255,255,255,0.9)", color: "var(--foreground)", fontSize: 11, fontWeight: 700 }}>
            <Sparkles size={12} /> Live deal
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 999, background: "rgba(107, 51, 246, 0.1)", color: "var(--primary)", fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
              <Tag size={11} /> {product.category || product.brand || "Product"}
            </div>
            <h3 style={{ fontSize: 13, fontWeight: 800, margin: "0 0 6px", lineHeight: 1.3, overflowWrap: "anywhere", wordBreak: "break-word", minHeight: 34, height: 34, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
              {product.title}
            </h3>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, lineHeight: 1.4, minHeight: 16, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {product.brand || "Live product from SmartPrice"}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: "auto" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "#f59e0b", fontSize: 12, fontWeight: 700 }}>
              {renderStars(rating)}
              <span style={{ marginLeft: 4, color: "var(--text-muted)" }}>{rating.toFixed(1)}</span>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-muted)" }}>
              <Store size={12} /> {product.retailers || 1} stores
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 4 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{priceLabel}</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>Updated live</div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => handleAddToCompare(product)}
                className={`btn btn-sm ${inCompare ? "btn-primary" : "btn-ghost"}`}
                style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", fontSize: 11 }}
              >
                <Scale size={12} /> {inCompare ? "Added" : "Compare"}
              </button>
              <Link href={`/products/${product.id}`} className="btn btn-primary btn-sm" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", fontSize: 11 }}>
                Details <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: "100%", overflowX: "hidden" }}>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 className="heading-2" style={{ margin: 0 }}>Products</h2>
            <p style={{ margin: "6px 0 0", color: "var(--text-muted)" }}>
              Browse the latest live deals from the product feed.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products"
              style={{ minWidth: 220, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-surface)", color: "var(--foreground)" }}
            />
            {compareList.length > 0 && (
              <Link
                href="/products/compare"
                className="btn btn-primary btn-sm"
                style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <Scale size={14} /> Compare ({compareList.length}/{MAX_COMPARE_ITEMS})
              </Link>
            )}
            <div className="badge badge-pro" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Sparkles size={14} /> Live catalog ({products.length} products)
            </div>
          </div>
        </div>
        {compareMessage && (
          <div
            style={{
              marginTop: 12,
              padding: "10px 12px",
              borderRadius: 8,
              background: "rgba(107, 51, 246, 0.08)",
              color: "var(--primary)",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {compareMessage}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonProductCard key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
          <h3 style={{ margin: "0 0 6px", color: "var(--text-primary)", fontWeight: 700 }}>No products found</h3>
          <p style={{ margin: 0, fontSize: 13 }}>
            {search ? `No results for "${search}". Try a different search term.` : "No products are available right now. Please check back soon."}
          </p>
        </div>
      ) : search ? (
        /* Render search query results in a clean grid */
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {products.slice(0, visibleCount).map((product) => renderProductCard(product, false))}
          </div>

          {showLoadMore && visibleCount < products.length && (
            <div className="animate-fade-up" style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
              <button onClick={handleLoadMore} className="btn btn-gradient" style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 30px", fontSize: 14 }}>
                <Sparkles size={16} /> Load 50 More Products
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 32, minWidth: 0 }}>
          {getGroupedCategories().map((cat) => (
            <ProductCarouselRow
              key={cat.id}
              cat={cat}
              items={cat.items}
              scrollIndex={scrollIndexes[cat.id] || 0}
              onScroll={(direction) => handleCategoryScroll(cat.id, direction, cat.items.length)}
              renderProductCard={renderProductCard}
            />
          ))}
        </div>
      )}
      {compareList.length > 0 && (
        <div
          className="card"
          style={{
            position: "sticky",
            bottom: 16,
            zIndex: 20,
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            border: "1px solid var(--primary)",
            boxShadow: "0 8px 24px rgba(107, 51, 246, 0.12)",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            {compareList.length} product{compareList.length === 1 ? "" : "s"} ready to compare
          </div>
          <Link href="/products/compare" className="btn btn-primary btn-sm" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Scale size={14} /> Open Compare Page
          </Link>
        </div>
      )}
    </div>
  );
}
