"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Trash2, ExternalLink, RefreshCw } from "lucide-react";
import AdminPageLayout from "@/components/layout/AdminPageLayout";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Page-view audit log
    fetch("/api/admin/audit-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "page_view", entity: "notifications", details: "Viewed Notifications page" }),
    }).catch(() => {});

    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

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
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <AdminPageLayout
      title="Notifications"
      subtitle="System alerts, price drop notifications, and admin activity."
      maxWidth={720}
      actions={
        <div style={{ display: "flex", gap: 8 }}>
          {unreadCount > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={handleMarkAllRead}>
              <CheckCheck size={14} /> Mark All Read
            </button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={fetchNotifications}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      }
    >
      {/* Summary */}
      <AdminPageLayout.KPIGrid>
        <div className="card admin-fade-in-delay-1" style={{ padding: 16 }}>
          <div className="kpi-label">Total</div>
          <div className="kpi-value">{notifications.length}</div>
        </div>
        <div className="card admin-fade-in-delay-2" style={{ padding: 16 }}>
          <div className="kpi-label">Unread</div>
          <div className="kpi-value" style={{ color: "var(--primary)" }}>{unreadCount}</div>
        </div>
        <div className="card admin-fade-in-delay-3" style={{ padding: 16 }}>
          <div className="kpi-label">Read</div>
          <div className="kpi-value" style={{ color: "var(--text-muted)" }}>{notifications.length - unreadCount}</div>
        </div>
      </AdminPageLayout.KPIGrid>

      {/* Notifications List */}
      <AdminPageLayout.Section>
        {loading ? (
          <div className="table-empty">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
            <Bell size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
            <h3 style={{ margin: "0 0 6px", color: "var(--text-primary)", fontWeight: 700 }}>No notifications</h3>
            <p style={{ margin: 0, fontSize: 13 }}>You're all caught up! Notifications will appear here when price alerts trigger or system events occur.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {notifications.map((n) => (
              <div key={n.id} className="card" style={{
                padding: "12px 14px",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                background: n.read ? "var(--bg-surface)" : "var(--primary-light)",
                border: n.read ? "1px solid var(--border)" : "1px solid var(--primary)",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: n.read ? "var(--bg-surface-2)" : "var(--primary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: n.read ? "var(--text-muted)" : "white", flexShrink: 0,
                }}>
                  <Bell size={14} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: n.read ? 500 : 600, marginBottom: 2 }}>
                    {n.title || "Notification"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                    {n.message || n.details || "No details"}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 6, fontSize: 10, color: "var(--text-muted)", alignItems: "center" }}>
                    <span>{formatTime(n.createdAt)}</span>
                    {n.type && <span className="badge badge-primary" style={{ fontSize: 7, padding: "0 5px" }}>{n.type}</span>}
                    {n.link && (
                      <Link href={n.link} style={{ color: "var(--primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: 2 }}>
                        View <ExternalLink size={10} />
                      </Link>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(n.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, flexShrink: 0 }}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </AdminPageLayout.Section>
    </AdminPageLayout>
  );
}
