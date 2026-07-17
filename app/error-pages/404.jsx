"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function NotFoundErrorPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown <= 0) {
      router.push("/");
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-app)",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 520,
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* Large decorative 404 */}
        <div
          style={{
            fontSize: 120,
            fontWeight: 900,
            lineHeight: 1,
          background: "var(--brand-gradient)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: 8,
          letterSpacing: "-0.04em",
          }}
        >
          404
        </div>

        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>

        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "var(--text-primary)",
            margin: "0 0 8px",
          }}
        >
          Page Not Found
        </h1>

        <p
          style={{
            fontSize: 14,
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            margin: "0 0 28px",
            maxWidth: 380,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          The page you are looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Quick links */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginBottom: 32,
          }}
        >
          <Link
            href="/"
            className="btn btn-gradient btn-pill"
            style={{
              padding: "12px 28px",
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            ← Back to Home
          </Link>
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/products"
              style={{
                padding: "8px 18px",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--primary)",
                textDecoration: "none",
                borderRadius: 8,
                border: "1px solid var(--border)",
                transition: "all 0.15s ease",
              }}
            >
              Browse Products
            </Link>
            <Link
              href="/dashboard"
              style={{
                padding: "8px 18px",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--primary)",
                textDecoration: "none",
                borderRadius: 8,
                border: "1px solid var(--border)",
                transition: "all 0.15s ease",
              }}
            >
              Go to Dashboard
            </Link>
            <Link
              href="/help"
              style={{
                padding: "8px 18px",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--primary)",
                textDecoration: "none",
                borderRadius: 8,
                border: "1px solid var(--border)",
                transition: "all 0.15s ease",
              }}
            >
              Help Center
            </Link>
          </div>
        </div>

        {/* Auto-redirect countdown */}
        <p
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            margin: 0,
          }}
        >
          Redirecting to homepage in{" "}
          <span style={{ fontWeight: 700, color: "var(--primary)" }}>
            {countdown}
          </span>{" "}
          seconds...
        </p>
      </div>

      <style>{`
        @media (max-width: 480px) {
          .error-404-page .error-404-number { font-size: 80px; }
        }
      `}</style>
    </div>
  );
}
