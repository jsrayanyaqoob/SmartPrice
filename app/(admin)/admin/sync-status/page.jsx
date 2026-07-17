"use client";

import { useState, useEffect } from "react";
import {
  Database,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Package,
  Store,
  Layers,
  Hash,
  ExternalLink,
  Server,
} from "lucide-react";
import AdminPageLayout from "@/components/layout/AdminPageLayout";

export default function SyncStatusPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState({ text: "", type: "" });

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/admin/sync-status");
      if (res.ok) {
        setStatus(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch sync status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage({ text: "Syncing products from all data sources...", type: "" });
    try {
      // Log the sync action
      fetch("/api/admin/audit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "product_sync_triggered", entity: "products", details: "Manual sync triggered from sync status page" }),
      }).catch(() => {});

      const res = await fetch("/api/admin/sync-status", { method: "POST" });
      const data = await res.json();

      if (data.status === "success") {
        setSyncMessage({
          text: `Sync complete! ${data.stats.inserted} new products, ${data.stats.updated} updated (${data.stats.elapsed})`,
          type: "success",
        });
        // Refresh status
        await fetchStatus();
      } else if (data.status === "in_progress") {
        setSyncMessage({ text: "Sync already in progress...", type: "" });
      } else if (data.status === "skipped") {
        setSyncMessage({ text: "Sync skipped: no APIFY_TOKEN configured.", type: "warning" });
      } else {
        setSyncMessage({ text: `Sync result: ${data.message || data.status}`, type: data.status === "empty" ? "warning" : "error" });
      }
    } catch (err) {
      setSyncMessage({ text: `Sync error: ${err.message}`, type: "error" });
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMessage({ text: "", type: "" }), 5000);
    }
  };

  const formatTime = (iso) => {
    if (!iso) return "Never";
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} minutes ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ${mins % 60}m ago`;
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const SyncStatCard = ({ icon: Icon, label, value, sub, color }) => (
    <div className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: `${color || "var(--primary)"}15`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: color || "var(--primary)", flexShrink: 0,
      }}>
        <Icon size={20} />
      </div>
      <div>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value" style={{ fontSize: 22 }}>{value}</div>
        {sub && <div className="kpi-sub">{sub}</div>}
      </div>
    </div>
  );

  const syncActions = (
    <button
      className={`btn ${syncing ? "btn-ghost" : "btn-gradient"}`}
      onClick={handleSync}
      disabled={syncing}
      style={{ display: "flex", alignItems: "center", gap: 8 }}
    >
      <RefreshCw size={16} className={syncing ? "spin" : ""} />
      {syncing ? "Syncing..." : "Sync Products Now"}
    </button>
  );

  return (
    <AdminPageLayout
      title="Product Sync Status"
      subtitle="Monitor product data sources, sync history, and database state."
      actions={syncActions}
    >

      {syncMessage.text && (
        <div style={{
          padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", gap: 8,
          background: syncMessage.type === "success" ? "rgba(34, 197, 94, 0.1)" :
                     syncMessage.type === "warning" ? "rgba(245, 158, 11, 0.1)" :
                     syncMessage.type === "error" ? "rgba(239, 68, 68, 0.1)" : "rgba(107, 51, 246, 0.08)",
          color: syncMessage.type === "success" ? "var(--success)" :
                 syncMessage.type === "warning" ? "var(--warning)" :
                 syncMessage.type === "error" ? "var(--danger)" : "var(--primary)",
          border: `1px solid ${
            syncMessage.type === "success" ? "var(--success)" :
            syncMessage.type === "warning" ? "var(--warning)" :
            syncMessage.type === "error" ? "var(--danger)" : "var(--primary)"
          }`,
        }}>
          {syncMessage.type === "success" ? <CheckCircle size={16} /> :
           syncMessage.type === "error" ? <AlertTriangle size={16} /> :
           <RefreshCw size={16} className="spin" />}
          {syncMessage.text}
        </div>
      )}

      {loading ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
          Loading sync status...
        </div>
      ) : (
        <>
          {/* KPI Row */}
          <div className="kpi-grid">
            <SyncStatCard
              icon={Package}
              label="Total Products"
              value={status?.productCount ?? 0}
              sub="In database"
              color="var(--primary)"
            />
            <SyncStatCard
              icon={Layers}
              label="Categories"
              value={status?.categoryCount ?? 0}
              sub="Unique product categories"
              color="var(--info)"
            />
            <SyncStatCard
              icon={Store}
              label="Store Sources"
              value={status?.storeCount ?? 0}
              sub="Distinct store names"
              color="var(--success)"
            />
            <SyncStatCard
              icon={Hash}
              label="Price Entries"
              value={status?.priceEntries ?? 0}
              sub="Store-specific prices"
              color="var(--warning)"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Data Sources */}
            <div className="card" style={{ padding: 20 }}>
              <h3 className="card-title" style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <Database size={16} style={{ color: "var(--primary)" }} />
                Data Sources
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {status?.dataSources && Object.keys(status.dataSources).length > 0 ? (
                  Object.entries(status.dataSources).map(([key, config]) => (
                    <div key={key} className="integration-item">
                      <div className="integration-icon">
                        <Server size={18} style={{ color: config.active ? "var(--success)" : "var(--text-muted)" }} />
                      </div>
                      <div className="integration-info">
                        <div className="integration-name" style={{ textTransform: "capitalize" }}>
                          {key}
                        </div>
                        <div className="integration-status">
                          {config.urls} dataset{config.urls !== 1 ? "s" : ""} configured
                        </div>
                      </div>
                      <span className={`badge ${config.active ? "badge-success" : "badge-warning"}`} style={{ fontSize: 9 }}>
                        {config.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: 12, color: "var(--text-muted)", padding: 12, textAlign: "center" }}>
                    No data sources configured yet. Add Apify dataset URLs to <code>lib/product-sync.js</code>.
                  </div>
                )}
              </div>
            </div>

            {/* Sync Info */}
            <div className="card" style={{ padding: 20 }}>
              <h3 className="card-title" style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <Clock size={16} style={{ color: "var(--primary)" }} />
                Sync Information
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="config-row">
                  <span className="config-label">Last Sync</span>
                  <span className="config-value">
                    {status?.lastSyncAt ? formatTime(status.lastSyncAt) : "Never synced"}
                  </span>
                </div>
                <div className="config-row">
                  <span className="config-label">Database Status</span>
                  <span className="config-value">
                    <span className={`badge ${status?.dbSeeded ? "badge-success" : "badge-warning"}`} style={{ fontSize: 10 }}>
                      {status?.dbSeeded ? "Populated" : "Empty"}
                    </span>
                  </span>
                </div>
                <div className="config-row">
                  <span className="config-label">Categories Found</span>
                  <span className="config-value">{status?.categoryCount ?? 0}</span>
                </div>
                <div className="config-row">
                  <span className="config-label">Store Sources</span>
                  <span className="config-value">{status?.storeCount ?? 0}</span>
                </div>
                <div className="config-row">
                  <span className="config-label">Cron Schedule</span>
                  <span className="config-value">Every 6 hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="card" style={{ padding: 20 }}>
            <h3 className="card-title" style={{ marginBottom: 14 }}>Category Breakdown</h3>
            {status?.categories && status.categories.length > 0 ? (
              <div className="bar-chart">
                {status.categories.map((cat) => {
                  const maxCount = Math.max(...status.categories.map((c) => c.count), 1);
                  const pct = (cat.count / maxCount) * 100;
                  return (
                    <div key={cat.name} className="bar-row">
                      <span className="bar-label">{cat.name}</span>
                      <div className="bar-bg">
                        <div className="bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="bar-count">{cat.count}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 20 }}>
                No category data available. Sync products first.
              </div>
            )}
          </div>

          {/* Recent Products */}
          <div className="card" style={{ padding: 20 }}>
            <div className="card-header-row">
              <h3 className="card-title">Recently Synced Products</h3>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                Showing 5 most recent
              </span>
            </div>
            {status?.samples && status.samples.length > 0 ? (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>PRODUCT</th>
                      <th>CATEGORY</th>
                      <th>BRAND</th>
                      <th className="text-right">PRICE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {status.samples.map((p, idx) => (
                      <tr key={idx}>
                        <td>
                          <span className="deal-product-name">{p.name}</span>
                        </td>
                        <td>
                          <span className="badge badge-primary" style={{ fontSize: 9 }}>
                            {p.category || "General"}
                          </span>
                        </td>
                        <td className="text-secondary">{p.brand || "—"}</td>
                        <td className="text-right" style={{ fontWeight: 700 }}>
                          ${p.price.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 20 }}>
                No products synced yet. Click "Sync Products Now" above to fetch data from your Apify sources.
              </div>
            )}
          </div>
        </>
      )}
    </AdminPageLayout>
  );
}
