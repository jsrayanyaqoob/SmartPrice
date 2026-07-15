"use client";

import { useState } from "react";

export default function WishlistPage() {
  const [selectedItems, setSelectedItems] = useState([2]); // Card 2 Bose checked by default
  const [activeFilter, setActiveFilter] = useState("All Items");

  const toggleSelect = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((item) => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
      {/* Main Grid Content */}
      <div>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px", color: "var(--text-primary)" }}>
              My Wishlist
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
              Curated products tracking for the perfect moment to buy.
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em" }}>
              TOTAL POTENTIAL SAVINGS
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "var(--primary)" }}>
              $1,240.00 <span style={{ fontSize: 18, fontWeight: 500 }}>📉</span>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {["All Items", "Price Drops", "Recently Added", "Highest Discount"].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`btn btn-sm ${activeFilter === f ? "btn-primary" : "btn-ghost"}`}
                style={{ borderRadius: "var(--radius-full)" }}
              >
                {f}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost btn-sm">Share Wishlist</button>
            <button className="btn btn-ghost btn-sm">Compare Selected</button>
          </div>
        </div>

        {/* Selected Items Action Toolbar */}
        {selectedItems.length > 0 && (
          <div
            className="card animate-fade-up"
            style={{
              padding: "10px 18px",
              background: "var(--primary-light)",
              border: "1px solid var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 18,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>
              {selectedItems.length} item{selectedItems.length > 1 ? "s" : ""} selected
            </span>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}
              >
                Delete
              </button>
              <button
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}
              >
                Move to Alerts
              </button>
              <button className="btn btn-primary btn-sm" style={{ padding: "6px 14px" }}>
                Add to Cart
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {/* Product Card 1 */}
          <div className="card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
            <input
              type="checkbox"
              checked={selectedItems.includes(1)}
              onChange={() => toggleSelect(1)}
              style={{ position: "absolute", top: 14, left: 14, zIndex: 10, width: 16, height: 16, accentColor: "var(--primary)" }}
            />
            <div
              style={{
                height: 180,
                borderRadius: 10,
                background: "var(--bg-surface-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 60,
                position: "relative",
              }}
            >
              <span className="badge badge-danger" style={{ position: "absolute", top: 8, right: 8 }}>
                35% OFF
              </span>
              📷
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase" }}>
                SONY IMAGING
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: "2px 0 6px" }}>Alpha a7 IV Mirrorless</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 700 }}>$1,698.00</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "line-through" }}>$2,499.00</span>
              </div>
              <div
                style={{
                  background: "#eff6ff",
                  padding: "6px 10px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--info)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                ⚡ Match Score: 98% (Best time to buy)
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: "auto" }}>
              <button className="btn btn-ghost btn-sm" style={{ padding: "8px 0" }}>Set Alert</button>
              <button className="btn btn-ghost btn-sm" style={{ padding: "8px 0" }}>View Details</button>
            </div>
          </div>

          {/* Product Card 2 */}
          <div className="card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
            <input
              type="checkbox"
              checked={selectedItems.includes(2)}
              onChange={() => toggleSelect(2)}
              style={{ position: "absolute", top: 14, left: 14, zIndex: 10, width: 16, height: 16, accentColor: "var(--primary)" }}
            />
            <div
              style={{
                height: 180,
                borderRadius: 10,
                background: "var(--bg-surface-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 60,
                position: "relative",
              }}
            >
              <span className="badge badge-success" style={{ position: "absolute", top: 8, right: 8 }}>
                STABLE PRICE
              </span>
              🎧
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase" }}>
                BOSE
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: "2px 0 6px" }}>QuietComfort Ultra</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 700 }}>$379.00</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "line-through" }}>$429.00</span>
              </div>
              <div
                style={{
                  background: "var(--bg-surface-2)",
                  padding: "6px 10px",
                  borderRadius: 6,
                  fontSize: 11,
                  color: "var(--text-secondary)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                ℹ️ Price Drop expected in 14 days
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: "auto" }}>
              <button className="btn btn-ghost btn-sm" style={{ padding: "8px 0" }}>Set Alert</button>
              <button className="btn btn-ghost btn-sm" style={{ padding: "8px 0" }}>View Details</button>
            </div>
          </div>

          {/* Product Card 3 */}
          <div className="card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
            <input
              type="checkbox"
              checked={selectedItems.includes(3)}
              onChange={() => toggleSelect(3)}
              style={{ position: "absolute", top: 14, left: 14, zIndex: 10, width: 16, height: 16, accentColor: "var(--primary)" }}
            />
            <div
              style={{
                height: 180,
                borderRadius: 10,
                background: "var(--bg-surface-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 60,
                position: "relative",
              }}
            >
              <span className="badge badge-danger" style={{ position: "absolute", top: 8, right: 8 }}>
                42% OFF
              </span>
              🖥️
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--primary)", textTransform: "uppercase" }}>
                DELL
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: "2px 0 6px" }}>34&quot; Curved Monitor</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 700 }}>$549.99</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "line-through" }}>$949.99</span>
              </div>
              <div
                style={{
                  background: "var(--primary-light)",
                  padding: "6px 10px",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--primary)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                ⚡ All-time Low Reached
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: "auto" }}>
              <button className="btn btn-ghost btn-sm" style={{ padding: "8px 0" }}>Set Alert</button>
              <button className="btn btn-ghost btn-sm" style={{ padding: "8px 0" }}>View Details</button>
            </div>
          </div>

          {/* Add New Product Card */}
          <div
            className="card"
            style={{
              padding: 24,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              border: "2px dashed var(--border)",
              background: "transparent",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "var(--primary-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                color: "var(--primary)",
              }}
            >
              +
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Add New Product</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                Paste a URL to track pricing
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar Columns */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Wishlist Insights */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span>✨</span>
            <h4 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Wishlist Insights</h4>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)", marginBottom: 4 }}>
                Buy Now Advice
              </div>
              <p style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5, margin: "0 0 6px" }}>
                3 items in your wishlist are currently at their historic lowest prices ever recorded.
              </p>
              <span style={{ fontSize: 11, color: "var(--primary)", fontWeight: 600, cursor: "pointer" }}>
                View these items &rarr;
              </span>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                Price Pattern Detected
              </div>
              <p style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                Electronic accessories often drop by ~15% during the last week of the month. Consider waiting on your cable orders.
              </p>
            </div>

            <div
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: 12,
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                textAlign: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 9, color: "var(--text-muted)" }}>HEALTH</div>
                <div style={{ fontWeight: 700, color: "var(--success)" }}>A+</div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: "var(--text-muted)" }}>AVG. DISC.</div>
                <div style={{ fontWeight: 700 }}>22%</div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: "var(--text-muted)" }}>TRACKED</div>
                <div style={{ fontWeight: 700 }}>12</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trending For You */}
        <div className="card" style={{ padding: 16 }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Trending For You</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { name: "Series 9 Smartwatch", price: "$329.00", off: "18% off", icon: "⌚" },
              { name: "Portable Espresso", price: "$89.50", off: "New", icon: "☕" },
              { name: "Heritage Duffle", price: "$210.00", off: "25% off", icon: "💼" },
            ].map((t, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: "var(--bg-surface-2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                  }}
                >
                  {t.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                    {t.price} •{" "}
                    <span style={{ color: t.off === "New" ? "var(--info)" : "var(--danger)", fontWeight: 600 }}>
                      {t.off}
                    </span>
                  </div>
                </div>
                <button
                  style={{
                    border: "none",
                    background: "var(--bg-surface-2)",
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  +
                </button>
              </div>
            ))}
          </div>
          <button
            className="btn btn-ghost btn-sm"
            style={{ width: "100%", height: 32, marginTop: 14, fontSize: 11, padding: 0 }}
          >
            Explore All Trending
          </button>
        </div>
      </div>
    </div>
  );
}
