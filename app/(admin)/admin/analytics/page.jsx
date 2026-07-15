"use client";

export default function AnalyticsPage() {
  const metrics = [
    { label: "Page Views (Today)", value: "24,892", change: "+14.2%", positive: true },
    { label: "Unique Visitors", value: "8,341", change: "+8.7%", positive: true },
    { label: "Avg Session Time", value: "4m 32s", change: "-2.1%", positive: false },
    { label: "Conversion Rate", value: "3.8%", change: "+0.4%", positive: true },
  ];

  const topProducts = [
    { name: "Sony WH-1000XM5", views: 1842, alerts: 234 },
    { name: 'MacBook Pro 14" M3', views: 1590, alerts: 189 },
    { name: "Samsung Galaxy S24 Ultra", views: 1204, alerts: 156 },
    { name: "iPad Air M2", views: 987, alerts: 112 },
    { name: "Dyson V15 Detect", views: 763, alerts: 94 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px" }}>Analytics</h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
          Platform engagement and usage intelligence.
        </p>
      </div>

      {/* Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {metrics.map((m, idx) => (
          <div key={idx} className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", marginBottom: 8 }}>
              {m.label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{m.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: m.positive ? "var(--success)" : "var(--danger)" }}>
              {m.change} vs yesterday
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Traffic Chart */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Traffic (Last 7 Days)</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: 140 }}>
            {[65, 80, 55, 90, 75, 100, 85].map((h, idx) => (
              <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div
                  style={{
                    width: 28,
                    height: `${h}%`,
                    borderRadius: 6,
                    background: idx === 6 ? "var(--primary)" : "var(--primary-light)",
                  }}
                />
                <span style={{ fontSize: 10, color: "var(--text-muted)" }}>
                  {["M", "T", "W", "T", "F", "S", "S"][idx]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Top Tracked Products</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {topProducts.map((p, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 20, fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>
                  #{idx + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                    {p.views.toLocaleString()} views • {p.alerts} alerts
                  </div>
                </div>
                <div style={{ width: 60, height: 4, borderRadius: 2, background: "var(--bg-surface-2)" }}>
                  <div style={{ height: "100%", borderRadius: 2, width: `${(p.views / 1842) * 100}%`, background: "var(--primary)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
