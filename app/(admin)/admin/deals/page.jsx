"use client";

import { useState, useEffect } from "react";

export default function DealsPage() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          const products = data.products || [];

          const calculatedDeals = products
            .filter((p) => p.price > 0)
            .map((p) => {
              const currentPrice = typeof p.price === "number" ? p.price : parseFloat(p.price) || 0;
              const originalPrice = p.originalPrice
                ? parseFloat(p.originalPrice.replace(/[^0-9.]/g, "")) || 0
                : currentPrice * 1.3; // Estimate original as 30% higher if not available
              const discount = originalPrice > 0 ? ((originalPrice - currentPrice) / originalPrice * 100).toFixed(0) : 0;

              return {
                product: p.title || p.name || "Product",
                original: `$${originalPrice.toFixed(2)}`,
                current: p.bestPrice || `$${currentPrice.toFixed(2)}`,
                discount: `${discount}%`,
                store: p.source || p.bestStore || "Online",
                hot: parseInt(discount) >= 25,
              };
            })
            .sort((a, b) => parseInt(b.discount) - parseInt(a.discount))
            .slice(0, 20);

          setDeals(calculatedDeals);
        }
      } catch (err) {
        console.error("Failed to fetch deals:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  const activeDeals = deals.length;
  const hotDeals = deals.filter((d) => d.hot).length;
  const avgDiscount = deals.length
    ? (deals.reduce((sum, d) => sum + parseInt(d.discount), 0) / deals.length).toFixed(0)
    : 0;

  return (
    <div className="admin-page">
      <div>
        <h2 className="admin-page-title">Deals Management</h2>
        <p className="admin-page-subtitle">
          View and monitor price drops and discounts from tracked products.
        </p>
      </div>

      <div className="kpi-grid">
        {[
          { label: "Active Deals", val: `${activeDeals}`, color: "var(--success)" },
          { label: "Hot Deals (25%+)", val: `${hotDeals}`, color: "var(--danger)" },
          { label: "Avg Discount", val: `${avgDiscount}%`, color: "var(--primary)" },
          { label: "Products Tracked", val: `${deals.length}`, color: "var(--info)" },
        ].map((s, idx) => (
          <div key={idx} className={`card admin-fade-in-delay-${idx + 1}`} style={{ padding: 16 }}>
            <div className="kpi-label">{s.label}</div>
            <div className="kpi-value" style={{ color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h3 className="card-title" style={{ marginBottom: 16 }}>Active Deal Listings</h3>
        {loading ? (
          <div className="table-empty">Loading deals...</div>
        ) : deals.length === 0 ? (
          <div className="table-empty">No deals found. Fetch products first.</div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>ORIGINAL</th>
                  <th>CURRENT</th>
                  <th>DISCOUNT</th>
                  <th>STORE</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((d, idx) => (
                  <tr key={idx}>
                    <td className="deal-product-cell">
                      {d.hot && <span className="badge badge-danger" style={{ fontSize: 7, marginRight: 6 }}>HOT</span>}
                      <span className="deal-product-name">{d.product}</span>
                    </td>
                    <td className="deal-original">{d.original}</td>
                    <td className="deal-current">{d.current}</td>
                    <td>
                      <span className="badge badge-success" style={{ fontSize: 9 }}>{d.discount} OFF</span>
                    </td>
                    <td className="text-secondary">{d.store}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


    </div>
  );
}
