"use client";

import { useState } from "react";

export default function PriceAlertsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [frequency, setFrequency] = useState("Instant (Real-time)");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
      {/* Active Alerts List */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px", color: "var(--text-primary)" }}>
              Price Alerts
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
              Manage your tracked items and AI-driven monitoring.
            </p>
          </div>
          <button className="btn btn-primary btn-sm" style={{ borderRadius: "var(--radius-full)" }}>
            + Create New
          </button>
        </div>

        <h3 className="heading-3" style={{ marginBottom: 14 }}>
          Active Alerts
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Alert Card 1 */}
          <div className="card" style={{ padding: 20, display: "flex", gap: 16 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 8,
                background: "var(--bg-surface-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                flexShrink: 0,
              }}
            >
              🎧
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span className="badge badge-success">TARGET REACHED</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Updated 2h ago</span>
                </div>
                <h4 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Sony WH-1000XM5</h4>
              </div>
              <div style={{ display: "flex", gap: 28, marginTop: 8 }}>
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>CURRENT</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>$298.00</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>TARGET</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--primary)" }}>$300.00</div>
                </div>
              </div>
            </div>
            {/* Sparkline mini-graph */}
            <div style={{ width: 120, display: "flex", alignItems: "flex-end", paddingBottom: 6 }}>
              <svg width="120" height="36" viewBox="0 0 120 36">
                <path
                  d="M0,10 Q20,30 40,20 T80,30 T120,5"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
              <button aria-label="Edit" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
                ✏️
              </button>
              <button aria-label="Delete" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)" }}>
                🗑️
              </button>
            </div>
          </div>

          {/* Alert Card 2 */}
          <div className="card" style={{ padding: 20, display: "flex", gap: 16 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 8,
                background: "var(--bg-surface-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                flexShrink: 0,
              }}
            >
              ⌚
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span className="badge badge-primary">TRENDING DOWN</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Updated 5h ago</span>
                </div>
                <h4 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Apple Watch Series 9</h4>
              </div>
              <div style={{ display: "flex", gap: 28, marginTop: 8 }}>
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>CURRENT</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>$349.00</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase" }}>TARGET</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--primary)" }}>$320.00</div>
                </div>
              </div>
            </div>
            {/* Sparkline mini-graph */}
            <div style={{ width: 120, display: "flex", alignItems: "flex-end", paddingBottom: 6 }}>
              <svg width="120" height="36" viewBox="0 0 120 36">
                <path
                  d="M0,5 Q30,10 60,30 T120,25"
                  fill="none"
                  stroke="var(--info)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
              <button aria-label="Edit" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
                ✏️
              </button>
              <button aria-label="Delete" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)" }}>
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Preferences Column */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Total stats panel */}
        <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 12 }}>
          <div className="card" style={{ padding: 16 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)" }}>ESTIMATED SAVINGS</span>
            <div style={{ fontSize: 24, fontWeight: 700, color: "var(--primary)", marginTop: 4 }}>$842.50</div>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)" }}>ACTIVE MONITORS</span>
            <div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", marginTop: 4 }}>24</div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Preferences</h4>
            <span>⚙️</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Email Alerts Toggle */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Email Alerts</div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} />
                <span className="toggle-track"></span>
                <span className="toggle-thumb"></span>
              </label>
            </div>

            {/* Push Notifications Toggle */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Push Notifications</div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={pushAlerts} onChange={(e) => setPushAlerts(e.target.checked)} />
                <span className="toggle-track"></span>
                <span className="toggle-thumb"></span>
              </label>
            </div>

            {/* SMS Updates Toggle */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>SMS Updates</div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={smsAlerts} onChange={(e) => setSmsAlerts(e.target.checked)} />
                <span className="toggle-track"></span>
                <span className="toggle-thumb"></span>
              </label>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14 }}>
              <label className="input-label" style={{ fontSize: 9 }}>
                ALERT FREQUENCY
              </label>
              <select
                className="input"
                style={{ height: 36, fontSize: 13, padding: "0 8px", marginTop: 4 }}
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="Instant (Real-time)">Instant (Real-time)</option>
                <option value="Daily Digest">Daily Digest</option>
                <option value="Weekly Summary">Weekly Summary</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recent Savings */}
        <div className="card" style={{ padding: 16 }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Recent Savings</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { name: "Dyson V15 Detect", saved: "Saved $120.00", icon: "🧹" },
              { name: "Breville Bambino Plus", saved: "Saved $45.99", icon: "☕" },
            ].map((s, idx) => (
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
                  {s.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: "var(--success)" }}>{s.saved}</div>
                </div>
                <span>&rsaquo;</span>
              </div>
            ))}
          </div>
          <button
            className="btn btn-ghost btn-sm"
            style={{ width: "100%", height: 32, marginTop: 14, fontSize: 11, padding: 0 }}
          >
            View all history
          </button>
        </div>
      </div>
    </div>
  );
}
