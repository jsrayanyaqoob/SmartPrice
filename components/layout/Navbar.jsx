"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#deals", label: "Deals" },
  { href: "/#pricing", label: "Pricing" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="nav-marketing" role="navigation" aria-label="Main navigation">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", height: 64, gap: 32 }}>
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
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "var(--brand-gradient)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="white"
                />
              </svg>
            </div>
            <span
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: "var(--primary)",
                letterSpacing: "-0.02em",
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

          {/* CTA Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link
              href="/login"
              style={{
                padding: "8px 18px",
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
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
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
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
