"use client";

import { useState, useEffect } from "react";
import AdminPageLayout from "@/components/layout/AdminPageLayout";

export default function AIManagementPage() {
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Page-view audit log
    fetch("/api/admin/audit-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "page_view", entity: "ai_management", details: "Viewed AI Management page" }),
    }).catch(() => {});

    const fetchData = async () => {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          setProductCount(data.products?.length || 0);
        }
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const configItems = [
    { label: "Data Source", value: "Apify Web Scraper" },
    { label: "Products in Feed", value: loading ? "..." : `${productCount}` },
    { label: "Price Cache Duration", value: "5 minutes" },
    { label: "Refresh Interval", value: "On page load" },
    { label: "Alert Notification", value: "Email + In-app" },
    { label: "User Auth", value: "JWT + bcrypt" },
  ];

  return (
    <AdminPageLayout title="API & Configuration" subtitle="View current platform configuration and data source settings.">
      <AdminPageLayout.Section title="Active Integrations">
        <div className="integrations-list">
          <div className="integration-item">
            <div className="integration-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              </svg>
            </div>
            <div className="integration-info">
              <div className="integration-name">Apify Dataset</div>
              <div className="integration-status">Connected</div>
            </div>
          </div>
          <div className="integration-item">
            <div className="integration-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2">
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
              </svg>
            </div>
            <div className="integration-info">
              <div className="integration-name">PostgreSQL Database</div>
              <div className="integration-status">Connected</div>
            </div>
          </div>
          <div className="integration-item">
            <div className="integration-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>
            <div className="integration-info">
              <div className="integration-name">Authentication</div>
              <div className="integration-status">JWT + bcrypt</div>
            </div>
          </div>
        </div>
      </AdminPageLayout.Section>

      <AdminPageLayout.Section title="Platform Configuration">
        <div className="config-items">
          {configItems.map((c, idx) => (
            <div key={idx} className="config-row">
              <span className="config-label">{c.label}</span>
              <span className="config-value">{c.value}</span>
            </div>
          ))}
        </div>
      </AdminPageLayout.Section>

      <AdminPageLayout.Section title="Environment Variables">
        <div className="env-list">
          <div className="env-item">
            <code className="env-key">DATABASE_URL</code>
            <span className="env-status">Set</span>
          </div>
          <div className="env-item">
            <code className="env-key">JWT_SECRET</code>
            <span className="env-status">Set</span>
          </div>
          <div className="env-item">
            <code className="env-key">APIFY_TOKEN</code>
            <span className="env-status">Set</span>
          </div>
          <div className="env-item">
            <code className="env-key">GEMINI_API_KEY</code>
            <span className="env-status">Optional</span>
          </div>
        </div>
      </AdminPageLayout.Section>
    </AdminPageLayout>
  );
}
