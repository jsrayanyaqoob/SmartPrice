"use client";
export default function PriceMonitoringPage() {
  const crawlerStatus = [
    { store: "Amazon", status: "Running", lastRun: "Just now", nextRun: "60s", success: 1240, failed: 3 },
    { store: "Walmart", status: "Running", lastRun: "45s ago", nextRun: "15s", success: 890, failed: 1 },
    { store: "Best Buy", status: "Running", lastRun: "12s ago", nextRun: "48s", success: 670, failed: 0 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px" }}>Price Monitoring</h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
          Real-time crawler dashboard for live price tracking.
        </p>
      </div>

      {/* Crawler Status */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {crawlerStatus.map((c, idx) => (
          <div key={idx} className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h4 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{c.store}</h4>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--success)", fontWeight: 600 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", display: "inline-block", animation: "pulse 1.5s infinite" }} />
                {c.status}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12 }}>
              <div>
                <div style={{ color: "var(--text-muted)", fontSize: 10 }}>LAST RUN</div>
                <div style={{ fontWeight: 600, marginTop: 2 }}>{c.lastRun}</div>
              </div>
              <div>
                <div style={{ color: "var(--text-muted)", fontSize: 10 }}>NEXT RUN</div>
                <div style={{ fontWeight: 600, marginTop: 2 }}>{c.nextRun}</div>
              </div>
              <div>
                <div style={{ color: "var(--text-muted)", fontSize: 10 }}>SUCCESS</div>
                <div style={{ fontWeight: 600, marginTop: 2, color: "var(--success)" }}>{c.success.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ color: "var(--text-muted)", fontSize: 10 }}>ERRORS</div>
                <div style={{ fontWeight: 600, marginTop: 2, color: c.failed > 0 ? "var(--danger)" : "var(--text-muted)" }}>{c.failed}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Price History Feed */}
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Live Price Events</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { event: "Price Drop", product: "Sony WH-1000XM5", store: "Amazon", change: "-$12.00", time: "30s ago", type: "down" },
            { event: "Price Restored", product: "iPad Air M2", store: "Best Buy", change: "+$25.00", time: "2m ago", type: "up" },
            { event: "New Low", product: "Dyson V15 Detect", store: "Walmart", change: "-$50.00", time: "5m ago", type: "down" },
            { event: "Price Updated", product: 'MacBook Pro 14"', store: "Amazon", change: "$0.00", time: "8m ago", type: "neutral" },
          ].map((e, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "var(--bg-surface-2)", borderRadius: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: e.type === "down" ? "var(--success)" : e.type === "up" ? "var(--danger)" : "var(--text-muted)", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{e.product} — {e.store}</div>
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{e.event}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: e.type === "down" ? "var(--success)" : e.type === "up" ? "var(--danger)" : "var(--text-muted)" }}>
                {e.change}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{e.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
