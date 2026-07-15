"use client";

import Link from "next/link";
import { useState } from "react";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const rightCard = (
    <div>
      <div style={{ display: "flex", gap: -6, marginBottom: 8 }}>
        {/* Avatars overlaps */}
        <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#4f23d4", border: "2px solid white", display: "inline-block" }}></span>
        <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#3b5bdb", border: "2px solid white", display: "inline-block", marginLeft: -8 }}></span>
        <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#9ca3af", border: "2px solid white", display: "inline-block", marginLeft: -8 }}></span>
      </div>
      <p style={{ fontSize: 11, color: "white", margin: 0, fontWeight: 500, lineHeight: 1.4 }}>
        Join 50k+ shoppers saving with AI-powered price tracking.
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
            marginBottom: 24,
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
          Create your account
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 24 }}>
          Start your journey to smarter shopping.
        </p>

        {/* Form */}
        {error && (
          <div style={{ padding: "10px 14px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid var(--danger)", color: "var(--danger)", borderRadius: 8, fontSize: 13, marginBottom: 16, fontWeight: 500 }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="input-label" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Alex Rivera"
              required
              className="input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="input-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="alex@example.com"
              required
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="input-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {/* Password strength bar representation */}
            <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
              <div style={{ flex: 1, height: 4, borderRadius: 2, background: password.length >= 8 ? "var(--success)" : "var(--border)" }}></div>
              <div style={{ flex: 1, height: 4, borderRadius: 2, background: password.length >= 10 ? "var(--success)" : "var(--border)" }}></div>
              <div style={{ flex: 1, height: 4, borderRadius: 2, background: password.length >= 12 ? "var(--success)" : "var(--border)" }}></div>
              <div style={{ flex: 1, height: 4, borderRadius: 2, background: password.length >= 14 ? "var(--success)" : "var(--border)" }}></div>
            </div>
            <span style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, display: "block" }}>
              Strength: {password.length === 0 ? "No password" : password.length < 8 ? "Weak" : password.length < 12 ? "Medium" : "Strong"}
            </span>
          </div>

          <div>
            <label className="input-label" htmlFor="confirm-password">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              required
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <input
              type="checkbox"
              id="agree"
              required
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              style={{ accentColor: "var(--primary)", marginTop: 3 }}
            />
            <label htmlFor="agree" style={{ fontSize: 13, color: "var(--text-secondary)", cursor: "pointer", lineHeight: 1.4 }}>
              I agree to the{" "}
              <Link href="/terms" style={{ color: "var(--primary)", fontWeight: 500, textDecoration: "none" }}>
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" style={{ color: "var(--primary)", fontWeight: 500, textDecoration: "none" }}>
                Privacy Policy
              </Link>
              .
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", height: 44, marginTop: 8 }} disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="divider-text" style={{ margin: "20px 0" }}>
          OR SIGN UP WITH
        </div>

        {/* OAuth Buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <button className="btn btn-ghost" style={{ fontSize: 13, height: 40 }}>
            Google
          </button>
          <button className="btn btn-ghost" style={{ fontSize: 13, height: 40 }}>
            GitHub
          </button>
        </div>

        <div style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>
            Log In
          </Link>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
