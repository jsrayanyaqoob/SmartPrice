"use client";

import { useState } from "react";

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState("Categories");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px", color: "var(--text-primary)" }}>
            Consumer Insights
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
            Real-time data for smarter shopping decisions.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost btn-sm">Export PDF</button>
          <button className="btn btn-primary btn-sm">✨ Ask Smart AI</button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
        {[
          { label: "Total Money Saved", value: "$1,248.50", sub: "📈 +12% from last month" },
          { label: "Active Alerts", value: "24", sub: "6 triggers pending" },
          { label: "Wishlist Items", value: "56", sub: "12 with active price drops" },
          { label: "Products Compared", value: "12", sub: "in last 30 days" },
          { label: "Saved Searches", value: "8", sub: "Auto-refreshing hourly" },
        ].map((kpi, idx) => (
          <div key={idx} className="card" style={{ padding: 14 }}>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: 10, color: "var(--success)", fontWeight: 500 }}>{kpi.sub}</div>
          </div>
        ))}
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
                ⭐ PERSONALIZED STRATEGY
              </span>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: "10px 0 6px" }}>You saved $324 this month!</h3>
              <p style={{ fontSize: 12, opacity: 0.9, lineHeight: 1.5, margin: 0 }}>
                Our AI detected a pattern: you save most on tech purchases made on Tuesday mornings.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span>📉</span>
                <span>Gaming laptops expected to drop 15% next week.</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span>✔️</span>
                <span>3 items at lowest recorded price ever.</span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span>🛒</span>
                <span>Amazon offers your best personalized deals.</span>
              </div>
            </div>
          </div>

          {/* Budget Goal Progress Card */}
          <div className="card" style={{ padding: 20, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>BUDGET GOAL PROGRESS</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--primary)" }}>72%</span>
            </div>
            {/* Progress Circular representation */}
            <div style={{ position: "relative", width: 100, height: 100, margin: "0 auto 12px" }}>
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg-surface-2)" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="8"
                  strokeDasharray="251"
                  strokeDashoffset="70"
                  strokeLinecap="round"
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>$1,500</div>
                <div style={{ fontSize: 9, color: "var(--text-muted)" }}>LIMIT</div>
              </div>
            </div>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
              You have $412.50 remaining for October.
            </p>
          </div>
        </div>

        {/* Right Side Graph & Timeline Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Timeline Bar Chart */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Price Drop Timeline</h3>
              <div style={{ display: "flex", gap: 6 }}>
                {["Monthly", "Weekly"].map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: 4,
                      background: t === "Monthly" ? "var(--primary-light)" : "transparent",
                      color: t === "Monthly" ? "var(--primary)" : "var(--text-secondary)",
                      cursor: "pointer",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            {/* Timeline Bars */}
            <div style={{ display: "flex", justifyContent: "space-between", height: 160, alignItems: "flex-end", padding: "0 10px" }}>
              {[
                { m: "May", h: 40 },
                { m: "Jun", h: 60 },
                { m: "Jul", h: 80 },
                { m: "Aug", h: 50 },
                { m: "Sep", h: 100 },
                { m: "Oct", h: 70 },
                { m: "Nov", h: 65 },
              ].map((b, idx) => (
                <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: 32,
                      height: `${b.h}%`,
                      borderRadius: 6,
                      background: idx === 4 ? "var(--primary)" : "var(--primary-light)",
                      marginBottom: 8,
                    }}
                  />
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{b.m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Average Discount / Shopping DNA */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Metrics */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#d1fae5", color: "#10b981", display: "flex", alignItems: "center", justifyCenter: "center", fontSize: 16, fontWeight: 700, justifyContent: "center" }}>
                  %
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Average Discount</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>18% applied</div>
                </div>
              </div>
              <div className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyCenter: "center", fontSize: 16, fontWeight: 700, justifyContent: "center" }}>
                  🏆
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Highest Found</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>42% savings</div>
                </div>
              </div>
            </div>

            {/* Shopping DNA */}
            <div className="card" style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Shopping DNA</h4>
                <div style={{ display: "flex", gap: 8, fontSize: 10 }}>
                  {["Categories", "Brands", "Stores"].map((tab) => (
                    <span
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        cursor: "pointer",
                        fontWeight: 600,
                        color: activeTab === tab ? "var(--primary)" : "var(--text-muted)",
                      }}
                    >
                      {tab}
                    </span>
                  ))}
                </div>
              </div>
              {/* Category stats lists */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { name: "Electronics", val: 42, color: "var(--primary)" },
                  { name: "Home Decor", val: 28, color: "var(--brand-blue)" },
                  { name: "Fashion", val: 15, color: "var(--warning)" },
                ].map((dna, idx) => (
                  <div key={idx}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}>
                      <span style={{ fontWeight: 500 }}>{dna.name}</span>
                      <span style={{ fontWeight: 600 }}>{dna.val}%</span>
                    </div>
                    <div style={{ height: 6, borderRadius: 3, background: "var(--bg-surface-2)" }}>
                      <div style={{ height: "100%", borderRadius: 3, width: `${dna.val}%`, background: dna.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Activity & Achievements */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        {/* Curvy activity map chart */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Shopping Activity</h3>
          {/* Mock Activity Line chart placeholder */}
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

        {/* Achievements Card */}
        <div className="card" style={{ padding: 18 }}>
          <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Achievements</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { title: "Biggest Saving", desc: "Saved $420 on MacBook Pro", badge: "👛" },
              { title: "Best Purchase", desc: "Bought Sony TV at absolute low", badge: "🥇" },
              { title: "Longest Tracked", desc: "Tracked Dyson fan for 8 months", badge: "⏳" },
            ].map((ach, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 18 }}>{ach.badge}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-primary)" }}>{ach.title}</div>
                  <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{ach.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
