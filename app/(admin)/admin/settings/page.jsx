"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle, AlertTriangle, Database, RefreshCw } from "lucide-react";
import AdminPageLayout from "@/components/layout/AdminPageLayout";

const DEFAULT_SETTINGS = {
  siteName: "SmartPrice",
  siteDescription: "AI-Powered Price Comparison Platform",
  refreshInterval: "300",
  cacheDuration: "5",
  dataSource: "Apify Web Scraper",
  apifyToken: "••••••••••••••••",
  geminiKey: "••••••••••••••••",
  enableRegistration: true,
  enableAlerts: true,
  enableWishlist: true,
  maintenanceMode: false,
  alertNotificationEmail: true,
  alertNotificationPush: true,
  twoFactorEnforced: false,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loaded, setLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState({ text: "", type: "" });
  const [lastSync, setLastSync] = useState("");

  useEffect(() => {
    // Page-view audit log
    fetch("/api/admin/audit-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "page_view", entity: "settings", details: "Viewed Admin Settings page" }),
    }).catch(() => {});

    // Load saved settings from localStorage
    try {
      const stored = localStorage.getItem("smartprice-admin-settings");
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
      }
    } catch {}
    setLoaded(true);
  }, []);

  const update = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: "", type: "" });
    try {
      localStorage.setItem("smartprice-admin-settings", JSON.stringify(settings));
      // Also log the settings change
      await fetch("/api/admin/audit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "settings_updated",
          entity: "settings",
          details: "Updated system configuration settings",
        }),
      }).catch(() => {});
      setMessage({ text: "Settings saved successfully.", type: "success" });
    } catch {
      setMessage({ text: "Failed to save settings.", type: "error" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const Section = ({ title, desc, children }) => (
    <div className="card" style={{ padding: 20 }}>
      <h3 className="card-title" style={{ marginBottom: 4 }}>{title}</h3>
      {desc && <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 16px" }}>{desc}</p>}
      {children}
    </div>
  );

  const Field = ({ label, desc, children }) => (
    <div style={{ marginBottom: 16 }}>
      <label className="input-label" style={{ fontSize: 10, marginBottom: 4 }}>{label}</label>
      {desc && <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>{desc}</div>}
      {children}
    </div>
  );

  const ToggleRow = ({ label, checked, onChange }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
      <span style={{ fontSize: 13 }}>{label}</span>
      <label className="toggle">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="toggle-track" /><span className="toggle-thumb" />
      </label>
    </div>
  );

  if (!loaded) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 720 }}>
        <div className="skeleton-pulse" style={{ height: 32, width: 260, borderRadius: 8, marginBottom: 4 }} />
        <div className="skeleton-pulse" style={{ height: 16, width: 400, borderRadius: 8, marginBottom: 20 }} />
        <div className="skeleton-pulse" style={{ height: 200, borderRadius: 12 }} />
        <div className="skeleton-pulse" style={{ height: 120, borderRadius: 12 }} />
      </div>
    );
  }

  return (
    <AdminPageLayout title="System Settings" subtitle="Configure platform-wide settings, integrations, and feature toggles." maxWidth={720}>
      {message.text && (
        <div style={{
          padding: "8px 14px", borderRadius: 8, marginBottom: 14, fontSize: 12, fontWeight: 600,
          display: "flex", alignItems: "center", gap: 6,
          background: message.type === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
          color: message.type === "success" ? "var(--success)" : "var(--danger)",
          border: `1px solid ${message.type === "success" ? "var(--success)" : "var(--danger)"}`,
        }}>
          {message.type === "success" ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
          {message.text}
        </div>
      )}

      <Section title="General" desc="Basic platform information and branding.">
        <Field label="Site Name" desc="The name displayed across the platform.">
          <input className="input" value={settings.siteName} onChange={(e) => update("siteName", e.target.value)} style={{ maxWidth: 400 }} />
        </Field>
        <Field label="Site Description" desc="Meta description for SEO and headers.">
          <input className="input" value={settings.siteDescription} onChange={(e) => update("siteDescription", e.target.value)} style={{ maxWidth: 400 }} />
        </Field>
      </Section>

      <Section title="Data & Refresh" desc="Configure how often data is refreshed and cached.">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Refresh Interval (seconds)" desc="How often to fetch new data.">
            <input type="number" className="input" value={settings.refreshInterval} onChange={(e) => update("refreshInterval", e.target.value)} />
          </Field>
          <Field label="Cache Duration (minutes)" desc="How long to cache product data.">
            <input type="number" className="input" value={settings.cacheDuration} onChange={(e) => update("cacheDuration", e.target.value)} />
          </Field>
        </div>
        <Field label="Data Source" desc="The primary data source for product feed.">
          <select className="input" value={settings.dataSource} onChange={(e) => update("dataSource", e.target.value)} style={{ maxWidth: 300 }}>
            <option value="Apify Web Scraper">Apify Web Scraper</option>
            <option value="Manual Upload">Manual Upload</option>
            <option value="API Feed">API Feed</option>
          </select>
        </Field>

        {/* Product Sync Section */}
        <div style={{ marginTop: 20, padding: 16, background: "var(--bg-surface-2)", borderRadius: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Database size={16} style={{ color: "var(--primary)" }} />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Product Database Sync</span>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 12px" }}>
            Sync product data from all connected Apify data sources into the database.
            Products from Amazon, Walmart, Best Buy, eBay, and other sources will be fetched,
            normalized, and stored in your PostgreSQL database for fast querying.
          </p>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={async () => {
                setSyncing(true);
                setSyncMessage({ text: "Syncing products from all data sources...", type: "" });
                try {
                  const res = await fetch("/api/products/sync", { method: "POST" });
                  const data = await res.json();

                  // Log the sync action
                  fetch("/api/admin/audit-logs", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      action: data.status === "success" ? "product_sync_completed" : "product_sync_failed",
                      entity: "products",
                      details: data.status === "success"
                        ? `Inserted ${data.stats.inserted}, updated ${data.stats.updated} (${data.stats.elapsed})`
                        : data.message,
                    }),
                  }).catch(() => {});

                  if (data.status === "success") {
                    setSyncMessage({
                      text: `Sync complete! ${data.stats.inserted} new products, ${data.stats.updated} updated (${data.stats.elapsed})`,
                      type: "success",
                    });
                    setLastSync(new Date().toLocaleString());
                  } else if (data.status === "in_progress") {
                    setSyncMessage({ text: "Sync already in progress...", type: "" });
                  } else if (data.status === "skipped") {
                    setSyncMessage({ text: "Sync skipped: no APIFY_TOKEN configured.", type: "warning" });
                  } else {
                    setSyncMessage({ text: `Sync failed: ${data.message}`, type: "error" });
                  }
                } catch (err) {
                  setSyncMessage({ text: `Sync error: ${err.message}`, type: "error" });
                } finally {
                  setSyncing(false);
                  setTimeout(() => setSyncMessage({ text: "", type: "" }), 5000);
                }
              }}
              disabled={syncing}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <RefreshCw size={14} className={syncing ? "spin" : ""} />
              {syncing ? "Syncing..." : "Sync Products Now"}
            </button>
            {lastSync && (
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                Last sync: {lastSync}
              </span>
            )}
          </div>
          {syncMessage.text && (
            <div style={{
              marginTop: 10, padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500,
              background: syncMessage.type === "success" ? "rgba(34, 197, 94, 0.1)" :
                          syncMessage.type === "warning" ? "rgba(245, 158, 11, 0.1)" :
                          syncMessage.type === "error" ? "rgba(239, 68, 68, 0.1)" : "transparent",
              color: syncMessage.type === "success" ? "var(--success)" :
                     syncMessage.type === "warning" ? "var(--warning)" :
                     syncMessage.type === "error" ? "var(--danger)" : "var(--text-secondary)",
            }}>
              {syncMessage.text}
            </div>
          )}
        </div>
      </Section>

      <Section title="Integrations" desc="Configure API keys and external service connections.">
        <Field label="Apify Token" desc="Token for Apify web scraping service.">
          <input className="input" type="password" value={settings.apifyToken} onChange={(e) => update("apifyToken", e.target.value)} style={{ maxWidth: 400 }} />
        </Field>
        <Field label="Gemini AI API Key" desc="Key for Gemini AI budget planner.">
          <input className="input" type="password" value={settings.geminiKey} onChange={(e) => update("geminiKey", e.target.value)} style={{ maxWidth: 400 }} />
        </Field>
        <div style={{ display: "flex", gap: 8, fontSize: 11, color: "var(--text-muted)" }}>
          <span className="badge badge-success" style={{ fontSize: 9 }}>DATABASE_URL ✓</span>
          <span className="badge badge-success" style={{ fontSize: 9 }}>JWT_SECRET ✓</span>
          <span className="badge badge-primary" style={{ fontSize: 9 }}>APIFY_TOKEN ✓</span>
          <span className="badge badge-primary" style={{ fontSize: 9 }}>GEMINI_API_KEY •</span>
        </div>
      </Section>

      <Section title="Feature Toggles" desc="Enable or disable platform features.">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          <ToggleRow label="User Registration" checked={settings.enableRegistration} onChange={(v) => update("enableRegistration", v)} />
          <ToggleRow label="Price Alerts" checked={settings.enableAlerts} onChange={(v) => update("enableAlerts", v)} />
          <ToggleRow label="Wishlist" checked={settings.enableWishlist} onChange={(v) => update("enableWishlist", v)} />
          <ToggleRow label="Maintenance Mode" checked={settings.maintenanceMode} onChange={(v) => update("maintenanceMode", v)} />
        </div>
      </Section>

      <Section title="Security" desc="Authentication and security settings.">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          <ToggleRow label="Email Notifications" checked={settings.alertNotificationEmail} onChange={(v) => update("alertNotificationEmail", v)} />
          <ToggleRow label="Push Notifications" checked={settings.alertNotificationPush} onChange={(v) => update("alertNotificationPush", v)} />
          <ToggleRow label="Enforce 2FA" checked={settings.twoFactorEnforced} onChange={(v) => update("twoFactorEnforced", v)} />
        </div>
      </Section>

      <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 0 24px" }}>
        <button className="btn btn-gradient" onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Save size={16} />{saving ? "Saving..." : "Save All Settings"}
        </button>
      </div>
    </AdminPageLayout>
  );
}
