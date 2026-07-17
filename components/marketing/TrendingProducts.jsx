"use client";

import { useState, useEffect } from "react";

const categoryIcons = {
  "Electronics": "⚡",
  "Gaming Rig": "🎮",
  "Fashion": "👕",
  "Home": "🏠",
  "Sports": "⚽",
  "General": "📱",
  "default": "🏷️"
};

const categoryColors = {
  "Electronics": { bg: "#ede9ff", text: "#6b33f6" },
  "Gaming Rig": { bg: "#dbeafe", text: "#3b5bdb" },
  "Fashion": { bg: "#fee2e2", text: "#ef4444" },
  "Home": { bg: "#d1fae5", text: "#10b981" },
  "Sports": { bg: "#fef3c7", text: "#f59e0b" },
  "General": { bg: "#ede9ff", text: "#6b33f6" },
};

export default function TrendingProducts() {
  const [productsList, setProductsList] = useState([]);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrending() {
      try {
        const res = await fetch("/api/external-products");
        if (res.ok) {
          const data = await res.json();
          if (data.products && data.products.length > 0) {
            // Shuffle to ensure mixed categories
            const shuffled = [...data.products].sort(() => Math.random() - 0.5);
            setProductsList(shuffled);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadTrending();
  }, []);

  const maxScroll = Math.max(0, productsList.length - 4);

  const getCategoryIcon = (cat) => categoryIcons[cat] || categoryIcons["default"];
  const getCategoryColor = (cat) => categoryColors[cat] || categoryColors["General"];

  return (
    <section style={{ padding: "80px 0", background: "var(--bg-app)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36 }}>
          <div>
            <div className="section-label">HOT RIGHT NOW</div>
            <h2 className="heading-2">Trending Products</h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 6 }}>
              Mixed categories — from keyboards to cameras, all in one place
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setScrollIndex(Math.max(0, scrollIndex - 1))}
              disabled={scrollIndex === 0}
              aria-label="Previous"
              style={{
                width: 38, height: 38, borderRadius: "50%", border: "1px solid var(--border)",
                background: "white", cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", opacity: scrollIndex === 0 ? 0.4 : 1,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { if (scrollIndex !== 0) e.currentTarget.style.background = "var(--primary-light)"; }}
              onMouseLeave={(e) => e.currentTarget.style.background = "white"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button
              onClick={() => setScrollIndex(Math.min(maxScroll, scrollIndex + 1))}
              disabled={scrollIndex >= maxScroll}
              aria-label="Next"
              style={{
                width: 38, height: 38, borderRadius: "50%", border: "1px solid var(--border)",
                background: "white", cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", opacity: scrollIndex >= maxScroll ? 0.4 : 1,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { if (scrollIndex < maxScroll) e.currentTarget.style.background = "var(--primary-light)"; }}
              onMouseLeave={(e) => e.currentTarget.style.background = "white"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="products-carousel-viewport">
          {loading ? (
            <div style={{ display: "flex", gap: 20 }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card" style={{ minWidth: 262, padding: 0, overflow: "hidden" }}>
                  <div style={{ height: 180, animation: "shimmer 2s linear infinite", background: "linear-gradient(90deg, var(--bg-surface-2) 25%, #e8e8ee 50%, var(--bg-surface-2) 75%)", backgroundSize: "200% 100%" }} />
                  <div style={{ padding: "14px 16px" }}>
                    <div style={{ height: 14, width: "70%", background: "var(--bg-surface-2)", borderRadius: 4, marginBottom: 8 }} />
                    <div style={{ height: 12, width: "50%", background: "var(--bg-surface-2)", borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : productsList.length === 0 ? (
            <div style={{ padding: 40, color: "var(--text-muted)", textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
              <p>No trending products available right now. Check back soon!</p>
            </div>
          ) : (
          <div
            className="products-carousel-track"
            style={{ transform: `translateX(-${scrollIndex * 282}px)` }}
          >
            {productsList.map((product) => {
              const catColor = getCategoryColor(product.category);
              return (
                <div
                  key={product.id}
                  className="products-carousel-slide card card-hover trending-product-card"
                  style={{
                    padding: 0,
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                >
                  {/* Product Image - Full width */}
                  <div
                    style={{
                      height: 180,
                      background: "white",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="trending-product-img"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div style={{
                        width: "100%",
                        height: "100%",
                        background: "linear-gradient(135deg, var(--primary-light), #ddd6fe)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 48,
                      }}>
                        {getCategoryIcon(product.category)}
                      </div>
                    )}
                    {/* Category Badge */}
                    <div style={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      background: catColor.bg,
                      color: catColor.text,
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "var(--radius-full)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}>
                      <span>{getCategoryIcon(product.category)}</span>
                      <span>{product.category || "General"}</span>
                    </div>
                  </div>
                  <div style={{ padding: "14px 16px" }}>
                    <h3 style={{
                      fontSize: 14,
                      fontWeight: 600,
                      marginBottom: 4,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {product.name}
                    </h3>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
                      {product.brand && (
                        <span style={{ color: "var(--text-muted)", marginRight: 6 }}>{product.brand}</span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)" }}>
                        {product.bestPrice}
                      </span>
                      {product.originalPrice && (
                        <span style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "line-through" }}>
                          {product.originalPrice}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                      <span style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600 }}>
                        {product.retailers} retailer{product.retailers !== 1 ? "s" : ""}
                      </span>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "white",
                        background: "var(--brand-gradient)",
                        padding: "3px 10px",
                        borderRadius: "var(--radius-full)",
                      }}>
                        VIEW DEAL
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </div>
    </section>
  );
}
