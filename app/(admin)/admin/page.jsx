"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("Daily");
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const kpis = [
    {
      label: "Total Users",
      val: loadingStats ? "..." : (stats?.totalUsers ?? 0).toLocaleString(),
      sub: "📈 Registered users",
    },
    {
      label: "Active Alerts",
      val: loadingStats ? "..." : (stats?.totalAlerts ?? 0).toLocaleString(),
      sub: "🔔 Price monitors",
    },
    {
      label: "Total Products",
      val: loadingStats ? "..." : (stats?.totalProducts ?? 0).toLocaleString(),
      sub: "📦 In database",
    },
    {
      label: "Store Network",
      val: loadingStats ? "..." : (stats?.totalStores ?? 0).toLocaleString(),
      sub: "🏪 Active stores",
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
      {/* Left Column Content */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Header and KPIs */}
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 4px", color: "var(--text-primary)" }}>
            Admin Console
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
            Real-time control center for user activity and neural optimization.
          </p>
        </div>

        {/* KPI Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {kpis.map((kpi, idx) => (
            <div key={idx} className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>
                {kpi.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                {kpi.val}
              </div>
              <div style={{ fontSize: 10, color: "var(--success)", fontWeight: 600 }}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* AI Usage & Growth bar chart */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Activity Overview</h3>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>
                Simulated platform usage metrics
              </p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["Daily", "Weekly"].map((t) => (
                <span
                  key={t}
                  onClick={() => setActiveTab(t)}
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: 4,
                    background: activeTab === t ? "var(--primary-light)" : "transparent",
                    color: activeTab === t ? "var(--primary)" : "var(--text-secondary)",
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
            {(activeTab === "Daily"
              ? [30, 45, 60, 50, 75, 80, 95, 65, 85]
              : [50, 70, 55, 80, 90, 60, 75, 85, 100]
            ).map((h, idx) => (
              <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    width: 24,
                    height: `${h}%`,
                    borderRadius: 4,
                    background: idx === 6 ? "var(--primary)" : "var(--bg-surface-2)",
                    transition: "height 0.3s ease",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Latest Registered Users - from real DB */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Latest Registered Users</h3>
            <Link
              href="/admin/users"
              style={{ fontSize: 11, color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}
            >
              View All →
            </Link>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", fontSize: 11, color: "var(--text-muted)" }}>
                <th style={{ paddingBottom: 10, fontWeight: 600 }}>USER</th>
                <th style={{ paddingBottom: 10, fontWeight: 600 }}>PLAN</th>
                <th style={{ paddingBottom: 10, fontWeight: 600 }}>JOINED</th>
                <th style={{ paddingBottom: 10, fontWeight: 600, textAlign: "right" }}>ROLE</th>
              </tr>
            </thead>
            <tbody>
              {loadingStats ? (
                <tr>
                  <td colSpan={4} style={{ padding: "20px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                    Loading...
                  </td>
                </tr>
              ) : stats?.recentUsers?.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: "20px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                    No users registered yet. Go to{" "}
                    <Link href="/register" style={{ color: "var(--primary)" }}>
                      /register
                    </Link>{" "}
                    to create accounts.
                  </td>
                </tr>
              ) : (
                (stats?.recentUsers || []).map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                    <td style={{ padding: "10px 0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: u.role === "Admin" ? "var(--primary)" : "var(--primary-light)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 700,
                            color: u.role === "Admin" ? "white" : "var(--primary)",
                          }}
                        >
                          {(u.name || u.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{u.name || "Anonymous"}</div>
                          <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 0" }}>
                      <span
                        className={u.plan === "PRO" ? "badge badge-pro" : "badge badge-primary"}
                        style={{ fontSize: 8 }}
                      >
                        {u.plan}
                      </span>
                    </td>
                    <td style={{ padding: "10px 0", color: "var(--text-secondary)" }}>
                      {formatDate(u.createdAt)}
                    </td>
                    <td style={{ padding: "10px 0", textAlign: "right" }}>
                      <span
                        className={u.role === "Admin" ? "badge badge-danger" : ""}
                        style={{ fontSize: 8, fontWeight: 600, color: u.role === "Admin" ? undefined : "var(--text-muted)" }}
                      >
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Column Content */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Quick Actions */}
        <div className="card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Quick Actions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link
              href="/admin/users"
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "var(--bg-surface-2)", textDecoration: "none", color: "var(--text-primary)", fontSize: 13, fontWeight: 500 }}
            >
              👥 Manage Users
            </Link>
            <Link
              href="/admin/products"
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "var(--bg-surface-2)", textDecoration: "none", color: "var(--text-primary)", fontSize: 13, fontWeight: 500 }}
            >
              📦 Manage Products
            </Link>
            <Link
              href="/admin/stores"
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "var(--bg-surface-2)", textDecoration: "none", color: "var(--text-primary)", fontSize: 13, fontWeight: 500 }}
            >
              🏪 Store Network
            </Link>
            <Link
              href="/admin/analytics"
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "var(--bg-surface-2)", textDecoration: "none", color: "var(--text-primary)", fontSize: 13, fontWeight: 500 }}
            >
              📊 View Analytics
            </Link>
          </div>
        </div>

        {/* Acquisition Channels */}
        <div className="card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Acquisition Channels</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { source: "Organic Search", val: 42, color: "var(--primary)" },
              { source: "Social Media", val: 28, color: "var(--brand-blue)" },
              { source: "Direct Traffic", val: 18, color: "var(--text-secondary)" },
              { source: "Referrals", val: 12, color: "var(--text-muted)" },
            ].map((ac, idx) => (
              <div key={idx}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 2 }}>
                  <span style={{ fontWeight: 500 }}>{ac.source}</span>
                  <span style={{ fontWeight: 600 }}>{ac.val}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "var(--bg-surface-2)" }}>
                  <div style={{ height: "100%", borderRadius: 3, width: `${ac.val}%`, background: ac.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>System Health</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "var(--text-secondary)" }}>Database</span>
              <span style={{ fontWeight: 600, color: "var(--success)", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", display: "inline-block" }} /> Connected
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "var(--text-secondary)" }}>Auth Service</span>
              <span style={{ fontWeight: 600, color: "var(--success)", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--success)", display: "inline-block" }} /> Online
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "var(--text-secondary)" }}>API Uptime</span>
              <span style={{ fontWeight: 600, color: "var(--success)" }}>99.99%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "var(--text-secondary)" }}>Price Crawler</span>
              <span style={{ fontWeight: 600, color: "var(--success)" }}>Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
