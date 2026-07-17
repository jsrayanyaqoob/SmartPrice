"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const ADMIN_EMAIL = "rayanyaqoob83@gmail.com";

export default function AdminPortalButton() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) {
          setChecked(true);
          return;
        }
        const data = await res.json();
        if (
          data?.user?.email === ADMIN_EMAIL &&
          data?.user?.role === "Admin"
        ) {
          setIsAdmin(true);
        }
      } catch (err) {
        // Not authenticated — not admin
        console.error("Admin check failed:", err);
      } finally {
        setChecked(true);
      }
    };
    checkAdmin();
  }, []);

  // Determine which portal we're in
  const isOnAdmin = pathname.startsWith("/admin");
  const targetHref = isOnAdmin ? "/dashboard" : "/admin";
  const tooltip = isOnAdmin ? "Switch to Customer Portal" : "Switch to Admin Portal";
  const icon = isOnAdmin ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <polyline points="16 18 22 12 16 6" />
      <line x1="22" y1="12" x2="10" y2="12" />
    </svg>
  );

  if (!checked || !isAdmin) return null;

  return (
    <div className="admin-switch-container">
      <Link
        href={targetHref}
        className="admin-switch-btn"
        aria-label={tooltip}
        title={tooltip}
      >
        <div className="admin-switch-icon">{icon}</div>
        <span className="admin-switch-label">{isOnAdmin ? "Go to Customer" : "Admin Panel"}</span>
      </Link>
    </div>
  );
}
