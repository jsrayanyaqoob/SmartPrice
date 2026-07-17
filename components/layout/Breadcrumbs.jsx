"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

const LABEL_MAP = {
  dashboard: "Dashboard",
  products: "Products",
  alerts: "Alerts",
  insights: "Insights",
  wishlist: "Wishlist",
  settings: "Settings",
  compare: "Compare",
  "ai-assistant": "AI Assistant",
};

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Only show in /user portal pages
  if (!pathname.startsWith("/products") && !pathname.startsWith("/alerts") && !pathname.startsWith("/insights") && !pathname.startsWith("/wishlist") && !pathname.startsWith("/settings") && !pathname.startsWith("/ai-assistant")) {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);

  // Build crumbs: start with Dashboard
  const crumbs = [{ label: "Dashboard", href: "/dashboard" }];

  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;
    // Skip the first empty segment
    if (segment === "dashboard") continue;

    const label = LABEL_MAP[segment] || segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({ label, href: currentPath });
  }

  return (
    <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", marginBottom: 16, flexWrap: "wrap" }}>
      <Link
        href="/dashboard"
        style={{ color: "var(--text-muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, transition: "color 0.15s" }}
        onMouseEnter={(e) => e.currentTarget.style.color = "var(--primary)"}
        onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
      >
        <Home size={13} />
      </Link>
      {crumbs.map((crumb, idx) => (
        <span key={crumb.href} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <ChevronRight size={12} style={{ opacity: 0.4 }} />
          {idx === crumbs.length - 1 ? (
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              style={{ color: "var(--text-muted)", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--primary)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
