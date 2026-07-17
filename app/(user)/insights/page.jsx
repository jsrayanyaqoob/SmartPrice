"use client";

import { useState, useEffect } from "react";
import { Sparkles, TrendingUp, DollarSign, Bell, Star, ShoppingBag, BarChart3, Activity } from "lucide-react";

export default function InsightsPage() {
  useEffect(() => { document.title = "Insights - SmartPrice"; document.querySelector('meta[name="description"]')?.setAttribute('content', 'SmartPrice consumer insights and analytics. Get real-time analysis across products, categories, price trends, and market data.'); }, []);
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Categories");

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [prodRes, wishRes, alertRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/wishlist"),
          fetch("/api/alerts"),
        ]);
        const prodData = await prodRes.json();
        const wishData = await wishRes.json();
        const alertData = await alertRes.json();
        setProducts(prodData.products || []);
        setWishlist(wishData.wishlist || []);
        setAlerts(alertData.alerts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  // Real calculations
  const totalProducts = products.length;
  const wishlistCount = wishlist.length;
  const activeAlerts = alerts.filter((a) => a.status === "ACTIVE").length;
  const reachedAlerts = alerts.filter((a) => a.status === "REACHED").length;

  // Calculate average discount
  const averageDiscount = (() => {
    let totalDiscount = 0;
    let count = 0;
    products.forEach((p) => {
      const bestPrice = p.bestPrice ? parseFloat(p.bestPrice.replace(/[^0-9.]/g, "")) : null;
      const origPrice = p.originalPrice ? parseFloat(p.originalPrice.replace(/[^0-9.]/g, "")) : null;
      if (bestPrice && origPrice && origPrice > 0) {
        totalDiscount += (1 - bestPrice / origPrice) * 100;
        count++;
      }
    });
    return count > 0 ? (totalDiscount / count).toFixed(1) : 0;
  })();

  // Category analysis
  const categoryData = {};
  products.forEach((p) => {
    const cat = p.category || "General";
    if (!categoryData[cat]) categoryData[cat] = { count: 0, totalPrice: 0, items: [] };
    categoryData[cat].count++;
    const price = parseFloat(p.bestPrice?.replace(/[^0-9.]/g, "") || 0) || 0;
    categoryData[cat].totalPrice += price;
    categoryData[cat].items.push(p);
  });
  const categories = Object.entries(categoryData).sort((a, b) => b[1].count - a[1].count);
  const maxCatCount = categories.length > 0 ? Math.max(...categories.map((c) => c[1].count)) : 1;

  // Brand analysis
  const brandCounts = {};
  products.forEach((p) => {
    const brand = p.brand || "Unknown";
    brandCounts[brand] = (brandCounts[brand] || 0) + 1;
  });
  const topBrand = Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  // Store analysis
  const storeCounts = {};
  products.forEach((p) => {
    const store = p.source || p.retailers || "Online";
    storeCounts[store] = (storeCounts[store] || 0) + 1;
  });
  const topStore = Object.entries(storeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  // Price range distribution
  const priceRanges = [
    { label: "Under $50", min: 0, max: 50, count: 0 },
    { label: "$50-$200", min: 50, max: 200, count: 0 },
    { label: "$200-$500", min: 200, max: 500, count: 0 },
    { label: "$500+", min: 500, max: Infinity, count: 0 },
  ];
  products.forEach((p) => {
    const price = parseFloat(p.bestPrice?.replace(/[^0-9.]/g, "") || 0) || 0;
    const range = priceRanges.find((r) => price >= r.min && price < r.max);
    if (range) range.count++;
  });
  const maxRangeCount = Math.max(...priceRanges.map((r) => r.count), 1);

  const kpis = [
    { label: "Total Products", value: totalProducts.toString(), sub: "in database", icon: ShoppingBag, color: "var(--primary)" },
    { label: "Active Alerts", value: activeAlerts.toString(), sub: `${reachedAlerts} triggers reached`, icon: Bell, color: "var(--primary)" },
    { label: "Wishlist Items", value: wishlistCount.toString(), sub: `${wishlistCount > 0 ? "tracked" : "add some"}`, icon: Star, color: "var(--info)" },
    { label: "Avg. Discount", value: `${averageDiscount}%`, sub: "across all products", icon: TrendingUp, color: "var(--success)" },
    { label: "Categories", value: categories.length.toString(), sub: `top: ${categories[0]?.[0] || "N/A"}`, icon: BarChart3, color: "var(--warning)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px", color: "var(--text-primary)" }}>
            Consumer Insights
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
            {loading ? "Analyzing data..." : `Real-time analysis across ${totalProducts} products and ${categories.length} categories.`}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: 60, textAlign: "center", color: "var(--text-muted)" }}>
          Loading insights...
        </div>
      ) : (
        <>
          {/* KPI Cards Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
            {kpis.map((kpi, idx) => {
              const IconComponent = kpi.icon;
              return (
                <div key={idx} className="card" style={{ padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: `${kpi.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: kpi.color }}>
                      <IconComponent size={14} />
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                      {kpi.label}
                    </div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>
                    {kpi.value}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--success)", fontWeight: 500 }}>{kpi.sub}</div>
                </div>
              );
            })}
          </div>

          {/* Main Insights Panel Split */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
            {/* Left Side Strategy Panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Personalized Strategy Card */}
              <div
                className="card"
                style={{
                  padding: 20,
                  background: "var(--brand-gradient)",
                  color: "white",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div>
                  <span className="badge" style={{ background: "rgba(255,255,255,0.2)", color: "white", fontSize: 9 }}>
                    <Sparkles size={12} style={{ display: "inline", marginRight: 4 }} /> MARKET OVERVIEW
                  </span>
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: "10px 0 6px" }}>
                    {categories.length > 0 ? `Top category: ${categories[0]?.[0] || "Shopping"}` : "Start exploring products"}
                  </h3>
                  <p style={{ fontSize: 12, opacity: 0.9, lineHeight: 1.5, margin: 0 }}>
                    {totalProducts > 0
                      ? `${categories[0]?.[0] || "Products"} has ${categoryData[categories[0]?.[0]]?.count || 0} items with an avg price of $${(categoryData[categories[0]?.[0]]?.totalPrice / (categoryData[categories[0]?.[0]]?.count || 1)).toFixed(2)}.`
                      : "No products loaded yet. Check back after fetching deals."}
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12 }}>
                  {totalProducts > 0 && (
                    <>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <DollarSign size={14} />
                        <span>Average discount across products: <strong>{averageDiscount}%</strong></span>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <ShoppingBag size={14} />
                        <span>Top brand: <strong>{topBrand}</strong> | Top store: <strong>{topStore}</strong></span>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <Activity size={14} />
                        <span>{activeAlerts > 0 ? `${activeAlerts} active price alerts monitoring deals.` : "Set price alerts to track drops."}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Price Distribution */}
              <div className="card" style={{ padding: 20 }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 14px" }}>Price Distribution</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {priceRanges.map((range) => (
                    <div key={range.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                        <span style={{ fontWeight: 500 }}>{range.label}</span>
                        <span style={{ fontWeight: 600, color: "var(--primary)" }}>{range.count} items</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 4, background: "var(--bg-surface-2)" }}>
                        <div
                          style={{
                            height: "100%",
                            borderRadius: 4,
                            width: `${(range.count / maxRangeCount) * 100}%`,
                            background: range.count > 0 ? "var(--primary)" : "transparent",
                            transition: "width 0.6s ease",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side Graph & Timeline Panel */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Category Breakdown Chart */}
              <div className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Category Breakdown</h3>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["Categories", "Brands", "Stores"].map((tab) => (
                      <span
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "4px 10px",
                          borderRadius: 4,
                          background: activeTab === tab ? "var(--primary-light)" : "transparent",
                          color: activeTab === tab ? "var(--primary)" : "var(--text-secondary)",
                          cursor: "pointer",
                        }}
                      >
                        {tab}
                      </span>
                    ))}
                  </div>
                </div>

                {activeTab === "Categories" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {categories.slice(0, 6).map(([cat, data]) => (
                      <div key={cat}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                          <span style={{ fontWeight: 500 }}>{cat}</span>
                          <span style={{ fontWeight: 600 }}>{data.count} items</span>
                        </div>
                        <div style={{ height: 8, borderRadius: 4, background: "var(--bg-surface-2)" }}>
                          <div
                            style={{
                              height: "100%",
                              borderRadius: 4,
                              width: `${(data.count / maxCatCount) * 100}%`,
                              background: "var(--primary)",
                              transition: "width 0.6s ease",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    {categories.length === 0 && (
                      <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: 20 }}>No categories found.</div>
                    )}
                  </div>
                )}

                {activeTab === "Brands" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {Object.entries(brandCounts)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 6)
                      .map(([brand, count]) => (
                        <div key={brand}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                            <span style={{ fontWeight: 500 }}>{brand}</span>
                            <span style={{ fontWeight: 600 }}>{count} items</span>
                          </div>
                          <div style={{ height: 8, borderRadius: 4, background: "var(--bg-surface-2)" }}>
                            <div
                              style={{
                                height: "100%",
                                borderRadius: 4,
                                width: `${(count / Math.max(...Object.values(brandCounts))) * 100}%`,
                                background: "var(--brand-purple)",
                                transition: "width 0.6s ease",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    {Object.keys(brandCounts).length === 0 && (
                      <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: 20 }}>No brand data available.</div>
                    )}
                  </div>
                )}

                {activeTab === "Stores" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {Object.entries(storeCounts)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 6)
                      .map(([store, count]) => (
                        <div key={store}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                            <span style={{ fontWeight: 500 }}>{store}</span>
                            <span style={{ fontWeight: 600 }}>{count} items</span>
                          </div>
                          <div style={{ height: 8, borderRadius: 4, background: "var(--bg-surface-2)" }}>
                            <div
                              style={{
                                height: "100%",
                                borderRadius: 4,
                                width: `${(count / Math.max(...Object.values(storeCounts))) * 100}%`,
                                background: "var(--warning)",
                                transition: "width 0.6s ease",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    {Object.keys(storeCounts).length === 0 && (
                      <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: 20 }}>No store data available.</div>
                    )}
                  </div>
                )}
              </div>

              {/* Metrics Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#d1fae5", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700 }}>
                      %
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Average Discount</div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{averageDiscount}% applied</div>
                    </div>
                  </div>
                  <div className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700 }}>
                      <TrendingUp size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Total Items Tracked</div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{totalProducts + wishlistCount} products</div>
                    </div>
                  </div>
                </div>

                {/* Shopping DNA */}
                <div className="card" style={{ padding: 18 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 12px" }}>Top Categories</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {categories.slice(0, 4).map(([cat, data], idx) => {
                      const colors = ["var(--primary)", "var(--brand-blue)", "var(--warning)", "var(--success)"];
                      return (
                        <div key={cat}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}>
                            <span style={{ fontWeight: 500 }}>{cat}</span>
                            <span style={{ fontWeight: 600 }}>
                              {totalProducts > 0 ? Math.round((data.count / totalProducts) * 100) : 0}%
                            </span>
                          </div>
                          <div style={{ height: 6, borderRadius: 3, background: "var(--bg-surface-2)" }}>
                            <div
                              style={{
                                height: "100%",
                                borderRadius: 3,
                                width: `${totalProducts > 0 ? (data.count / totalProducts) * 100 : 0}%`,
                                background: colors[idx % colors.length],
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    {categories.length === 0 && (
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>No data yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shopping Activity */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Shopping Activity</h3>
              <div style={{ height: 160, position: "relative" }}>
                <svg width="100%" height="100%" viewBox="0 0 400 120" preserveAspectRatio="none">
                  <path
                    d="M0,80 Q50,40 100,60 T200,90 T300,20 T400,70"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="3"
                  />
                  <path
                    d="M0,90 Q50,60 100,80 T200,100 T300,50 T400,90"
                    fill="none"
                    stroke="var(--brand-blue)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", marginTop: 12 }}>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card" style={{ padding: 18 }}>
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Quick Stats</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 18, opacity: 0.6 }}>
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)" }}>Total Products</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{totalProducts} in database</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 18, opacity: 0.6 }}>
                    <Bell size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)" }}>Active Alerts</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{activeAlerts} monitoring prices</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ fontSize: 18, opacity: 0.6 }}>
                    <Star size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)" }}>Wishlist Items</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{wishlistCount} saved</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
