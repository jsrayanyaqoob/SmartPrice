"use client";

import { useState, useEffect } from "react";
import AdminPageLayout from "@/components/layout/AdminPageLayout";

const getRatingColor = (rating) => {
  if (rating >= 4.5) return "var(--success)";
  if (rating >= 3.5) return "var(--primary)";
  if (rating >= 2.5) return "var(--warning)";
  return "var(--danger)";
};

const getRatingLabel = (rating) => {
  if (rating >= 4.5) return "Excellent";
  if (rating >= 3.5) return "Good";
  if (rating >= 2.5) return "Average";
  return "Poor";
};

export default function ReviewsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("rating_desc");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/audit-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "page_view", entity: "reviews", details: "Viewed Reviews & Reports page" }),
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

  const sorted = [...products]
    .filter((p) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        (p.title || p.name || "").toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const aRating = Number(a.rating) || 0;
      const bRating = Number(b.rating) || 0;
      switch (sortBy) {
        case "rating_desc": return bRating - aRating;
        case "rating_asc": return aRating - bRating;
        case "name_asc": return ((a.title || a.name || "")).localeCompare(b.title || b.name || "");
        case "name_desc": return ((b.title || b.name || "")).localeCompare(a.title || a.name || "");
        case "price_asc": return (Number(a.price) || 0) - (Number(b.price) || 0);
        case "price_desc": return (Number(b.price) || 0) - (Number(a.price) || 0);
        default: return bRating - aRating;
      }
    });

  const ratedProducts = sorted.filter((p) => Number(p.rating) > 0);
  const avgRating = ratedProducts.length
    ? (ratedProducts.reduce((s, p) => s + (Number(p.rating) || 0), 0) / ratedProducts.length).toFixed(1)
    : "—";
  const excellentCount = ratedProducts.filter((p) => Number(p.rating) >= 4.5).length;
  const poorCount = ratedProducts.filter((p) => Number(p.rating) < 2.5).length;

  return (
    <AdminPageLayout title="Reviews & Reports" subtitle="Product ratings distribution, reviews, and quality metrics.">
      {/* KPIs */}
      <div className="kpi-grid">
        <div className="card admin-fade-in-delay-1" style={{ padding: 16 }}>
          <div className="kpi-label">Avg Rating</div>
          <div className="kpi-value" style={{ color: "var(--primary)" }}>{avgRating}</div>
          <div className="kpi-sub">Across {ratedProducts.length} rated products</div>
        </div>
        <div className="card admin-fade-in-delay-2" style={{ padding: 16 }}>
          <div className="kpi-label">Excellent (4.5+)</div>
          <div className="kpi-value" style={{ color: "var(--success)" }}>{excellentCount}</div>
          <div className="kpi-sub">Top rated products</div>
        </div>
        <div className="card admin-fade-in-delay-3" style={{ padding: 16 }}>
          <div className="kpi-label">Products Rated</div>
          <div className="kpi-value">{ratedProducts.length}</div>
          <div className="kpi-sub">Out of {products.length} total</div>
        </div>
        <div className="card admin-fade-in-delay-4" style={{ padding: 16 }}>
          <div className="kpi-label">Needs Review</div>
          <div className="kpi-value" style={{ color: "var(--danger)" }}>{poorCount}</div>
          <div className="kpi-sub">Rating below 2.5</div>
        </div>
      </div>

      {/* Rating Distribution Bar */}
      <div className="card" style={{ padding: 20 }}>
        <h3 className="card-title" style={{ marginBottom: 14 }}>Rating Distribution</h3>
        {loading ? (
          <div className="skeleton-pulse" style={{ height: 40, borderRadius: 8 }} />
        ) : ratedProducts.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 20 }}>
            No product ratings available yet. Products with ratings will appear here.
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 60 }}>
            {[
              { label: "1★", min: 0, max: 1.5, color: "#ef4444" },
              { label: "2★", min: 1.5, max: 2.5, color: "#f59e0b" },
              { label: "3★", min: 2.5, max: 3.5, color: "#3b82f6" },
              { label: "4★", min: 3.5, max: 4.5, color: "#8b5cf6" },
              { label: "5★", min: 4.5, max: 5.1, color: "#10b981" },
            ].map((bucket) => {
              const count = ratedProducts.filter((p) => {
                const r = Number(p.rating) || 0;
                return r >= bucket.min && r < bucket.max;
              }).length;
              const pct = ratedProducts.length > 0 ? (count / ratedProducts.length) * 100 : 0;
              const barHeight = Math.max(pct, count > 0 ? 8 : 0);
              return (
                <div key={bucket.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: "100%", height: `${barHeight * 0.6}px`, borderRadius: 6, background: bucket.color, opacity: count > 0 ? 1 : 0.2, transition: "height 0.3s ease" }} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: "var(--text-muted)" }}>{bucket.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)" }}>{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <h3 className="card-title" style={{ margin: 0 }}>Product Ratings</h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div className="search-wrapper">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" className="search-icon">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="admin-search-input"
                style={{ width: 180 }}
              />
            </div>
            <select
              className="input"
              style={{ width: 140, height: 32, fontSize: 11, padding: "0 6px" }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="rating_desc">Rating ↓</option>
              <option value="rating_asc">Rating ↑</option>
              <option value="name_asc">Name A-Z</option>
              <option value="name_desc">Name Z-A</option>
              <option value="price_asc">Price ↓</option>
              <option value="price_desc">Price ↑</option>
            </select>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                const esc = (s) => String(s || "").replace(/"/g, '""');
                const csv = ["Title,Brand,Category,Rating,Price\n"].concat(
                  sorted.map((p) => `"${esc(p.title || p.name)}","${esc(p.brand)}","${esc(p.category)}",${Number(p.rating || 0).toFixed(1)},${Number(p.price || 0).toFixed(2)}`)
                ).join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = "smartprice-reviews.csv"; a.click();
                URL.revokeObjectURL(url);
              }}
              disabled={sorted.length === 0}
            >
              Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="table-empty">Loading...</div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>BRAND</th>
                  <th>CATEGORY</th>
                  <th>RATING</th>
                  <th className="text-right">PRICE</th>
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr><td colSpan={5} className="table-empty">No products found.</td></tr>
                ) : (
                  sorted.map((p, idx) => {
                    const rating = Number(p.rating) || 0;
                    const color = getRatingColor(rating);
                    const label = getRatingLabel(rating);
                    return (
                      <tr key={p.id || idx}>
                        <td>
                          <div className="product-cell">
                            <div className="product-thumb">
                              {p.imageUrl ? (
                                <img src={p.imageUrl} alt="" loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (
                                <span>📦</span>
                              )}
                            </div>
                            <div>
                              <div className="product-name">{p.title || p.name || "Product"}</div>
                              <div className="product-meta">{p.source || "Live feed"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-secondary">{p.brand || "—"}</td>
                        <td>
                          <span className="badge badge-primary" style={{ fontSize: 8 }}>{p.category || "General"}</span>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{
                              width: 32, height: 20, borderRadius: 4,
                              background: color, color: "white",
                              fontSize: 11, fontWeight: 700,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              {rating.toFixed(1)}
                            </div>
                            <span style={{ fontSize: 10, color }}>{label}</span>
                            <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                              {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
                            </span>
                          </div>
                        </td>
                        <td className="text-right" style={{ fontWeight: 700 }}>
                          {p.bestPrice || `$${Number(p.price || 0).toFixed(2)}`}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminPageLayout>
  );
}
