"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const ACTION_BADGES = {
  user_created: { label: "User Created", className: "badge badge-success" },
  user_updated: { label: "User Updated", className: "badge badge-primary" },
  user_deleted: { label: "User Deleted", className: "badge badge-danger" },
  product_created: { label: "Product Added", className: "badge badge-success" },
  product_deleted: { label: "Product Deleted", className: "badge badge-danger" },
  product_updated: { label: "Product Updated", className: "badge badge-primary" },
};

function getBadge(action) {
  return ACTION_BADGES[action] || { label: action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), className: "badge badge-primary" };
}

function formatRelativeTime(date) {
  if (!date) return "—";
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentLogs, setRecentLogs] = useState([]);
  const [logCount, setLogCount] = useState(0);
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, logsRes, usersRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/audit-logs?limit=5"),
          fetch("/api/admin/users?limit=10"),
        ]);
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        }
        if (logsRes.ok) {
          const data = await logsRes.json();
          setRecentLogs(data.logs || []);
          setLogCount(data.total || 0);
        }
        if (usersRes.ok) {
          const data = await usersRes.json();
          setRecentUsers(data.users || []);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const kpis = [
    {
      label: "Total Users",
      val: loadingStats ? "..." : (stats?.totalUsers ?? 0).toLocaleString(),
      sub: "Registered users",
    },
    {
      label: "Active Alerts",
      val: loadingStats ? "..." : (stats?.totalAlerts ?? 0).toLocaleString(),
      sub: "Price monitors",
    },
    {
      label: "Total Products",
      val: loadingStats ? "..." : (stats?.totalProducts ?? 0).toLocaleString(),
      sub: "In database",
    },
    {
      label: "Store Network",
      val: loadingStats ? "..." : (stats?.totalStores ?? 0).toLocaleString(),
      sub: "Active stores",
    },
  ];

  return (
    <div className="admin-dashboard-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
      {/* Main Content */}
      <div className="admin-main-col" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Header */}
        <div>
          <h2 className="admin-page-title">Admin Console</h2>
          <p className="admin-page-subtitle">
            Real-time control center for user activity and platform metrics.
          </p>
        </div>

        {/* KPI Row */}
        <div className="kpi-grid">
          {kpis.map((kpi, idx) => (
            <div key={idx} className={`card admin-fade-in-delay-${idx + 1}`} style={{ padding: 16 }}>
              <div className="kpi-label">{kpi.label}</div>
              <div className="kpi-value">{kpi.val}</div>
              <div className="kpi-sub">{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Latest Registered Users */}
        <div className="card admin-fade-in" style={{ padding: 20 }}>
          <div className="card-header-row">
            <h3 className="card-title">Latest Registered Users</h3>
            <Link href="/admin/users" className="card-link">
              View All →
            </Link>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>USER</th>
                  <th>PLAN</th>
                  <th>JOINED</th>
                  <th className="text-right">ROLE</th>
                </tr>
              </thead>
              <tbody>
                {loadingStats ? (
                  <tr>
                    <td colSpan={4} className="table-empty">Loading...</td>
                  </tr>
                ) : stats?.recentUsers?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="table-empty">
                      No users registered yet.{' '}
                      <Link href="/register" className="card-link">/register</Link>
                    </td>
                  </tr>
                ) : (
                  (stats?.recentUsers || []).map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="user-cell">
                          <div className={`user-avatar ${u.role === "Admin" ? "avatar-admin" : "avatar-user"}`}>
                            {(u.name || u.email)[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="user-name">{u.name || "Anonymous"}</div>
                            <div className="user-email">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={u.plan === "PRO" ? "badge badge-pro" : "badge badge-primary"}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="text-secondary">{formatDate(u.createdAt)}</td>
                      <td className="text-right">
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

        {/* Platform Summary */}
        <div className="card admin-fade-in-delay-1" style={{ padding: 20 }}>
          <h3 className="card-title" style={{ marginBottom: 16 }}>Platform Summary</h3>
          <div className="stats-overview-grid">
            <div className="stat-item">
              <div className="stat-item-label">Users Registered</div>
              <div className="stat-item-value">{loadingStats ? "..." : (stats?.totalUsers ?? 0).toLocaleString()}</div>
            </div>
            <div className="stat-item">
              <div className="stat-item-label">Products Tracked</div>
              <div className="stat-item-value">{loadingStats ? "..." : (stats?.totalProducts ?? 0).toLocaleString()}</div>
            </div>
            <div className="stat-item">
              <div className="stat-item-label">Price Alerts Active</div>
              <div className="stat-item-value">{loadingStats ? "..." : (stats?.totalAlerts ?? 0).toLocaleString()}</div>
            </div>
            <div className="stat-item">
              <div className="stat-item-label">Unique Store Sources</div>
              <div className="stat-item-value">{loadingStats ? "..." : (stats?.totalStores ?? 0).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="admin-side-col" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Recent Activity */}
        <div className="card admin-fade-in" style={{ padding: 18 }}>
          <div className="card-header-row">
            <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Recent Activity
              {logCount > 0 && (
                <span className="badge badge-danger" style={{ fontSize: 9, padding: "1px 7px" }}>{logCount}</span>
              )}
            </h3>
            <Link href="/admin/audit-logs" className="card-link">
              View All →
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {loadingStats ? (
              <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", padding: 12 }}>
                Loading activity...
              </div>
            ) : recentLogs.length === 0 ? (
              <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", padding: 20 }}>
                No admin activity yet.
              </div>
            ) : (
              recentLogs.map((log) => {
                const badge = getBadge(log.action);
                return (
                  <div key={log.id} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 10px",
                    background: "var(--bg-surface-2)",
                    borderRadius: 8,
                    fontSize: 11,
                  }}>
                    <span className={badge.className} style={{ fontSize: 8, padding: "1px 6px", flexShrink: 0 }}>
                      {badge.label}
                    </span>
                    <div style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <span style={{ fontWeight: 600 }}>{log.adminName}</span>
                      <span style={{ color: "var(--text-secondary)", marginLeft: 4 }}>
                        {log.details || log.entity}
                      </span>
                    </div>
                    <span style={{ fontSize: 9, color: "var(--text-muted)", flexShrink: 0 }}>
                      {formatRelativeTime(log.createdAt)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card admin-fade-in-delay-1" style={{ padding: 18 }}>
          <h3 className="card-title" style={{ marginBottom: 14 }}>Quick Actions</h3>
          <div className="quick-actions-list">
            <Link href="/admin/users" className="quick-action-link">Manage Users</Link>
            <Link href="/admin/products" className="quick-action-link">Manage Products</Link>
            <Link href="/admin/stores" className="quick-action-link">Store Network</Link>
            <Link href="/admin/analytics" className="quick-action-link">View Analytics</Link>
          </div>
        </div>

        {/* User Activity Timeline */}
        <div className="card admin-fade-in-delay-2" style={{ padding: 18 }}>
          <div className="card-header-row">
            <h3 className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              User Activity Timeline
            </h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative" }}>
            {/* Timeline line */}
            <div style={{ position: "absolute", left: 7, top: 8, bottom: 8, width: 2, background: "var(--border)", borderRadius: 1 }} />
            {loadingStats ? (
              <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", padding: 20 }}>
                Loading activity...
              </div>
            ) : recentUsers.length === 0 ? (
              <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", padding: 20 }}>
                No user activity yet.
              </div>
            ) : (
              recentUsers.slice(0, 5).map((u, idx) => {
                const timeAgo = formatRelativeTime(u.createdAt);
                const initials = (u.name || u.email)[0].toUpperCase();
                return (
                  <div key={u.id} style={{ display: "flex", gap: 12, padding: "10px 0", position: "relative" }}>
                    {/* Timeline dot */}
                    <div style={{
                      width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                      background: u.role === "Admin" ? "var(--primary)" : "var(--success)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 7, fontWeight: 700, color: "white",
                      zIndex: 1, marginTop: 1,
                    }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {u.name || u.email || "New user"}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text-muted)", display: "flex", gap: 6, alignItems: "center" }}>
                        <span className={`badge ${u.plan === "PRO" ? "badge-pro" : "badge-primary"}`} style={{ fontSize: 7, padding: "0 5px", height: 15 }}>
                          {u.plan}
                        </span>
                        <span>Joined {timeAgo}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {recentUsers.length > 5 && (
              <Link href="/admin/users" className="card-link" style={{ textAlign: "center", padding: "8px 0 4px", fontSize: 10 }}>
                View all {recentUsers.length} users →
              </Link>
            )}
          </div>
        </div>

        {/* Database Overview */}
        <div className="card admin-fade-in-delay-3" style={{ padding: 18 }}>
          <h3 className="card-title" style={{ marginBottom: 16 }}>Database Overview</h3>
          <div className="quick-stats-list">
            <div className="db-stat">
              <div className="db-stat-label">Users</div>
              <div className="db-stat-value">{loadingStats ? "..." : (stats?.totalUsers ?? 0).toLocaleString()}</div>
            </div>
            <div className="db-stat">
              <div className="db-stat-label">Products</div>
              <div className="db-stat-value">{loadingStats ? "..." : (stats?.totalProducts ?? 0).toLocaleString()}</div>
            </div>
            <div className="db-stat">
              <div className="db-stat-label">Alerts</div>
              <div className="db-stat-value">{loadingStats ? "..." : (stats?.totalAlerts ?? 0).toLocaleString()}</div>
            </div>
            <div className="db-stat">
              <div className="db-stat-label">Stores</div>
              <div className="db-stat-value">{loadingStats ? "..." : (stats?.totalStores ?? 0).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
