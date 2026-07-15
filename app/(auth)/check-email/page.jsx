"use client";

import Link from "next/link";
import AuthSplitLayout from "@/components/auth/AuthSplitLayout";

export default function CheckEmailPage() {
  const rightCard = (
    <div>
      <span className="badge badge-success" style={{ fontSize: 9, marginBottom: 8, padding: "2px 6px" }}>
        Secure Link
      </span>
      <p style={{ fontSize: 11, color: "white", margin: 0, fontWeight: 500, lineHeight: 1.4 }}>
        Check your spam folder if you do not receive the email within 5 minutes.
      </p>
    </div>
  );

  return (
    <AuthSplitLayout rightContent={rightCard}>
      <div style={{ maxWidth: 360, margin: "auto", width: "100%", textAlign: "center" }}>
        {/* Email Icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "var(--primary-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            color: "var(--primary)",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>

        {/* Title */}
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>
          Check your email
        </h2>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 32, lineHeight: 1.6 }}>
          We sent a password reset link to your email address. Please click the link in that email to reset your password.
        </p>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            onClick={() => window.open("mailto:")}
            className="btn btn-primary"
            style={{ width: "100%", height: 44 }}
          >
            Open email client
          </button>
          <Link href="/login" className="btn btn-ghost" style={{ width: "100%", height: 44 }}>
            Skip, I&apos;ll confirm later
          </Link>
        </div>

        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 32 }}>
          Didn&apos;t receive the email?{" "}
          <button
            onClick={() => console.log("Resend link")}
            style={{
              background: "none",
              border: "none",
              color: "var(--primary)",
              fontWeight: 600,
              cursor: "pointer",
              padding: 0,
              fontSize: "inherit",
              fontFamily: "inherit",
            }}
          >
            Click to resend
          </button>
        </p>
      </div>
    </AuthSplitLayout>
  );
}
