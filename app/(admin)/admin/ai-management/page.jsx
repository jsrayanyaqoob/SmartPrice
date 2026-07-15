"use client";

export default function AIManagementPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px" }}>AI Management</h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
          Configure and monitor the neural price prediction engine.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* AI Status */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Model Status</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { name: "Price Prediction Model", version: "v3.2.1", accuracy: 94.2, status: "Active" },
              { name: "Trend Analysis Engine", version: "v2.8.0", accuracy: 89.7, status: "Active" },
              { name: "Deal Detector", version: "v1.5.4", accuracy: 91.5, status: "Active" },
              { name: "Demand Forecaster", version: "v2.1.0", accuracy: 86.3, status: "Training" },
            ].map((m, idx) => (
              <div key={idx} style={{ padding: 12, background: "var(--bg-surface-2)", borderRadius: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{m.version}</div>
                  </div>
                  <span
                    className={m.status === "Active" ? "badge badge-success" : "badge badge-primary"}
                    style={{ fontSize: 8 }}
                  >
                    {m.status}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--border)" }}>
                    <div style={{ height: "100%", borderRadius: 3, width: `${m.accuracy}%`, background: m.status === "Active" ? "var(--success)" : "var(--warning)" }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700 }}>{m.accuracy}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Config */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Configuration</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { label: "Prediction Confidence Threshold", value: "85%" },
              { label: "Price Check Interval", value: "Every 60s" },
              { label: "Max Tracked Items (Free)", value: "10 products" },
              { label: "Max Tracked Items (Pro)", value: "Unlimited" },
              { label: "Alert Delay", value: "Instant" },
              { label: "Data Retention", value: "24 hours" },
            ].map((c, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, paddingBottom: 10, borderBottom: "1px solid var(--border)" }}>
                <span style={{ color: "var(--text-secondary)" }}>{c.label}</span>
                <span style={{ fontWeight: 600 }}>{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Recent AI Decisions</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { product: "Sony WH-1000XM5", action: "Price Drop Alert Triggered", confidence: "97%", time: "2 min ago" },
            { product: "MacBook Pro M3", action: "Predicted 8% price drop in 3 days", confidence: "91%", time: "15 min ago" },
            { product: "Dyson V15 Detect", action: "All-time low detected at Walmart", confidence: "99%", time: "1 hr ago" },
          ].map((d, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 12px", background: "var(--bg-surface-2)", borderRadius: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{d.product}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{d.action}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--success)" }}>{d.confidence}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{d.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
