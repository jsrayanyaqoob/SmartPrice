"use client";

import { useState, useEffect } from "react";

export default function TrendingProducts() {
  const [productsList, setProductsList] = useState([]);
  const [scrollIndex, setScrollIndex] = useState(0);

  useEffect(() => {
    async function loadTrending() {
      try {
        const res = await fetch("/api/external-products");
        if (res.ok) {
          const data = await res.json();
          if (data.products && data.products.length > 0) {
            const mapped = data.products.map((p) => ({
              id: p.id,
              name: p.name || p.title || "Product",
              bestPrice: p.bestPrice || "Price unavailable",
              retailers: p.retailers || 1,
              img: p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.name || p.title || "Product"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                "📦"
              ),
            }));
            setProductsList(mapped);
          } else {
            setProductsList([]);
          }
        } else {
          setProductsList([]);
        }
      } catch (err) {
        console.error(err);
        setProductsList([]);
      }
    }
    loadTrending();
  }, []);

  const maxScroll = Math.max(0, productsList.length - 4);

  return (
    <section style={{ padding: "72px 0", background: "white" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
          <div>
            <div className="section-label">HOT RIGHT NOW</div>
            <h2 className="heading-2">Trending Products</h2>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setScrollIndex(Math.max(0, scrollIndex - 1))}
              disabled={scrollIndex === 0}
              aria-label="Previous"
              style={{
                width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--border)",
                background: "white", cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", opacity: scrollIndex === 0 ? 0.4 : 1,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button
              onClick={() => setScrollIndex(Math.min(maxScroll, scrollIndex + 1))}
              disabled={scrollIndex >= maxScroll}
              aria-label="Next"
              style={{
                width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--border)",
                background: "white", cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", opacity: scrollIndex >= maxScroll ? 0.4 : 1,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div style={{ overflow: "hidden" }}>
          {productsList.length === 0 ? (
            <div style={{ padding: 24, color: "var(--text-muted)" }}>Loading products from the live feed…</div>
          ) : (
          <div
            style={{
              display: "flex",
              gap: 20,
              transition: "transform 0.3s ease",
              transform: `translateX(-${scrollIndex * 270}px)`,
            }}
          >
            {productsList.map((product) => (
              <div
                key={product.id}
                className="card card-hover"
                style={{
                  minWidth: 240,
                  padding: 0,
                  overflow: "hidden",
                  cursor: "pointer",
                }}
              >
                {/* Product Image Area */}
                <div
                  style={{
                    height: 160,
                    background: "var(--bg-surface-2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 48,
                  }}
                >
                  {product.img}
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{product.name}</h3>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 6 }}>
                    Best Price Found: <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{product.bestPrice}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "var(--primary)", fontWeight: 600 }}>
                      {product.retailers} retailers
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>
    </section>
  );
}
