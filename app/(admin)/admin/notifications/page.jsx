"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Trash2, ExternalLink, RefreshCw, CheckCircle } from "lucide-react";
import AdminPageLayout from "@/components/layout/AdminPageLayout";

const TYPE_CONFIG = {
  price_drop: { icon: "📉", color: "var(--success)", bg: "var(--success-bg)" },
  price_alert: { icon: "📊", color: "var(--primary)", bg: "var(--primary-light)" },
  system: { icon: "⚙️", color: "var(--info)", bg: "var(--info-bg)" },
  warning: { icon: "⚠️", color: "var(--warning)", bg: "var(--warning-bg)" },
  error: { icon: "🚨", color: "var(--danger)", bg: "var(--danger-bg)" },
  admin: { icon: "👑", color: "var(--primary)", bg: "var(--primary-light)" },
  default: { icon: "🔔", color: "var(--text-muted)", bg: "var(--bg-surface-2)" },
};

function getTypeConfig(type) {
  return TYPE_CONFIG[type] || TYPE_CONFIG.default;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all" | "unread" | "read"
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetch("/api/admin/audit-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "page_view", entity: "notifications", details: "Viewed Notifications page" }),
    }).catch(() => {});

    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const readCount = notifications.length - unreadCount;

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setSelectedIds(new Set());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkSelectedRead = async () => {
    setBulkActionLoading(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (selectedIds.has(n.id) ? { ...n, read: true } : n))
        );
        setSelectedIds(new Set());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    setBulkActionLoading(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          fetch("/api/notifications", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notificationId: id }),
          })
        )
      );
      setNotifications((prev) => prev.filter((n) => !selectedIds.has(n.id)));
      setSelectedIds(new Set());
    } catch (err) {
      console.error(err);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredNotifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotifications.map((n) => n.id)));
    }
  };

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
          {selectedIds.size > 0 && (
            <>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleMarkSelectedRead}
                disabled={bulkActionLoading}
              >
                <CheckCheck size={14} /> Mark Read ({selectedIds.size})
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleDeleteSelected}
                disabled={bulkActionLoading}
                style={{ color: "var(--danger)" }}
              >
                <Trash2 size={14} /> Delete ({selectedIds.size})
              </button>
            </>
          )}
          {unreadCount > 0 && selectedIds.size === 0 && (
            <button className="btn btn-ghost btn-sm" onClick={handleMarkAllRead}>
              <CheckCheck size={14} /> Mark All Read
            </button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={fetchNotifications}>
            <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
          </button>
        </div>
      }
    >
      {/* KPI Cards */}
      <AdminPageLayout.KPIGrid>
        <div className="card admin-fade-in-delay-1 admin-card-hover" style={{ padding: 16 }}>
          <div className="kpi-label">Total</div>
          <div className="kpi-value">{notifications.length}</div>
        </div>
        <div className="card admin-fade-in-delay-2 admin-card-hover" style={{ padding: 16 }}>
          <div className="kpi-label">Unread</div>
          <div className="kpi-value" style={{ color: "var(--primary)" }}>{unreadCount}</div>
        </div>
        <div className="card admin-fade-in-delay-3 admin-card-hover" style={{ padding: 16 }}>
          <div className="kpi-label">Read</div>
          <div className="kpi-value" style={{ color: "var(--text-muted)" }}>{readCount}</div>
        </div>
        <div className="card admin-fade-in-delay-4 admin-card-hover" style={{ padding: 16 }}>
          <div className="kpi-label">Selected</div>
          <div className="kpi-value" style={{ color: selectedIds.size > 0 ? "var(--primary)" : "var(--text-muted)", fontSize: 20 }}>
            {selectedIds.size}
          </div>
        </div>
      </AdminPageLayout.KPIGrid>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 2 }}>
        {[
          { key: "all", label: "All", count: notifications.length },
          { key: "unread", label: "Unread", count: unreadCount },
          { key: "read", label: "Read", count: readCount },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setFilter(tab.key); setSelectedIds(new Set()); }}
            style={{
              padding: "8px 16px",
              border: "none",
              background: filter === tab.key ? "var(--primary)" : "transparent",
              color: filter === tab.key ? "white" : "var(--text-secondary)",
              borderRadius: "var(--radius-sm)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span style={{
                fontSize: 10,
                background: filter === tab.key ? "rgba(255,255,255,0.2)" : "var(--bg-surface-2)",
                color: filter === tab.key ? "white" : "var(--text-muted)",
                padding: "1px 7px",
                borderRadius: "999px",
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Select All Row */}
      {filteredNotifications.length > 0 && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "6px 14px",
          borderRadius: "var(--radius)",
          background: "var(--bg-surface-2)",
          fontSize: 12,
          color: "var(--text-muted)",
        }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={selectedIds.size === filteredNotifications.length && filteredNotifications.length > 0}
              onChange={toggleSelectAll}
              style={{ accentColor: "var(--primary)" }}
            />
            Select all {filteredNotifications.length}
          </label>
          {selectedIds.size > 0 && (
            <span style={{ color: "var(--primary)", fontWeight: 600 }}>
              {selectedIds.size} selected
            </span>
          )}
        </div>
      )}

      {/* Notifications List */}
      <AdminPageLayout.Section>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton-pulse" style={{
                height: 72,
                borderRadius: "var(--radius)",
                animationDelay: `${i * 0.05}s`,
              }} />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="detail-empty" style={{ padding: "60px 40px" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "var(--primary-light)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 16, fontSize: 24,
            }}>
              <Bell size={28} style={{ color: "var(--primary)" }} />
            </div>
            <h3 style={{ margin: "0 0 6px", color: "var(--text-primary)", fontWeight: 700, fontSize: 16 }}>
              No notifications
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", maxWidth: 380, lineHeight: 1.5 }}>
              You&apos;re all caught up! Notifications will appear here when price alerts trigger or system events occur.
            </p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="detail-empty" style={{ padding: "60px 40px" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "var(--bg-surface-2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 16,
            }}>
              <CheckCircle size={28} style={{ color: "var(--success)" }} />
            </div>
            <h3 style={{ margin: "0 0 6px", color: "var(--text-primary)", fontWeight: 700, fontSize: 16 }}>
              No {filter} notifications
            </h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
              {filter === "unread" ? "You've read everything! 🎉" : "No read notifications yet."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filteredNotifications.map((n, idx) => {
              const typeCfg = getTypeConfig(n.type);
              const isUnread = !n.read;
              const isSelected = selectedIds.has(n.id);

              return (
                <div
                  key={n.id}
                  className="admin-card-hover"
                  onClick={() => toggleSelect(n.id)}
                  style={{
                    padding: "14px 16px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    borderRadius: "var(--radius-lg)",
                    background: isSelected
                      ? "var(--primary-light)"
                      : isUnread
                        ? "var(--bg-surface)"
                        : "var(--bg-app)",
                    border: isSelected
                      ? "2px solid var(--primary)"
                      : isUnread
                        ? "1px solid var(--border)"
                        : "1px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    position: "relative",
                    animation: `adminFadeIn 0.3s ease ${idx * 0.04}s both`,
                  }}
                >
                  {/* Checkbox */}
                  <div style={{ flexShrink: 0, paddingTop: 4 }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(n.id)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ accentColor: "var(--primary)", cursor: "pointer" }}
                    />
                  </div>

                  {/* Icon */}
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: isUnread ? typeCfg.bg : "var(--bg-surface-2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, fontSize: 16,
                  }}>
                    {typeCfg.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 3,
                    }}>
                      <span style={{
                        fontSize: 13,
                        fontWeight: isUnread ? 700 : 500,
                        color: "var(--text-primary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {n.title || "Notification"}
                      </span>
                      {isUnread && (
                        <span style={{
                          width: 8, height: 8, borderRadius: "50%",
                          background: "var(--primary)",
                          flexShrink: 0,
                        }} />
                      )}
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      lineHeight: 1.4,
                      marginBottom: 6,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}>
                      {n.message || n.details || "No details"}
                    </div>
                    <div style={{
                      display: "flex",
                      gap: 10,
                      fontSize: 11,
                      color: "var(--text-muted)",
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {formatTime(n.createdAt)}
                      </span>
                      {n.type && (
                        <span className="badge badge-primary" style={{
                          fontSize: 9,
                          padding: "1px 7px",
                          background: typeCfg.bg,
                          color: typeCfg.color,
                          fontWeight: 600,
                        }}>
                          {n.type.replace(/_/g, " ")}
                        </span>
                      )}
                      {n.link && (
                        <Link
                          href={n.link}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            color: "var(--primary)",
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                            fontWeight: 600,
                          }}
                        >
                          View <ExternalLink size={10} />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDelete(n.id, e)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      padding: 6,
                      flexShrink: 0,
                      borderRadius: "var(--radius-sm)",
                      transition: "all 0.15s ease",
                    }}
                    className="notif-delete-btn"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </AdminPageLayout.Section>
    </AdminPageLayout>
  );
}
