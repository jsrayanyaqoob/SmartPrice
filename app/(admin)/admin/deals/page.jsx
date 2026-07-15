"use client";
export default function DealsPage() {
  const deals = [
    { product: "Sony WH-1000XM5", original: "$399.00", current: "$298.00", discount: "25%", store: "Amazon", expiry: "2h 34m", hot: true },
    { product: 'MacBook Pro 14" M3', original: "$1,999.00", current: "$1,549.00", discount: "22%", store: "Best Buy", expiry: "1d 4h", hot: true },
    { product: "iPad Air M2", original: "$749.00", current: "$499.00", discount: "33%", store: "Amazon", expiry: "5h 12m", hot: false },
    { product: "Dyson V15 Detect", original: "$749.00", current: "$549.00", discount: "26%", store: "Walmart", expiry: "3d 6h", hot: false },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px" }}>Deals Management</h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>Monitor and manage AI-detected deal opportunities.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Active Deals", val: "24", color: "var(--success)" },
          { label: "Hot Deals", val: "6", color: "var(--danger)" },
          { label: "Expiring Soon", val: "3", color: "var(--warning)" },
          { label: "Avg Discount", val: "27%", color: "var(--primary)" },
        ].map((s, idx) => (
          <div key={idx} className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Active Deal Listings</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", fontSize: 11, color: "var(--text-muted)", textAlign: "left" }}>
              <th style={{ paddingBottom: 10, fontWeight: 600 }}>PRODUCT</th>
              <th style={{ paddingBottom: 10, fontWeight: 600 }}>ORIGINAL</th>
              <th style={{ paddingBottom: 10, fontWeight: 600 }}>CURRENT</th>
              <th style={{ paddingBottom: 10, fontWeight: 600 }}>DISCOUNT</th>
              <th style={{ paddingBottom: 10, fontWeight: 600 }}>STORE</th>
              <th style={{ paddingBottom: 10, fontWeight: 600 }}>EXPIRY</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((d, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                <td style={{ padding: "12px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {d.hot && <span className="badge badge-danger" style={{ fontSize: 7 }}>🔥 HOT</span>}
                    <span style={{ fontWeight: 600 }}>{d.product}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 0", color: "var(--text-muted)", textDecoration: "line-through" }}>{d.original}</td>
                <td style={{ padding: "12px 0", fontWeight: 700, color: "var(--success)" }}>{d.current}</td>
                <td style={{ padding: "12px 0" }}>
                  <span className="badge badge-success" style={{ fontSize: 9 }}>{d.discount} OFF</span>
                </td>
                <td style={{ padding: "12px 0", color: "var(--text-secondary)" }}>{d.store}</td>
                <td style={{ padding: "12px 0", fontSize: 11, color: "var(--text-muted)" }}>{d.expiry}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
