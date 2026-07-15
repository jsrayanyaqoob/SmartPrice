"use client";

import Link from "next/link";
import { useState } from "react";

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section className="hero-section" id="hero">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 48,
            alignItems: "center",
          }}
        >
          {/* Left Content */}
          <div className="animate-fade-up">
            <h1 className="heading-hero" style={{ marginBottom: 20 }}>
              Shop Smarter with{" "}
              <span style={{ color: "var(--primary)" }}>Artificial Intelligence.</span>
            </h1>
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.7,
                color: "var(--text-secondary)",
                marginBottom: 32,
                maxWidth: 480,
              }}
            >
              SmartPrice scans thousands of retailers in real-time to find you the absolute lowest
              price. Instant alerts, AI insights, and guaranteed savings.
            </p>

            {/* Search Bar */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 32,
                maxWidth: 460,
              }}
            >
              <div style={{ flex: 1, position: "relative" }}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--text-muted)"
                  strokeWidth="2"
                  style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search product, brand or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input"
                  id="hero-search"
                  style={{
                    paddingLeft: 42,
                    height: 48,
                    borderRadius: "var(--radius-full)",
                    fontSize: 14,
                    border: "2px solid var(--border)",
                  }}
                />
              </div>
              <button className="btn btn-gradient btn-pill" style={{ height: 48, padding: "0 24px", fontSize: 15 }}>
                SEARCH
              </button>
            </div>

            {/* Featured On */}
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>Featured on</span>
              {["TechCrunch", "Product Hunt", "Forbes"].map((name) => (
                <span
                  key={name}
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* Right Visual */}
          <div
            className="animate-fade-up animate-delay-200"
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {/* Phone mockup - gradient background */}
            <div
              style={{
                width: "100%",
                maxWidth: 420,
                aspectRatio: "4/5",
                borderRadius: 24,
                background: "linear-gradient(135deg, #ede9ff 0%, #ddd6fe 30%, #c4b5fd 70%, #a78bfa 100%)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Floating product card */}
              <div
                style={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  background: "white",
                  borderRadius: 12,
                  padding: "12px 16px",
                  boxShadow: "var(--shadow-lg)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  animation: "fadeInUp 0.6s ease 0.4s both",
                }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "var(--bg-surface-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>MacBook Pro</div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", textDecoration: "line-through" }}>$1,999</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>$1,749</span>
                  </div>
                </div>
                <span className="badge badge-success" style={{ fontSize: 10 }}>↓ 13%</span>
              </div>

              {/* Bottom floating card */}
              <div
                style={{
                  position: "absolute",
                  bottom: 24,
                  left: 20,
                  right: 20,
                  background: "white",
                  borderRadius: 12,
                  padding: "12px 16px",
                  boxShadow: "var(--shadow-lg)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  animation: "fadeInUp 0.6s ease 0.6s both",
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 8, background: "#f3f4f8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand-blue)" strokeWidth="2">
                    <path d="M12 2v20M2 12h20" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>Sony α7M5</div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", textDecoration: "line-through" }}>$399</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>$298</span>
                  </div>
                </div>
                <span className="badge badge-success" style={{ fontSize: 10 }}>↓ 25%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hero-section > div > div { grid-template-columns: 1fr !important; }
          .hero-section > div > div > div:last-child { display: none; }
        }
      `}</style>
    </section>
  );
}
