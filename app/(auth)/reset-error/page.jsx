"use client";

import Link from "next/link";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";

export default function ResetErrorPage() {
  const rightCard = (
    <div>
      <span className="badge badge-danger" style={{ fontSize: 9, marginBottom: 8, padding: "2px 6px" }}>
        Error
      </span>
      <p style={{ fontSize: 11, color: "white", margin: 0, fontWeight: 500, lineHeight: 1.4 }}>
        If this issue persists, please contact support at support@smartprice.io.
      </p>
    </div>
  );

  return (
    <AuthSplitLayout rightContent={rightCard} image="https://images.unsplash.com/photo-1607863680198-23d4b2565df6?q=80&w=800&h=600&auto=format&fit=crop">
      <div style={{ maxWidth: 360, margin: "auto", width: "100%", textAlign: "center" }}>
        {/* Error/Warning Icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "var(--danger-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            color: "var(--danger)",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        {/* Title */}
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>
          Invalid reset link
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 32, lineHeight: 1.6 }}>
          This password reset link is invalid or has expired. Please request a new password reset link.
        </p>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link href="/forgot-password" className="btn btn-primary" style={{ width: "100%", height: 44 }}>
            Request new link
          </Link>
          <Link href="/login" className="btn btn-ghost" style={{ width: "100%", height: 44 }}>
            Back to login
          </Link>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
