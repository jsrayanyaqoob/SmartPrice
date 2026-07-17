"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { X, UserPlus, BellRing, Package, AlertTriangle } from "lucide-react";

const ToastContext = createContext({
  addToast: () => {},
  toasts: [],
});

export function useAdminToasts() {
  return useContext(ToastContext);
}

export default function AdminToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [initialized, setInitialized] = useState(false);
  const countsRef = useRef({ users: 0, alerts: 0, auditLogs: 0 });

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...toast, id }]);
    // Auto-dismiss after 6 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Poll for new events every 15 seconds
  useEffect(() => {
    const checkForNewEvents = async () => {
      try {
        const [usersRes, alertsRes, logsRes] = await Promise.all([
          fetch("/api/admin/users?limit=1"),
          fetch("/api/alerts"),
          fetch("/api/admin/audit-logs?limit=1"),
        ]);

        const usersData = usersRes.ok ? await usersRes.json() : null;
        const alertsData = alertsRes.ok ? await alertsRes.json() : null;
        const logsData = logsRes.ok ? await logsRes.json() : null;

        const totalUsers = usersData?.total || 0;
        const totalAlerts = alertsData?.alerts?.length || 0;
        const totalLogs = logsData?.total || 0;

        if (!initialized) {
          countsRef.current = { users: totalUsers, alerts: totalAlerts, auditLogs: totalLogs };
          setInitialized(true);
          return;
        }

        const prev = countsRef.current;

        // Check for new users
        if (totalUsers > prev.users) {
          const diff = totalUsers - prev.users;
          addToast({
            type: "user",
            title: `${diff} New User${diff > 1 ? "s" : ""} Registered`,
            message: `${diff} new user${diff > 1 ? "s have" : " has"} joined the platform.`,
            icon: UserPlus,
          });
        }

        // Check for new alerts
        if (totalAlerts > prev.alerts) {
          const diff = totalAlerts - prev.alerts;
          addToast({
            type: "alert",
            title: `${diff} New Price Alert${diff > 1 ? "s" : ""}`,
            message: `${diff} new price alert${diff > 1 ? "s have" : " has"} been created.`,
            icon: BellRing,
          });
        }

        // Check for new audit log entries (admin activity)
        if (totalLogs > prev.auditLogs) {
          const diff = totalLogs - prev.auditLogs;
          if (diff > 0) {
            addToast({
              type: "audit",
              title: "Admin Activity Detected",
              message: `${diff} new audit log entr${diff > 1 ? "ies" : "y"}.`,
              icon: Package,
            });
          }
        }

        // Always update counts to latest
        countsRef.current = { users: totalUsers, alerts: totalAlerts, auditLogs: totalLogs };
      } catch {
        // Silently fail — polling is non-critical
      }
    };

    // Initial check
    checkForNewEvents();

    // Poll every 15 seconds (stable interval — no deps to reset it)
    const interval = setInterval(checkForNewEvents, 15000);
    return () => clearInterval(interval);
  }, [initialized, addToast]); // Only depends on initialized + addToast — no count resets

  return (
    <ToastContext.Provider value={{ addToast, toasts }}>
      {children}
      
      {/* Toast Container - fixed bottom-right */}
      <div style={{
        position: "fixed",
        bottom: 80,
        right: 24,
        zIndex: 9998,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        maxWidth: 380,
      }}>
        {toasts.map((toast) => {
          const IconComponent = toast.icon || AlertTriangle;
          const colors = {
            user: { bg: "rgba(16, 185, 129, 0.1)", border: "var(--success)", iconColor: "var(--success)" },
            alert: { bg: "rgba(107, 51, 246, 0.1)", border: "var(--primary)", iconColor: "var(--primary)" },
            audit: { bg: "rgba(59, 91, 219, 0.1)", border: "var(--brand-blue)", iconColor: "var(--brand-blue)" },
          };
          const color = colors[toast.type] || colors.alert;

          return (
            <div
              key={toast.id}
              className="animate-slide-right"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "12px 14px",
                background: "var(--bg-surface)",
                border: `1px solid ${color.border}`,
                borderRadius: 12,
                boxShadow: "var(--shadow-lg)",
                cursor: "pointer",
                transition: "opacity 0.3s ease",
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: color.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: color.iconColor,
                flexShrink: 0,
              }}>
                <IconComponent size={16} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{toast.title}</div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{toast.message}</div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); dismissToast(toast.id); }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  padding: 2,
                  flexShrink: 0,
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
