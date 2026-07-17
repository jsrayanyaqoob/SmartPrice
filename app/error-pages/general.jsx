"use client";

import Link from "next/link";
import { useState } from "react";

export default function GeneralErrorPage({ error, reset, title, description }) {
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
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>

        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "var(--text-primary)",
            margin: "0 0 8px",
          }}
        >
          {title || "Something went wrong"}
        </h1>

        <p
          style={{
            fontSize: 14,
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            margin: "0 0 28px",
            maxWidth: 360,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {description ||
            "An unexpected error occurred. Please try again or contact support if the problem persists."}
        </p>

        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          {reset && (
            <button
              onClick={reset}
              className="btn btn-gradient btn-pill"
              style={{
                padding: "10px 24px",
                fontSize: 14,
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
            className="btn btn-primary btn-pill"
            style={{
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            ← Home
          </Link>
          <Link
            href="/help"
            className="btn btn-ghost btn-pill"
            style={{
              padding: "10px 24px",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Help Center
          </Link>
        </div>

        {error && (
          <div>
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
              {showDetails ? "Hide details" : "Technical details"}
            </button>
            {showDetails && (
              <pre
                style={{
                  marginTop: 12,
                  padding: 14,
                  borderRadius: 8,
                  background: "var(--bg-surface-2)",
                  border: "1px solid var(--border)",
                  fontSize: 11,
                  color: "var(--text-secondary)",
                  textAlign: "left",
                  overflowX: "auto",
                  maxHeight: 160,
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
