export default function AuthSplitLayout({ children, title, subtitle, rightContent }) {
  return (
    <div className="auth-layout">
      {/* Left Panel - Form */}
      <div className="auth-form-panel">
        <div className="auth-form-scroll">
          {children}
        </div>
      </div>

      {/* Right Panel - Visual */}
      <div className="auth-visual-panel">
        {/* Decorative floating icons */}
        <div style={{ position: "absolute", top: 40, left: 40, opacity: 0.5 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        </div>
        <div style={{ position: "absolute", bottom: 60, right: 60, opacity: 0.3 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </div>

        {/* Central visual area */}
        <div
          style={{
            width: "70%",
            maxWidth: 400,
            aspectRatio: "4/3",
            borderRadius: 16,
            background: "rgba(255,255,255,0.08)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>

        {/* Floating info card */}
        {rightContent && (
          <div
            style={{
              position: "absolute",
              bottom: 60,
              right: 40,
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 14,
              padding: "16px 20px",
              maxWidth: 260,
              color: "white",
            }}
          >
            {rightContent}
          </div>
        )}
      </div>
    </div>
  );
}
