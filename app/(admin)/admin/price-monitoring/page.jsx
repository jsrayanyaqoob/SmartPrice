"use client";

import { useState, useEffect } from "react";

export default function PriceMonitoringPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Page-view audit log
    fetch("/api/admin/audit-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "page_view", entity: "price_monitoring", details: "Viewed Price Monitoring page" }),
    }).catch(() => {});

    const fetchData = async () => {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const priceEvents = products.slice(0, 30).map((p) => {
    const price = typeof p.price === "number" ? p.price : 0;
    const isLow = price > 0 && price < 50;
    const isHigh = price > 500;
    return {
      product: p.title || p.name || "Product",
      store: p.source || p.bestStore || "Online",
      price: p.bestPrice || `$${price.toFixed(2)}`,
      type: isLow ? "down" : isHigh ? "up" : "neutral",
      time: "Live",
    };
  });

  const lowPriceCount = priceEvents.filter((e) => e.type === "down").length;
  const highPriceCount = priceEvents.filter((e) => e.type === "up").length;

  return (
    <div className="admin-page">
      <div>
        <h2 className="admin-page-title">Price Monitoring</h2>
        <p className="admin-page-subtitle">
          View live product prices and price ranges from tracked products.
        </p>
      </div>

      <div className="kpi-grid">
        {[
          { label: "Products Tracked", val: `${products.length}`, color: "var(--primary)" },
          { label: "Budget Friendly", val: `${lowPriceCount}`, color: "var(--success)" },
          { label: "Premium Items", val: `${highPriceCount}`, color: "var(--danger)" },
          { label: "Live Sources", val: `${new Set(products.map(p => p.source || "Live")).size}`, color: "var(--info)" },
        ].map((s, idx) => (
          <div key={idx} className={`card admin-fade-in-delay-${idx + 1}`} style={{ padding: 16 }}>
            <div className="kpi-label">{s.label}</div>
            <div className="kpi-value" style={{ color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Price Distribution */}
      <div className="card" style={{ padding: 20 }}>
        <h3 className="card-title" style={{ marginBottom: 16 }}>Price Distribution</h3>
        {loading ? (
          <div className="table-empty">Loading...</div>
        ) : products.length === 0 ? (
          <div className="table-empty">No products available. Fetch products first.</div>
        ) : (
          <div className="price-ranges">
            {[
              { label: "Under $50", range: [0, 50] },
              { label: "$50 - $200", range: [50, 200] },
              { label: "$200 - $500", range: [200, 500] },
              { label: "$500+", range: [500, Infinity] },
            ].map((r) => {
              const count = products.filter((p) => {
                const price = typeof p.price === "number" ? p.price : 0;
                return price >= r.range[0] && price < r.range[1];
              }).length;
              const maxCount = Math.max(
                ...products.reduce((acc, p) => {
                  const price = typeof p.price === "number" ? p.price : 0;
                  const rangeIdx = price < 50 ? 0 : price < 200 ? 1 : price < 500 ? 2 : 3;
                  acc[rangeIdx] = (acc[rangeIdx] || 0) + 1;
                  return acc;
                }, [0, 0, 0, 0]),
                1
              );
              return (
                <div key={r.label} className="price-range-row">
                  <div className="price-range-label">{r.label}</div>
                  <div className="price-range-bar-bg">
                    <div className="price-range-bar" style={{ width: `${(count / maxCount) * 100}%` }} />
                  </div>
                  <div className="price-range-count">{count} items</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Live Price Events */}
      <div className="card" style={{ padding: 20 }}>
        <h3 className="card-title" style={{ marginBottom: 16 }}>Live Products Feed</h3>
        {loading ? (
          <div className="table-empty">Loading...</div>
        ) : priceEvents.length === 0 ? (
          <div className="table-empty">No products available.</div>
        ) : (
          <div className="price-events-list">
            {priceEvents.slice(0, 20).map((e, idx) => (
              <div key={idx} className="price-event-item">
                <div className={`price-event-dot ${e.type}`} />
                <div className="price-event-info">
                  <div className="price-event-product">{e.product}</div>
                  <div className="price-event-store">{e.store}</div>
                </div>
                <div className={`price-event-price ${e.type}`}>{e.price}</div>
                <div className="price-event-time">{e.time}</div>
              </div>
            ))}
          </div>
        )}
      </div>


    </div>
  );
}
