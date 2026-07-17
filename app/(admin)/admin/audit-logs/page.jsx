"use client";

import { useState, useEffect } from "react";
import AdminPageLayout from "@/components/layout/AdminPageLayout";

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

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("");
  const [filterEntity, setFilterEntity] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (filterAction) params.set("action", filterAction);
      if (filterEntity) params.set("entity", filterEntity);
      const res = await fetch(`/api/admin/audit-logs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterAction, filterEntity]);

  const formatTime = (date) => {
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
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const uniqueActions = [...new Set(logs.map((l) => l.action))];
  const uniqueEntities = [...new Set(logs.map((l) => l.entity))];

  return (
    <AdminPageLayout title="Audit Log" subtitle="Track every admin action across the platform — user management, product changes, and more.">
      {/* Filters */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <select
          className="input"
          style={{ width: 180, height: 34, fontSize: 12, padding: "0 8px" }}
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
        >
          <option value="">All Actions</option>
          {uniqueActions.map((a) => (
            <option key={a} value={a}>
              {getBadge(a).label}
            </option>
          ))}
        </select>
        <select
          className="input"
          style={{ width: 160, height: 34, fontSize: 12, padding: "0 8px" }}
          value={filterEntity}
          onChange={(e) => setFilterEntity(e.target.value)}
        >
          <option value="">All Entities</option>
          {uniqueEntities.map((e) => (
            <option key={e} value={e}>
              {e.charAt(0).toUpperCase() + e.slice(1)}
            </option>
          ))}
        </select>
        <button className="btn btn-ghost btn-sm" onClick={() => { setFilterAction(""); setFilterEntity(""); }}>
          Clear Filters
        </button>
        <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>
          {loading ? "Loading..." : `${logs.length} log entries`}
        </span>
      </div>

      {/* Log Table */}
      <AdminPageLayout.Section>
        {loading ? (
          <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)" }}>Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <h3 style={{ margin: "0 0 6px", color: "var(--text-primary)", fontWeight: 700 }}>No audit logs yet</h3>
            <p style={{ margin: 0, fontSize: 13 }}>Admin actions will appear here as they happen.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table audit-log-table">
              <thead>
                <tr>
                  <th>TIME</th>
                  <th>ADMIN</th>
                  <th>ACTION</th>
                  <th>ENTITY</th>
                  <th>DETAILS</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const badge = getBadge(log.action);
                  return (
                    <tr key={log.id}>
                      <td style={{ whiteSpace: "nowrap", fontSize: 11, color: "var(--text-muted)" }}>
                        {formatTime(log.createdAt)}
                      </td>
                      <td>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{log.adminName || "Admin"}</div>
                      </td>
                      <td>
                        <span className={badge.className} style={{ fontSize: 10 }}>
                          {badge.label}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: 12 }}>
                          <span style={{ fontWeight: 600, textTransform: "capitalize" }}>{log.entity}</span>
                          {log.entityId && (
                            <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: 4 }}>
                              #{log.entityId.slice(0, 8)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ fontSize: 11, color: "var(--text-secondary)", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {log.details || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminPageLayout.Section>
    </AdminPageLayout>
  );
}
