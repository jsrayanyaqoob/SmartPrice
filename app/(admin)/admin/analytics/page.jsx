"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#6b33f6", "#3b5bdb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

export default function AnalyticsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Page-view audit log
    fetch("/api/admin/audit-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "page_view", entity: "analytics", details: "Viewed Analytics page" }),
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

  const totalProducts = products.length;
  const avgPrice = totalProducts
    ? products.reduce((sum, p) => {
        const price = typeof p.price === "number" ? p.price : parseFloat(p.price) || 0;
        return sum + price;
      }, 0) / totalProducts
    : 0;

  // Category breakdown
  const categoryCounts = {};
  products.forEach((p) => {
    const cat = p.category || "General";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const categories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  const categoryChartData = categories.slice(0, 8).map(([name, value]) => ({ name, value }));

  // Brand breakdown
  const brandCounts = {};
  products.forEach((p) => {
    const brand = p.brand || "Unknown";
    brandCounts[brand] = (brandCounts[brand] || 0) + 1;
  });
  const topBrands = Object.entries(brandCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const brandChartData = topBrands.map(([name, value]) => ({ name, value }));

  // Price ranges
  const ranges = [
    { name: "Under $50", count: 0 },
    { name: "$50 - $200", count: 0 },
    { name: "$200 - $500", count: 0 },
    { name: "$500+", count: 0 },
  ];
  products.forEach((p) => {
    const price = typeof p.price === "number" ? p.price : parseFloat(p.price) || 0;
    if (price < 50) ranges[0].count++;
    else if (price < 200) ranges[1].count++;
    else if (price < 500) ranges[2].count++;
    else ranges[3].count++;
  });
  const priceChartData = ranges.map((r) => ({ name: r.name, count: r.count }));

  // Store breakdown
  const storeCounts = {};
  products.forEach((p) => {
    const store = p.source || p.bestStore || "Online";
    storeCounts[store] = (storeCounts[store] || 0) + 1;
  });
  const topStores = Object.entries(storeCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const storeChartData = topStores.map(([name, value]) => ({ name, value }));

  return (
    <div className="admin-page">
      <div>
        <h2 className="admin-page-title">Analytics</h2>
        <p className="admin-page-subtitle">
          Visualized product data with real-time charts and breakdowns.
        </p>
      </div>

      {loading ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
          Loading analytics...
        </div>
      ) : totalProducts === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
          No product data available. Fetch products first.
        </div>
      ) : (
        <>
          {/* Metric Cards */}
          <div className="kpi-grid">
            <div className="card admin-fade-in-delay-1" style={{ padding: 16 }}>
              <div className="kpi-label">Total Products</div>
              <div className="kpi-value">{totalProducts}</div>
              <div className="kpi-sub">In database</div>
            </div>
            <div className="card admin-fade-in-delay-2" style={{ padding: 16 }}>
              <div className="kpi-label">Categories</div>
              <div className="kpi-value">{categories.length}</div>
              <div className="kpi-sub">{categories[0]?.[0] || "N/A"} leading</div>
            </div>
            <div className="card admin-fade-in-delay-3" style={{ padding: 16 }}>
              <div className="kpi-label">Avg Price</div>
              <div className="kpi-value">${avgPrice.toFixed(2)}</div>
              <div className="kpi-sub">Across all products</div>
            </div>
            <div className="card admin-fade-in-delay-4" style={{ padding: 16 }}>
              <div className="kpi-label">Stores</div>
              <div className="kpi-value">{Object.keys(storeCounts).length}</div>
              <div className="kpi-sub">{topStores[0]?.[0] || "N/A"} top source</div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="analytics-grid">
            {/* Category Bar Chart */}
            <div className="card admin-fade-in" style={{ padding: 20 }}>
              <h3 className="card-title" style={{ marginBottom: 16 }}>Categories</h3>
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={Math.max(200, categoryChartData.length * 40)}>
                  <BarChart data={categoryChartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Bar dataKey="value" fill="#6b33f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 20 }}>No data</div>
              )}
            </div>

            {/* Price Distribution Pie Chart */}
            <div className="card admin-fade-in-delay-1" style={{ padding: 20 }}>
              <h3 className="card-title" style={{ marginBottom: 16 }}>Price Distribution</h3>
              {priceChartData.some((d) => d.count > 0) ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={priceChartData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      paddingAngle={3}
                    >
                      {priceChartData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 20 }}>No data</div>
              )}
            </div>

            {/* Top Brands Bar Chart */}
            <div className="card admin-fade-in-delay-2" style={{ padding: 20 }}>
              <h3 className="card-title" style={{ marginBottom: 16 }}>Top Brands</h3>
              {brandChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={Math.max(180, brandChartData.length * 40)}>
                  <BarChart data={brandChartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Bar dataKey="value" fill="#3b5bdb" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 20 }}>No data</div>
              )}
            </div>

            {/* Store Sources Pie Chart */}
            <div className="card admin-fade-in-delay-3" style={{ padding: 20 }}>
              <h3 className="card-title" style={{ marginBottom: 16 }}>Store Sources</h3>
              {storeChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={storeChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      paddingAngle={3}
                    >
                      {storeChartData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[(idx + 2) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 20 }}>No data</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
