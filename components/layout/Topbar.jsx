"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Topbar({ searchPlaceholder = "Search products, brands, or paste a URL to analyze...", showAnalyze = false }) {
  const [searchValue, setSearchValue] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.user?.name) {
          setUserName(data.user.name);
        } else if (data?.user?.email) {
          setUserName(data.user.email);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, []);

  const initials = (userName || "User")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

  return (
    <div className="portal-topbar">
      {/* Search Bar */}
      <div
        style={{
          flex: 1,
          maxWidth: 560,
          position: "relative",
          display: "flex",
          alignItems: "center",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-muted)"
          strokeWidth="2"
          style={{ position: "absolute", left: 12 }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="input"
          style={{
            paddingLeft: 38,
            borderRadius: "var(--radius-full)",
            fontSize: 13,
            height: 40,
            background: "var(--bg-surface-2)",
            border: "1px solid transparent",
          }}
        />
        {showAnalyze && searchValue && (
          <button
            className="btn btn-primary btn-sm"
            style={{ position: "absolute", right: 4, borderRadius: "var(--radius-full)" }}
          >
            Analyze
          </button>
        )}
      </div>

      {/* Right Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
        {/* Notifications Bell */}
        <button
          aria-label="Notifications"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "none",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-secondary)",
            transition: "all 0.15s ease",
            position: "relative",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          <span
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--danger)",
              border: "2px solid white",
            }}
          />
        </button>

        {/* Help */}
        <button
          aria-label="Help"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "none",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-secondary)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </button>

        {/* Avatar */}
        <Link
          href="/settings"
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--primary-light), var(--primary))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
            overflow: "hidden",
            border: "2px solid var(--border)",
          }}
        >
          <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>{initials}</span>
        </Link>
      </div>
    </div>
  );
}
