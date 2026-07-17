"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function ServerErrorPage({ error, reset }) {
  const [showDetails, setShowDetails] = useState(false);

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
        {/* Large decorative 500 */}
        <div
          style={{
            fontSize: 120,
            fontWeight: 900,
            lineHeight: 1,
          background: "linear-gradient(135deg, #ef4444, #dc2626)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
            marginBottom: 8,
            letterSpacing: "-0.04em",
          }}
        >
          500
        </div>

        <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>

        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "var(--text-primary)",
            margin: "0 0 8px",
          }}
        >
          Server Error
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
          Something went wrong on our end. Our team has been notified and we&apos;re working on
          a fix. Please try again shortly.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginBottom: 24,
          }}
        >
          {reset && (
            <button
              onClick={reset}
              className="btn btn-gradient btn-pill"
              style={{
                padding: "12px 28px",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
                fontFamily: "inherit",
              }}
            >
              ↻ Try Again
            </button>
          )}
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
        </div>

        {/* Error details toggle */}
        {error && (
          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => setShowDetails(!showDetails)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 500,
                textDecoration: "underline",
              }}
            >
              {showDetails ? "Hide technical details" : "Show technical details"}
            </button>
            {showDetails && (
              <pre
                style={{
                  marginTop: 12,
                  padding: 16,
                  borderRadius: 8,
                  background: "var(--bg-surface-2)",
                  border: "1px solid var(--border)",
                  fontSize: 11,
                  color: "var(--text-secondary)",
                  textAlign: "left",
                  overflowX: "auto",
                  maxHeight: 200,
                  lineHeight: 1.5,
                }}
              >
                {error.message || error.toString()}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
