"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import NotificationsDropdown from "@/components/NotificationsDropdown";

export default function Topbar({ searchPlaceholder = "Search products, brands, or paste a URL to analyze...", showAnalyze = false, settingsHref = "/settings" }) {
  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userName, setUserName] = useState("");
  const searchRef = useRef(null);
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useTheme();

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

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (searchValue.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(searchValue)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions((data.products || []).slice(0, 5));
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setShowSuggestions(false);
      router.push(`/products?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const initials = (userName || "User")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

  return (
    <div className="portal-topbar">
      {/* Search Bar with Autocomplete */}
      <div ref={searchRef} style={{ flex: 1, maxWidth: 560, position: "relative" }}>
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", alignItems: "center", position: "relative" }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="2"
            style={{ position: "absolute", left: 12, zIndex: 1 }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            className="input"
            style={{
              paddingLeft: 38,
              paddingRight: showAnalyze && searchValue ? 80 : 14,
              borderRadius: "var(--radius-full)",
              fontSize: 13,
              height: 40,
              background: "var(--bg-surface-2)",
              border: "1px solid transparent",
              width: "100%",
            }}
          />
          {showAnalyze && searchValue && (
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              style={{ position: "absolute", right: 4, borderRadius: "var(--radius-full)", zIndex: 1 }}
            >
              Search
            </button>
          )}
        </form>

        {/* Autocomplete Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: 4,
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              boxShadow: "var(--shadow-lg)",
              zIndex: 100,
              overflow: "hidden",
            }}
          >
            {suggestions.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                onClick={() => { setShowSuggestions(false); setSearchValue(""); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 14px",
                  textDecoration: "none",
                  transition: "background 0.15s",
                  borderBottom: "1px solid var(--border)",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-surface-2)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} loading="lazy" decoding="async" style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover" }} />
                ) : (
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: "var(--bg-surface-2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>📦</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.name || p.title}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {p.brand} • {p.bestPrice || `$${Number(p.price || 0).toFixed(2)}`}
                  </div>
                </div>
              </Link>
            ))}
            <Link
              href={`/products?q=${encodeURIComponent(searchValue)}`}
              onClick={() => { setShowSuggestions(false); }}
              style={{
                display: "block",
                padding: "10px 14px",
                textAlign: "center",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--primary)",
                textDecoration: "none",
              }}
            >
              View all results
            </Link>
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "1.5px solid var(--border)",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary-light)"; e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
        >
          {darkMode ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
        </button>

        {/* Notifications Bell with Dropdown */}
        <NotificationsDropdown />

        {/* Help Button */}
        <Link
          href="/help"
          aria-label="Help Center"
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
            textDecoration: "none",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary-light)"; e.currentTarget.style.color = "var(--primary)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </Link>

        {/* Avatar - goes to contextual settings */}
        <Link
          href={settingsHref}
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
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 0 3px var(--primary-light)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
        >
          <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>{initials}</span>
        </Link>
      </div>
    </div>
  );
}
