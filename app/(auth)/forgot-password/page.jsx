"use client";

import Link from "next/link";
import { useState } from "react";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Forgot Password Request", email);
    window.location.href = "/check-email";
  };

  const rightCard = (
    <div>
      <span className="badge badge-pro" style={{ fontSize: 9, marginBottom: 8, padding: "2px 6px" }}>
        AI Powered
      </span>
      <p style={{ fontSize: 11, color: "white", margin: 0, fontWeight: 500, lineHeight: 1.4 }}>
        Recover your access securely through our biometric verification nodes.
      </p>
    </div>
  );

  return (
    <AuthSplitLayout rightContent={rightCard}>
      <div style={{ maxWidth: 360, margin: "auto", width: "100%" }}>
        {/* Brand Header */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
            marginBottom: 48,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "var(--brand-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: "var(--primary)" }}>SmartPrice</span>
        </Link>

        {/* Title */}
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>
          Forgot password?
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 32 }}>
          No worries, we&apos;ll send you reset instructions.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label className="input-label" htmlFor="email">
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                required
                className="input"
                style={{ paddingLeft: 40 }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-muted)"
                strokeWidth="2"
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
          </div>

          <button type="submit" className="btn btn-gradient" style={{ width: "100%", height: 44 }}>
            Send Reset Link &rarr;
          </button>
        </form>

        <div style={{ marginTop: 48 }}>
          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to login
          </Link>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
