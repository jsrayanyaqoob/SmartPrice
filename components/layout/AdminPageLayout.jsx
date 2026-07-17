"use client";

/**
 * AdminPageLayout — reusable layout wrapper for all admin pages.
 *
 * Provides consistent spacing, fade-in animations for title/subtitle,
 * and optional action buttons in the header area.
 *
 * Usage:
 *   import AdminPageLayout from "@/components/layout/AdminPageLayout";
 *
 *   <AdminPageLayout title="Page Title" subtitle="Optional description.">
 *     <AdminPageLayout.KPIGrid>
 *       <Card>...</Card>
 *       ...
 *     </AdminPageLayout.KPIGrid>
 *     <AdminPageLayout.Section title="Section Title">
 *       ...content...
 *     </AdminPageLayout.Section>
 *   </AdminPageLayout>
 */

function KPIGrid({ children }) {
  return <div className="kpi-grid">{children}</div>;
}

function KPICard({ label, value, sub, color, delay = 0 }) {
  return (
    <div className={`card admin-fade-in-delay-${delay + 1}`} style={{ padding: 16 }}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={color ? { color } : undefined}>{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

function Section({ title, desc, children, delay = 0 }) {
  return (
    <div className={`card admin-fade-in${delay ? `-delay-${delay}` : ""}`} style={{ padding: 20 }}>
      {title && (
        <div style={{ marginBottom: desc ? 8 : 16 }}>
          <h3 className="card-title" style={{ margin: 0 }}>{title}</h3>
          {desc && <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "4px 0 0" }}>{desc}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

function ActionButton({ children, onClick, variant = "primary", disabled, icon, ...props }) {
  const cls = variant === "primary" ? "btn btn-primary btn-sm" :
              variant === "gradient" ? "btn btn-gradient btn-sm" :
              variant === "ghost" ? "btn btn-ghost btn-sm" :
              "btn btn-primary btn-sm";
  return (
    <button className={cls} onClick={onClick} disabled={disabled} style={{ display: "inline-flex", alignItems: "center", gap: 6, ...props.style }} {...props}>
      {icon && <span style={{ display: "inline-flex" }}>{icon}</span>}
      {children}
    </button>
  );
}

export default function AdminPageLayout({ title, subtitle, actions, children, maxWidth }) {
  return (
    <div className="admin-page" style={maxWidth ? { maxWidth } : undefined}>
      {/* Header */}
      {(title || actions) && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: subtitle ? 0 : 24 }}>
          <div>
            {title && <h2 className="admin-page-title" style={{ margin: 0 }}>{title}</h2>}
            {subtitle && <p className="admin-page-subtitle">{subtitle}</p>}
          </div>
          {actions && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {children}
      </div>
    </div>
  );
}

AdminPageLayout.KPIGrid = KPIGrid;
AdminPageLayout.KPICard = KPICard;
AdminPageLayout.Section = Section;
AdminPageLayout.ActionButton = ActionButton;
