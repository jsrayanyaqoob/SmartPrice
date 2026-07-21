"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#deals", label: "Deals" },
  { href: "/#pricing", label: "Pricing" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <nav className="nav-marketing" role="navigation" aria-label="Main navigation">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", height: 64, gap: 16 }}>
          {/* Logo */}
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontWeight: 800,
                fontSize: 20,
                color: "var(--primary)",
                letterSpacing: "-0.03em",
              }}
            >
              SmartPrice
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div
            style={{ display: "flex", gap: 4, flex: 1 }}
            className="desktop-nav"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "6px 14px",
                  borderRadius: "var(--radius)",
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: "none",
                  color:
                    pathname === link.href
                      ? "var(--primary)"
                      : "var(--text-secondary)",
                  borderBottom:
                    pathname === link.href
                      ? "2px solid var(--primary)"
                      : "2px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Buttons + Dark Mode Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              className="theme-toggle-btn"
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius)",
                border: "1.5px solid var(--border)",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-secondary)",
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}
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

            <Link
              href="/login"
              style={{
                padding: "8px 16px",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--text-primary)",
                textDecoration: "none",
                borderRadius: "var(--radius)",
                transition: "all 0.15s ease",
              }}
            >
              Log In
            </Link>
            <Link href="/register" className="btn btn-gradient btn-pill" style={{ padding: "9px 22px" }}>
              Get Started
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            id="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={isMenuOpen}
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 8,
              color: "var(--text-primary)",
            }}
            className="mobile-menu-btn"
          >
            {isMenuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            style={{
              borderTop: "1px solid var(--border)",
              padding: "12px 0 20px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--radius)",
                  fontSize: 15,
                  fontWeight: 500,
                  textDecoration: "none",
                  color: "var(--text-secondary)",
                }}
              >
                {link.label}
              </Link>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
              <button
                onClick={toggleDarkMode}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                className="btn btn-ghost"
                style={{ flex: 1, justifyContent: "center", gap: 8 }}
              >
                {darkMode ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                )}
                {darkMode ? "Light Mode" : "Dark Mode"}
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              <Link href="/login" className="btn btn-ghost" style={{ justifyContent: "center" }}>
                Log In
              </Link>
              <Link href="/register" className="btn btn-gradient btn-pill">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .theme-toggle-btn:hover {
          background: var(--primary-light) !important;
          border-color: var(--primary) !important;
          color: var(--primary) !important;
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
