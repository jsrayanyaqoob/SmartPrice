const retailers = [
  { name: "Amazon", price: "$298.00", inStock: true, badge: "BEST PRICE", letter: "A" },
  { name: "Walmart", price: "$349.99", inStock: true, badge: null, letter: "W" },
  { name: "Best Buy", price: "$399.00", inStock: false, badge: null, letter: "B" },
];

export default function LiveComparison() {
  return (
    <section style={{ padding: "80px 0", background: "var(--bg-app)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          {/* Product Image - Real product image */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div
              style={{
                width: 320,
                height: 320,
                borderRadius: 24,
                overflow: "hidden",
                position: "relative",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop"
                alt="Sony WH-1000XM5"
                loading="lazy"
                decoding="async"
                className="comparison-product-img"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              {/* Gradient overlay */}
              <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.2), transparent)",
              }} />
              {/* Price tag */}
              <div style={{
                position: "absolute",
                bottom: 16,
                left: 16,
                background: "white",
                padding: "6px 14px",
                borderRadius: "var(--radius-full)",
                fontWeight: 700,
                fontSize: 14,
                color: "var(--primary)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}>
                From $249
              </div>
            </div>
          </div>

          {/* Comparison Table */}
          <div>
            <div className="section-label">LIVE COMPARISON</div>
            <h2 className="heading-2" style={{ marginBottom: 24 }}>Sony WH-1000XM5</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
              {retailers.map((r) => (
                <div
                  key={r.name}
                  className="card"
                  style={{
                    padding: "14px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    border: r.badge ? "2px solid var(--primary)" : "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: r.badge ? "var(--primary)" : "var(--bg-surface-2)",
                      color: r.badge ? "white" : "var(--text-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {r.letter}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {r.inStock ? "In Stock • Fast Delivery" : "Out of Stock"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>{r.price}</div>
                    {r.badge && (
                      <span className="badge badge-success" style={{ fontSize: 9 }}>{r.badge}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Price History Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Price History (30 Days)</span>
              <span style={{ fontSize: 12, color: "var(--danger)", fontWeight: 600 }}>Lowest Ever: $249</span>
            </div>
            <div style={{ display: "flex", gap: 4, height: 40, alignItems: "flex-end" }}>
              {[60, 55, 65, 50, 70, 80, 90, 75, 95, 85].map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${h}%`,
                    borderRadius: 4,
                    background: i >= 7 ? "var(--primary)" : "var(--primary-light)",
                    transition: "height 0.3s ease",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          section > div > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
