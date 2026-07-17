"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export default function PriceAlertsPage() {
  useEffect(() => { document.title = "Price Alerts - SmartPrice"; document.querySelector('meta[name="description"]')?.setAttribute('content', 'Manage your SmartPrice price alerts. Set target prices, track products, and get notified when prices drop.'); }, []);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [productUrl, setProductUrl] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [trackMessage, setTrackMessage] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);

  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/alerts");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleDelete = async (alertId) => {
    try {
      const res = await fetch("/api/alerts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId }),
      });
      if (res.ok) {
        setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrackProduct = async () => {
    const input = productUrl.trim();
    if (!input || !targetPrice) return;

    setTrackLoading(true);
    setTrackMessage("");

    try {
      // Check if it's a direct image URL (not a product page)
      if (/^https?:\/\/.*\.(jpg|jpeg|png|gif|webp|avif)(\?.*)?$/i.test(input)) {
        setTrackMessage("That looks like a direct image URL. To track a product, paste the product page URL or the product name instead.");
        setTrackLoading(false);
        return;
      }

      let productId = input;

      // If it looks like a URL, try to extract product ID
      if (input.startsWith("http") || input.includes("/products/")) {
        const match = input.match(/\/products\/([^\/?#]+)/);
        if (match) productId = match[1];
      }

      // Try to find the product by ID first
      let productRes = await fetch(`/api/products?q=${encodeURIComponent(productId)}&limit=1`);
      let productData = await productRes.json();
      let foundProduct = productData.products?.[0];

      // If not found by search, list all and search client-side
      if (!foundProduct) {
        const allRes = await fetch("/api/products");
        const allData = await allRes.json();
        const products = allData.products || [];
        foundProduct = products.find(
          (p) =>
            p.id === productId ||
            p.title?.toLowerCase().includes(productId.toLowerCase()) ||
            p.name?.toLowerCase().includes(productId.toLowerCase())
        );
      }

      if (!foundProduct) {
        setTrackMessage("No product found with that ID or name. Browse products to find what you're looking for.");
        setTrackLoading(false);
        return;
      }

      // Create the alert via API
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: foundProduct.id,
          targetPrice: parseFloat(targetPrice),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create alert");

      setTrackMessage(`✅ Alert set for "${foundProduct.title || foundProduct.name}" at $${parseFloat(targetPrice).toFixed(2)}!`);
      setProductUrl("");
      setTargetPrice("");
      fetchAlerts(); // Refresh the alerts list
    } catch (err) {
      setTrackMessage(err.message || "Failed to create alert. Make sure you are logged in.");
    } finally {
      setTrackLoading(false);
    }
  };

  const handleStatusChange = async (alertId, newStatus) => {
    try {
      const res = await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId, status: newStatus }),
      });
      if (res.ok) {
        setAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? { ...a, status: newStatus } : a))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
      {/* Left — Alert List */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px", color: "var(--text-primary)" }}>
              Price Alerts
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
              Manage your tracked items and price drop notifications.
            </p>
          </div>
          <button className="btn btn-primary btn-sm" style={{ borderRadius: "var(--radius-full)" }} onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? "Cancel" : "+ Create New"}
          </button>
        </div>

        {/* Create Alert Form */}
        {showCreate && (
          <div className="card" style={{ padding: 18, marginBottom: 20, border: "2px solid var(--primary)" }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px" }}>Set a New Price Alert</h4>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 12px" }}>
              Enter a product ID, title, or URL and a target price to start tracking.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  type="text"
                  placeholder="Product ID, title, or paste a URL..."
                  className="input"
                  value={productUrl}
                  onChange={(e) => { setProductUrl(e.target.value); setTrackMessage(""); }}
                  style={{ flex: 1, height: 38, fontSize: 13 }}
                />
                <div style={{ position: "relative", width: 130 }}>
                  <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--text-muted)", fontWeight: 600, zIndex: 1 }}>$</span>
                  <input
                    type="number"
                    placeholder="Target"
                    className="input"
                    value={targetPrice}
                    onChange={(e) => { setTargetPrice(e.target.value); setTrackMessage(""); }}
                    style={{ height: 38, fontSize: 13, paddingLeft: 24, width: "100%" }}
                  />
                </div>
              </div>
              <button
                className="btn btn-primary btn-sm"
                disabled={!productUrl.trim() || !targetPrice || trackLoading}
                onClick={handleTrackProduct}
                style={{ height: 36 }}
              >
                {trackLoading ? "Tracking..." : "Track Product"}
              </button>
              {trackMessage && (
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: trackMessage.includes("✅") ? "var(--success)" : "var(--danger)",
                    padding: "8px 12px",
                    borderRadius: 6,
                    background: trackMessage.includes("✅") ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                  }}
                >
                  {trackMessage}
                </div>
              )}
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
              Tip: Browse{" "}
              <a href="/products" style={{ color: "var(--primary)", fontWeight: 600 }}>
                trending products
              </a>{" "}
              and use the &quot;Set Alert&quot; button on any product page.
            </p>
          </div>
        )}

        <h3 className="heading-3" style={{ marginBottom: 14 }}>
          {loading ? "Loading..." : `${alerts.length} Active Alert${alerts.length !== 1 ? "s" : ""}`}
        </h3>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card" style={{ padding: 20, display: "flex", gap: 16 }}>
                <Skeleton width={72} height={72} borderRadius={8} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Skeleton width={80} height={20} borderRadius={999} />
                    <Skeleton width={100} height={14} />
                  </div>
                  <Skeleton height={18} width="60%" />
                  <div style={{ display: "flex", gap: 28 }}>
                    <Skeleton width={60} height={20} />
                    <Skeleton width={60} height={20} />
                    <Skeleton width={60} height={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
            <h3 style={{ margin: "0 0 6px", color: "var(--text-primary)", fontWeight: 700 }}>No alerts yet</h3>
            <p style={{ margin: 0, fontSize: 13 }}>
              Set your first price alert to start tracking deals.
            </p>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => setShowCreate(true)}>
              + Create Alert
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {alerts.map((alert) => (
              <div key={alert.id} className="card" style={{ padding: 20, display: "flex", gap: 16 }}>
                {alert.product?.imageUrl ? (
                  <img
                    src={alert.product.imageUrl}
                    alt={alert.product.title}
                    loading="lazy"
                    decoding="async"
                    style={{ width: 72, height: 72, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                  />
                ) : (
                  <div style={{ width: 72, height: 72, borderRadius: 8, background: "var(--bg-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
                    {alert.status === "REACHED" ? "✅" : "🎯"}
                  </div>
                )}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span className={`badge ${alert.status === "REACHED" ? "badge-success" : alert.status === "EXPIRED" ? "badge-danger" : "badge-primary"}`}>
                        {alert.status === "ACTIVE" ? "WATCHING" : alert.status}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        Created {new Date(alert.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
                      {alert.product?.title || alert.product?.name || "Unknown Product"}
                    </h4>
                  </div>
                  <div style={{ display: "flex", gap: 28, marginTop: 8 }}>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>CURRENT</div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>
                        ${alert.currentPrice?.toFixed(2) || "—"}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>TARGET</div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: "var(--primary)" }}>
                        ${alert.targetPrice?.toFixed(2) || "—"}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>DIFFERENCE</div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: alert.currentPrice <= alert.targetPrice ? "var(--success)" : "var(--text-secondary)" }}>
                        {alert.currentPrice ? `${alert.currentPrice <= alert.targetPrice ? "-" : "+"}$${Math.abs(alert.currentPrice - alert.targetPrice).toFixed(2)}` : "—"}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
                  {alert.status === "ACTIVE" ? (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 11, padding: "4px 8px" }}
                      onClick={() => handleStatusChange(alert.id, "EXPIRED")}
                    >
                      Pause
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: 11, padding: "4px 8px" }}
                      onClick={() => handleStatusChange(alert.id, "ACTIVE")}
                    >
                      Resume
                    </button>
                  )}
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 11, padding: "4px 8px", color: "var(--danger)" }}
                    onClick={() => handleDelete(alert.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 12 }}>
          <div className="card" style={{ padding: 16 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)" }}>TOTAL ALERTS</span>
            <div style={{ fontSize: 24, fontWeight: 700, color: "var(--primary)", marginTop: 4 }}>{alerts.length}</div>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)" }}>ACTIVE NOW</span>
            <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginTop: 4 }}>
              {alerts.filter((a) => a.status === "ACTIVE").length}
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px" }}>Quick Stats</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Reached", value: alerts.filter((a) => a.status === "REACHED").length, color: "var(--success)" },
              { label: "Active", value: alerts.filter((a) => a.status === "ACTIVE").length, color: "var(--primary)" },
              { label: "Expired", value: alerts.filter((a) => a.status === "EXPIRED").length, color: "var(--text-muted)" },
            ].map((s) => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{s.label}</div>
                <span style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Alerts by Store</h4>
          <div style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>
            Store breakdown coming soon.
          </div>
        </div>
      </div>
    </div>
  );
}
